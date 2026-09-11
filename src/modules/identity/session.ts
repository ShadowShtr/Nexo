import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

const membership = z.object({
  organization_id: z.uuid(), user_id: z.uuid(), role: z.enum(['owner', 'driver']),
});
export type Membership = z.infer<typeof membership>;

/** A verified identity for navigation. Every data request remains protected by RLS. */
export async function readIdentity(client: SupabaseClient): Promise<Membership[]> {
  const user = await client.auth.getUser();
  if (user.error || !user.data.user) return [];
  const result = await client.from('memberships').select('organization_id,user_id,role');
  if (result.error) throw new Error('IDENTITY_UNAVAILABLE');
  return z.array(membership).parse(result.data).filter(row => row.user_id === user.data.user.id);
}

export async function signIn(client: SupabaseClient, email: string, password: string): Promise<Membership[]> {
  const result = await client.auth.signInWithPassword({ email: email.trim(), password });
  if (result.error) throw new Error('SIGN_IN_FAILED', { cause: result.error.code });
  try {
    const memberships = await readIdentity(client);
    if (!memberships.length) throw new Error('ACCESS_UNAVAILABLE');
    return memberships;
  } catch (error) {
    await client.auth.signOut({ scope: 'local' });
    throw error;
  }
}
