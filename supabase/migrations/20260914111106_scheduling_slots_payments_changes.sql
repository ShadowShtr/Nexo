-- Calendar policies, payment ledger and immutable booking-change proposals.
-- Mutations are server-only; authenticated clients receive only filtered reads.

create table public.scheduling_windows (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  weekday smallint not null,
  starts_at time not null,
  ends_at time not null,
  slot_minutes integer not null default 60,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, weekday, starts_at),
  constraint scheduling_windows_weekday_check check (weekday between 1 and 7),
  constraint scheduling_windows_range_check check (ends_at > starts_at),
  constraint scheduling_windows_slot_check check (slot_minutes between 1 and 1440)
);

create table public.scheduling_exceptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  service_date date not null,
  kind text not null,
  windows_json jsonb not null default '[]'::jsonb,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, service_date),
  constraint scheduling_exceptions_kind_check check (kind in ('blocked', 'override')),
  constraint scheduling_exceptions_windows_check check (jsonb_typeof(windows_json) = 'array')
);

create table public.payment_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  booking_id uuid not null,
  driver_user_id uuid not null,
  phase text not null,
  direction text not null,
  amount_cents integer not null,
  currency text not null default 'EUR',
  provider_reference text not null,
  idempotency_key text not null,
  recorded_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (organization_id, provider_reference),
  unique (organization_id, idempotency_key),
  foreign key (organization_id, booking_id) references public.bookings(organization_id, id) on delete restrict,
  foreign key (organization_id, driver_user_id) references public.driver_profiles(organization_id, user_id),
  constraint payment_events_phase_check check (phase in ('deposit', 'balance', 'extra')),
  constraint payment_events_direction_check check (direction in ('charge', 'refund')),
  constraint payment_events_amount_check check (amount_cents > 0),
  constraint payment_events_currency_check check (currency = 'EUR'),
  constraint payment_events_reference_check check (length(trim(provider_reference)) between 6 and 200),
  constraint payment_events_key_check check (length(trim(idempotency_key)) between 16 and 200)
);

create table public.booking_change_proposals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  booking_id uuid not null,
  quote_id uuid not null,
  original_starts_at timestamptz not null,
  proposed_starts_at timestamptz not null,
  proposed_ends_at timestamptz not null,
  expected_booking_version integer not null,
  idempotency_key text not null,
  status text not null default 'proposed',
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, idempotency_key),
  foreign key (organization_id, booking_id) references public.bookings(organization_id, id) on delete cascade,
  foreign key (organization_id, quote_id) references public.quote_snapshots(organization_id, id),
  foreign key (organization_id, created_by) references public.memberships(organization_id, user_id),
  constraint booking_change_proposals_window_check check (proposed_ends_at > proposed_starts_at),
  constraint booking_change_proposals_version_check check (expected_booking_version > 0),
  constraint booking_change_proposals_status_check check (status in ('proposed', 'confirmed', 'expired', 'rejected')),
  constraint booking_change_proposals_key_check check (length(trim(idempotency_key)) between 16 and 200)
);

create index scheduling_windows_lookup_idx on public.scheduling_windows(organization_id, weekday, active);
create index scheduling_exceptions_lookup_idx on public.scheduling_exceptions(organization_id, service_date);
create index payment_events_booking_idx on public.payment_events(organization_id, booking_id, recorded_at);
create index booking_change_proposals_booking_idx on public.booking_change_proposals(organization_id, booking_id, created_at desc);

alter table public.scheduling_windows enable row level security;
alter table public.scheduling_exceptions enable row level security;
alter table public.payment_events enable row level security;
alter table public.booking_change_proposals enable row level security;

create policy owner_schedule_windows on public.scheduling_windows for select to authenticated using (
  exists (select 1 from public.memberships m where m.organization_id = scheduling_windows.organization_id and m.user_id = (select auth.uid()) and m.active and m.role = 'owner')
);
create policy owner_schedule_exceptions on public.scheduling_exceptions for select to authenticated using (
  exists (select 1 from public.memberships m where m.organization_id = scheduling_exceptions.organization_id and m.user_id = (select auth.uid()) and m.active and m.role = 'owner')
);
create policy owner_or_driver_payment_events on public.payment_events for select to authenticated using (
  driver_user_id = (select auth.uid())
  or exists (select 1 from public.memberships m where m.organization_id = payment_events.organization_id and m.user_id = (select auth.uid()) and m.active and m.role = 'owner')
);
create policy owner_or_assigned_driver_change_proposals on public.booking_change_proposals for select to authenticated using (
  exists (select 1 from public.memberships m where m.organization_id = booking_change_proposals.organization_id and m.user_id = (select auth.uid()) and m.active and m.role = 'owner')
  or exists (select 1 from public.bookings b where b.organization_id = booking_change_proposals.organization_id and b.id = booking_change_proposals.booking_id and b.driver_user_id = (select auth.uid()))
);

revoke all on table public.scheduling_windows, public.scheduling_exceptions, public.payment_events, public.booking_change_proposals from public, anon, authenticated;
grant select on table public.scheduling_windows, public.scheduling_exceptions, public.payment_events, public.booking_change_proposals to authenticated;
grant all on table public.scheduling_windows, public.scheduling_exceptions, public.payment_events, public.booking_change_proposals to service_role;
