import { z } from 'zod';

const inputSchema = z.object({
  email: z.string().trim().max(254).pipe(z.email()),
  displayName: z.string().trim().min(1).max(120),
  redirectTo: z.url(),
});

export type InviteActor = { userId:string; organizationId:string; role:'owner'|'driver'; active:boolean };
export type DriverInviteInput = z.infer<typeof inputSchema>;
export interface DriverInviteGateway {
  invite(email:string,redirectTo:string):Promise<{userId:string}>;
  removeInvitedUser(userId:string):Promise<void>;
  createMembership(input:{organizationId:string;userId:string;displayName:string}):Promise<void>;
}

export async function inviteDriver(actor:InviteActor,input:DriverInviteInput,gateway:DriverInviteGateway) {
  if (!actor.active || actor.role !== 'owner') throw new Error('FORBIDDEN');
  const parsed = inputSchema.parse(input);
  const email = parsed.email.trim().toLowerCase();
  const invited = await gateway.invite(email,parsed.redirectTo);
  try {
    await gateway.createMembership({organizationId:actor.organizationId,userId:invited.userId,displayName:parsed.displayName});
    return {userId:invited.userId,email};
  } catch (error) {
    await gateway.removeInvitedUser(invited.userId).catch(()=>undefined);
    throw error;
  }
}
