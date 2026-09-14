import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
import { inviteDriver } from '../../src/application/invite-driver.ts';
import { supabaseDriverInviteGateway } from '../../src/infrastructure/supabase/driver-invitations.ts';

const status = JSON.parse(execFileSync(process.execPath,
  ['node_modules/supabase/dist/supabase.js', 'status', '-o', 'json'],
  { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));
assert.equal(status.API_URL, 'http://127.0.0.1:55421');
const dbUrl = new URL(status.DB_URL);
assert.equal(dbUrl.hostname, '127.0.0.1');
assert.equal(dbUrl.port, '55422');

const authOptions = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };
const admin = createClient(status.API_URL, status.SERVICE_ROLE_KEY, authOptions);
const publicClient = () => createClient(status.API_URL, status.ANON_KEY, authOptions);
const db = new pg.Client({ connectionString: status.DB_URL });
const ids = {
  organization: randomUUID(), owner: randomUUID(), driver: randomUUID(), customer: randomUUID(), vehicle: randomUUID(), quote: randomUUID(),
  bookingA: randomUUID(), bookingB: randomUUID(), bookingRollback: randomUUID(),
};
const password = `Local-operational-${randomUUID()}!`;
const actors = [];

async function createActor(role, userId) {
  const email = `${role}-${randomUUID()}@example.invalid`;
  const result = await admin.auth.admin.createUser({ id: userId, email, password, email_confirm: true });
  assert.equal(result.error, null);
  const api = publicClient();
  assert.equal((await api.auth.signInWithPassword({ email, password })).error, null);
  actors.push({ id: userId, api });
}

async function insertBooking(client, id, reference, start, end) {
  await client.query(`insert into public.bookings(
    id,organization_id,reference,customer_id,quote_id,driver_user_id,vehicle_id,status,
    starts_at,ends_at,hold_expires_at,pickup_json,destination_json,original_starts_at
  ) values($1,$2,$3,$4,$5,$6,$7,'requested',$8,$9,$10,'{"label":"Lisboa"}','{"label":"Cascais"}',$8)`,
  [id,ids.organization,reference,ids.customer,ids.quote,ids.driver,ids.vehicle,start,end,new Date(Date.parse(start)+30*60_000).toISOString()]);
}

before(async () => {
  await db.connect();
  await createActor('owner', ids.owner);
  await createActor('driver', ids.driver);
  await db.query('insert into public.organizations(id,name) values($1,$2)', [ids.organization,'Operational fixture']);
  await db.query("insert into public.memberships(organization_id,user_id,role) values($1,$2,'owner'),($1,$3,'driver')", [ids.organization,ids.owner,ids.driver]);
  await db.query(`insert into public.driver_profiles(
    organization_id,user_id,display_name,display_name_en,biography_pt,biography_en,phone,photo_path,languages,status,published_at
  ) values($1,$2,'Motorista Teste','Test Driver','Perfil fictício','Fictional profile','910000000','test/driver.jpg',array['pt-PT','en'],'active',now())`, [ids.organization,ids.driver]);
  await db.query(`insert into public.vehicles(id,organization_id,registration,make,model,passenger_capacity,status)
    values($1,$2,'00-AA-00','Mercedes-Benz','Classe E',4,'active')`, [ids.vehicle,ids.organization]);
  await db.query(`insert into public.driver_vehicle_assignments(organization_id,driver_user_id,vehicle_id,starts_at)
    values($1,$2,$3,'2026-01-01T00:00:00Z')`, [ids.organization,ids.driver,ids.vehicle]);
  await db.query(`insert into public.customer_records(id,organization_id,full_name,email,phone,nif)
    values($1,$2,'Cliente Teste','cliente@example.invalid','910000001','123456789')`, [ids.customer,ids.organization]);
  await db.query(`insert into public.scheduling_policy_versions(organization_id,version,author_user_id,values_json)
    values($1,1,$2,'{"deposit_percent":25}')`, [ids.organization,ids.owner]);
  await db.query(`insert into public.quote_snapshots(
    id,organization_id,customer_id,driver_user_id,vehicle_id,settings_version,service_kind,
    route_json,lines_json,total_cents,deposit_cents,balance_cents,valid_until
  ) values($1,$2,$3,$4,$5,1,'transfer','{"distance_m":35000}','[{"code":"distance","cents":12000}]',12000,3000,9000,'2027-01-01T00:00:00Z')`,
  [ids.quote,ids.organization,ids.customer,ids.driver,ids.vehicle]);
  await insertBooking(db,ids.bookingA,'TEST-OP-A','2026-10-01T09:00:00Z','2026-10-01T10:30:00Z');
  await insertBooking(db,ids.bookingB,'TEST-OP-B','2026-10-01T09:30:00Z','2026-10-01T11:00:00Z');
});

after(async () => {
  for (const table of ['outbox_events','resource_allocations','request_commands','bookings','quote_snapshots','driver_vehicle_assignments','vehicles','customer_records','scheduling_policy_versions','driver_profiles','memberships'])
    await db.query(`delete from public.${table} where organization_id=$1`,[ids.organization]);
  await db.query('delete from public.organizations where id=$1',[ids.organization]);
  for (const actor of actors) { await actor.api.auth.signOut(); await admin.auth.admin.deleteUser(actor.id); }
  await db.end();
});

test('concurrent overlapping allocations leave exactly one active booking', async () => {
  const first = new pg.Client({ connectionString: status.DB_URL });
  const second = new pg.Client({ connectionString: status.DB_URL });
  await Promise.all([first.connect(),second.connect()]);
  try {
    await first.query('begin');
    await second.query('begin');
    const holdUntil = '2026-10-01T08:30:00Z';
    await first.query(`insert into public.resource_allocations(organization_id,booking_id,driver_user_id,starts_at,ends_at,hold_expires_at)
      values($1,$2,$3,'2026-10-01T09:00:00Z','2026-10-01T10:30:00Z',$4)`,[ids.organization,ids.bookingA,ids.driver,holdUntil]);
    const competing = second.query(`insert into public.resource_allocations(organization_id,booking_id,driver_user_id,starts_at,ends_at,hold_expires_at)
      values($1,$2,$3,'2026-10-01T09:30:00Z','2026-10-01T11:00:00Z',$4)`,[ids.organization,ids.bookingB,ids.driver,holdUntil]);
    await new Promise(resolve=>setTimeout(resolve,100));
    await first.query('commit');
    await assert.rejects(competing,error => error.code === '23P01');
    await second.query('rollback');
    const count = await db.query("select count(*)::int as count from public.resource_allocations where organization_id=$1 and state='hold'",[ids.organization]);
    assert.equal(count.rows[0].count,1);
  } finally {
    await Promise.all([first.end(),second.end()]);
  }
});

test('rollback removes booking, allocation, command and outbox together', async () => {
  await db.query('begin');
  try {
    await insertBooking(db,ids.bookingRollback,'TEST-ROLLBACK','2026-10-02T09:00:00Z','2026-10-02T10:30:00Z');
    await db.query(`insert into public.resource_allocations(organization_id,booking_id,vehicle_id,starts_at,ends_at,hold_expires_at)
      values($1,$2,$3,'2026-10-02T09:00:00Z','2026-10-02T10:30:00Z','2026-10-02T08:30:00Z')`,[ids.organization,ids.bookingRollback,ids.vehicle]);
    await db.query(`insert into public.request_commands(organization_id,idempotency_key,payload_hash,booking_id)
      values($1,$2,$3,$4)`,[ids.organization,'operational-rollback-key',createHash('sha256').update('rollback').digest('hex'),ids.bookingRollback]);
    await db.query(`insert into public.outbox_events(organization_id,aggregate_type,aggregate_id,event_type,payload_json)
      values($1,'booking',$2,'booking.requested','{}')`,[ids.organization,ids.bookingRollback]);
  } finally {
    await db.query('rollback');
  }
  for (const [table,column] of [['bookings','id'],['resource_allocations','booking_id'],['request_commands','booking_id'],['outbox_events','aggregate_id']]) {
    const result = await db.query(`select count(*)::int as count from public.${table} where ${column}=$1`,[ids.bookingRollback]);
    assert.equal(result.rows[0].count,0,table);
  }
});

test('owner reads organization bookings; assigned driver reads own booking but no quotes', async () => {
  const ownerRows = await actors[0].api.from('bookings').select('id');
  assert.equal(ownerRows.error,null);
  assert.equal(ownerRows.data.length,2);
  const driverRows = await actors[1].api.from('bookings').select('id');
  assert.equal(driverRows.error,null);
  assert.equal(driverRows.data.length,2);
  assert.ok((await actors[1].api.from('bookings').select('internal_note')).error);
  const quotes = await actors[1].api.from('quote_snapshots').select('id');
  assert.ok(quotes.error);
});

test('anonymous role has no operational table grants', async () => {
  const anon = publicClient();
  for (const table of ['vehicles','driver_vehicle_assignments','quote_snapshots','bookings','resource_allocations','request_commands','outbox_events'])
    assert.ok((await anon.from(table).select('*')).error, table);
});

test('owner invitation creates a private driver membership and draft profile', async () => {
  const gateway = supabaseDriverInviteGateway(admin);
  const email = `invited-${randomUUID()}@example.invalid`;
  const result = await inviteDriver({userId:ids.owner,organizationId:ids.organization,role:'owner',active:true},{
    email,displayName:'Parceiro Convidado',redirectTo:'http://127.0.0.1:5173',
  },gateway);
  try {
    const membership = await db.query('select role from public.memberships where organization_id=$1 and user_id=$2',[ids.organization,result.userId]);
    const profile = await db.query('select status,display_name from public.driver_profiles where organization_id=$1 and user_id=$2',[ids.organization,result.userId]);
    assert.deepEqual(membership.rows,[{role:'driver'}]);
    assert.deepEqual(profile.rows,[{status:'draft',display_name:'Parceiro Convidado'}]);
  } finally {
    await gateway.removeInvitedUser(result.userId);
  }
});
