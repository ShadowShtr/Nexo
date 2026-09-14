import type { SupabaseClient } from '@supabase/supabase-js';
import type { DriverInviteGateway } from '../../application/invite-driver';

/** Server-only adapter. The supplied client must use a Supabase secret key and must never reach browser code. */
export function supabaseDriverInviteGateway(admin:SupabaseClient):DriverInviteGateway {
  return {
    async invite(email,redirectTo) {
      const invitationUrl = new URL(redirectTo);invitationUrl.searchParams.set('invite','1');
      const result = await admin.auth.admin.inviteUserByEmail(email,{redirectTo:invitationUrl.toString()});
      if (result.error || !result.data.user) throw new Error('INVITE_FAILED',{cause:result.error});
      return {userId:result.data.user.id};
    },
    async removeInvitedUser(userId) {
      await admin.from('driver_profiles').delete().eq('user_id',userId);
      await admin.from('memberships').delete().eq('user_id',userId);
      const result = await admin.auth.admin.deleteUser(userId);
      if (result.error) throw new Error('INVITE_COMPENSATION_FAILED',{cause:result.error});
    },
    async createMembership({organizationId,userId,displayName}) {
      const membership = await admin.from('memberships').insert({organization_id:organizationId,user_id:userId,role:'driver'});
      if (membership.error) throw new Error('MEMBERSHIP_CREATE_FAILED',{cause:membership.error});
      const profile = await admin.from('driver_profiles').insert({organization_id:organizationId,user_id:userId,display_name:displayName,status:'draft'});
      if (profile.error) throw new Error('PROFILE_CREATE_FAILED',{cause:profile.error});
    },
  };
}
