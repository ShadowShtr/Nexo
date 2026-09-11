import type { Pool, PoolClient } from 'pg';
import type { ReservationTransaction, UnitOfWork } from '../../application/reservation-ports.ts';
import type { Actor, PreparedRequest, Receipt } from '../../contracts/reservation.ts';
import type { Allocation, CalendarRules } from '../../domain/calendar.ts';

class Transaction implements ReservationTransaction {
  private db: PoolClient; private organizationId: string;
  constructor(db: PoolClient, organizationId: string) { this.db=db; this.organizationId=organizationId; }
  async authorizeOwner(actor: Actor) {
    const { rows } = await this.db.query('select role,active from pm_proof.memberships where organization_id=$1 and user_id=$2 for share', [this.organizationId, actor.userId]);
    if (actor.organizationId !== this.organizationId || rows[0]?.role !== 'owner' || !rows[0]?.active) throw new Error('Forbidden');
  }
  async claimCommand(key: string, hash: string): Promise<Receipt | null> {
    // This insert waits for a competing uncommitted key, including across different resources.
    await this.db.query('insert into pm_proof.commands(organization_id,key,request_hash) values($1,$2,$3) on conflict do nothing', [this.organizationId,key,hash]);
    const { rows } = await this.db.query('select request_hash,result from pm_proof.commands where organization_id=$1 and key=$2 for update', [this.organizationId,key]);
    if(rows[0].request_hash !== hash) throw new Error('Idempotency key reused with different input');
    return rows[0].result;
  }
  async lockResources(driverId: string, vehicleId: string) {
    const { rows } = await this.db.query('select id,kind,active from pm_proof.resources where organization_id=$1 and id=any($2::uuid[]) order by id for update', [this.organizationId,[driverId,vehicleId]]);
    if(rows.length !== 2 || !rows.every(r => r.active) || !rows.some(r=>r.id===driverId && r.kind==='driver') || !rows.some(r=>r.id===vehicleId && r.kind==='vehicle')) throw new Error('Unavailable resources');
  }
  async rules() {
    const {rows} = await this.db.query('select version,minimum_gap,tolerance from pm_proof.settings where organization_id=$1 for share', [this.organizationId]);
    if(!rows[0]) throw new Error('Missing calendar settings');
    return {version:rows[0].version,minimumGapMinutes:rows[0].minimum_gap,delayAllowanceMinutes:rows[0].tolerance};
  }
  async now() {
    const {rows} = await this.db.query('select clock_timestamp() as now');
    return rows[0].now.toISOString();
  }
  async allocations(driverId: string, vehicleId: string): Promise<Allocation[]> {
    const {rows} = await this.db.query('select * from pm_proof.bookings where organization_id=$1 and (driver_id=$2 or vehicle_id=$3)', [this.organizationId,driverId,vehicleId]);
    return rows.map(row => ({id:row.id,driverId:row.driver_id,vehicleId:row.vehicle_id,startsAt:row.starts_at.toISOString(),endsAt:row.ends_at.toISOString(),status:row.status,holdExpiresAt:row.expires_at.toISOString()}));
  }
  async insert(request: PreparedRequest, receipt: Receipt, rules: CalendarRules & {version:number}) {
    await this.db.query('insert into pm_proof.bookings(organization_id,id,driver_id,vehicle_id,starts_at,ends_at,expires_at,status,quote_snapshot,policy_snapshot) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)', [this.organizationId,receipt.id,request.driverId,request.vehicleId,request.startsAt,request.endsAt,receipt.expiresAt,receipt.status,JSON.stringify(request.quote),JSON.stringify(rules)]);
    await this.db.query('insert into pm_proof.allocations(organization_id,booking_id,resource_id) values($1,$2,$3),($1,$2,$4)', [this.organizationId,receipt.id,request.driverId,request.vehicleId]);
    await this.db.query('insert into pm_proof.outbox(organization_id,booking_id,event_type,payload) values($1,$2,$3,$4)', [this.organizationId,receipt.id,'booking.requested',JSON.stringify({bookingId:receipt.id})]);
  }
  async completeCommand(key: string, receipt: Receipt) {
    await this.db.query('update pm_proof.commands set result=$3 where organization_id=$1 and key=$2', [this.organizationId,key,JSON.stringify(receipt)]);
  }
}
/** Trusted backend only, disposable pm_proof schema. Every scheduling writer must use these locks. */
export class PostgresProofUnitOfWork implements UnitOfWork {
  private pool: Pool;
  constructor(pool: Pool) { this.pool=pool; }
  async run<T>(organizationId:string, action:(tx:ReservationTransaction)=>Promise<T>): Promise<T> {
    const db = await this.pool.connect();
    try {
      await db.query('begin isolation level read committed');
      await db.query("set local lock_timeout='5s'");
      await db.query("set local statement_timeout='10s'");
      const result = await action(new Transaction(db,organizationId));
      await db.query('commit');
      return result;
    } catch(error) { await db.query('rollback'); throw error; }
    finally { db.release(); }
  }
}
