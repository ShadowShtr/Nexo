import test from 'node:test';
import assert from 'node:assert/strict';
import { inviteDriver, type DriverInviteGateway } from '../src/application/invite-driver.ts';

const owner = {userId:'00000000-0000-4000-8000-000000000001',organizationId:'00000000-0000-4000-8000-000000000002',role:'owner' as const,active:true};
function fake(failMembership=false) {
  const calls:string[]=[];
  const gateway:DriverInviteGateway={
    async invite(email){calls.push(`invite:${email}`);return {userId:'00000000-0000-4000-8000-000000000003'};},
    async createMembership(input){calls.push(`membership:${input.organizationId}:${input.displayName}`);if(failMembership)throw new Error('db');},
    async removeInvitedUser(id){calls.push(`remove:${id}`);},
  };
  return {gateway,calls};
}
test('owner privately invites a normalized email into own organization',async()=>{
  const {gateway,calls}=fake();
  const result=await inviteDriver(owner,{email:'  PARCEIRO@example.com ',displayName:'Miguel Costa',redirectTo:'https://app.example.com/welcome'},gateway);
  assert.equal(result.email,'parceiro@example.com');
  assert.deepEqual(calls,['invite:parceiro@example.com',`membership:${owner.organizationId}:Miguel Costa`]);
});
test('driver cannot invite and no admin call is made',async()=>{
  const {gateway,calls}=fake();
  await assert.rejects(inviteDriver({...owner,role:'driver'},{email:'x@example.com',displayName:'X',redirectTo:'https://app.example.com/welcome'},gateway),/FORBIDDEN/);
  assert.deepEqual(calls,[]);
});
test('membership failure removes the orphan Auth user',async()=>{
  const {gateway,calls}=fake(true);
  await assert.rejects(inviteDriver(owner,{email:'x@example.com',displayName:'X',redirectTo:'https://app.example.com/welcome'},gateway),/db/);
  assert.equal(calls.at(-1),'remove:00000000-0000-4000-8000-000000000003');
});
