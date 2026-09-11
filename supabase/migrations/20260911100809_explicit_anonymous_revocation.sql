-- pg-delta omitted the anon ACL removal from the initial generated migration.
-- Keep the original immutable and enforce privileges independent of defaults.
revoke all on table public.organizations, public.memberships,
  public.driver_profiles, public.customer_records, public.scheduling_policy_versions
  from public, anon;
