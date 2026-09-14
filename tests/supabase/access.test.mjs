import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
import { readIdentity, signIn } from '../../src/modules/identity/session.ts';

// Never accepts a remote URL or a linked project. Secrets stay in process memory.
const status = JSON.parse(execFileSync(process.execPath,
  ['node_modules/supabase/dist/supabase.js', 'status', '-o', 'json'],
  { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));
assert.equal(status.API_URL, 'http://127.0.0.1:55421');
const dbUrl = new URL(status.DB_URL);
assert.equal(dbUrl.hostname, '127.0.0.1');
assert.equal(dbUrl.port, '55422');
const options = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };
const client = () => createClient(status.API_URL, status.ANON_KEY, options);
const admin = createClient(status.API_URL, status.SERVICE_ROLE_KEY, options);
const db = new pg.Client({ connectionString: status.DB_URL });
const organizations = [randomUUID(), randomUUID()];
const actors = [];
const password = `Local-test-${randomUUID()}!`;

before(async () => {
  await db.connect();
  for (const id of organizations) await db.query('insert into public.organizations(id,name) values($1,$2)', [id,'Fictional access test']);
  for (const [role, organization] of [['owner',0],['driver',0],['driver',0],['owner',1]]) {
    const email = `test-${randomUUID()}@example.invalid`;
    const {data,error} = await admin.auth.admin.createUser({email,password,email_confirm:true});
    assert.equal(error,null);
    const actor = {id:data.user.id,email,role,organization,api:client()};
    actors.push(actor);
    await db.query('insert into public.memberships(organization_id,user_id,role) values($1,$2,$3)', [organizations[organization],actor.id,role]);
    await db.query('insert into public.driver_profiles(organization_id,user_id,display_name) values($1,$2,$3)', [organizations[organization],actor.id,'Fictional driver']);
    const identity = await signIn(actor.api,email,password);
    assert.equal(identity[0].role,role);
  }
  for (const org of organizations) {
    await db.query('insert into public.customer_records(organization_id,full_name) values($1,$2)',[org,'Fictional customer']);
    await db.query('insert into public.scheduling_policy_versions(organization_id,version) values($1,1)',[org]);
  }
});
after(async () => {
  for (const table of ['customer_records','scheduling_policy_versions','driver_profiles','memberships','organizations']) {
    await db.query(`delete from public.${table} where ${table === 'organizations' ? 'id' : 'organization_id'} = any($1::uuid[])`,[organizations]);
  }
  for (const actor of actors) { await actor.api.auth.signOut(); await admin.auth.admin.deleteUser(actor.id); }
  await db.end();
});
async function rows(api,table) {
  const result = await api.from(table).select('*');
  assert.equal(result.error,null);
  return result.data;
}
test('owner sees only own organization, drivers, CRM and policy',async () => {
  const owner = actors[0].api;
  assert.equal((await rows(owner,'driver_profiles')).length,3);
  for (const table of ['organizations','customer_records','scheduling_policy_versions']) {
    const data = await rows(owner,table);
    assert.equal(data.length,1);
    assert.equal(data[0].organization_id ?? data[0].id,organizations[0]);
  }
});
test('driver cannot read colleague, CRM or settings through direct API calls',async () => {
  const driver = actors[1];
  assert.deepEqual((await rows(driver.api,'driver_profiles')).map(row=>row.user_id),[driver.id]);
  assert.deepEqual(await rows(driver.api,'customer_records'),[]);
  assert.deepEqual(await rows(driver.api,'scheduling_policy_versions'),[]);
  const other = await driver.api.from('driver_profiles').select('*').eq('user_id',actors[2].id);
  assert.deepEqual(other.data,[]);
});
test('anonymous access and public signup are rejected',async () => {
  const anon = client();
  for (const table of ['organizations','memberships','driver_profiles','customer_records','scheduling_policy_versions']) {
    assert.ok((await anon.from(table).select('*')).error);
  }
  assert.ok((await anon.auth.signUp({email:`blocked-${randomUUID()}@example.invalid`,password})).error);
});
test('editable user metadata cannot grant owner permissions',async () => {
  const driver = actors[1].api;
  assert.equal((await driver.auth.updateUser({data:{role:'owner',organization_id:organizations[1]}})).error,null);
  await driver.auth.refreshSession();
  assert.deepEqual(await rows(driver,'customer_records'),[]);
  assert.deepEqual((await rows(driver,'memberships')).map(row=>row.role),['driver']);
});
test('clients cannot promote memberships or write records outside audited server cases',async () => {
  for (const actor of actors.slice(0,2)) {
    assert.ok((await actor.api.from('memberships').update({role:'owner'}).eq('user_id',actors[1].id)).error);
    assert.ok((await actor.api.from('customer_records').insert({organization_id:organizations[1],full_name:'Blocked'})).error);
    assert.ok((await actor.api.from('scheduling_policy_versions').update({minimum_gap_minutes:0}).eq('version',1)).error);
  }
});
test('revoking membership removes access even with an existing token',async () => {
  const actor = actors[2];
  await db.query('update public.memberships set active=false where organization_id=$1 and user_id=$2',[organizations[0],actor.id]);
  assert.deepEqual(await rows(actor.api,'memberships'),[]);
  assert.deepEqual(await rows(actor.api,'driver_profiles'),[]);
  assert.deepEqual(await rows(actor.api,'organizations'),[]);
  assert.deepEqual(await readIdentity(actor.api),[]);
  await assert.rejects(signIn(actor.api,actor.email,password),/ACCESS_UNAVAILABLE/);
});
test('all application tables have RLS and no anonymous table grants',async () => {
  const result = await db.query("select relname,relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r'");
  assert.deepEqual(result.rows.map(row=>row.relname).sort(),[
    'bookings','customer_records','driver_profiles','driver_vehicle_assignments','memberships',
    'organizations','outbox_events','quote_snapshots','request_commands','resource_allocations',
    'scheduling_policy_versions','vehicles',
  ]);
  assert.ok(result.rows.every(row=>row.relrowsecurity));
  for (const {relname} of result.rows) {
    const grants = await db.query("select has_table_privilege('anon',$1,'SELECT') as allowed", [`public.${relname}`]);
    assert.equal(grants.rows[0].allowed,false);
  }
});
