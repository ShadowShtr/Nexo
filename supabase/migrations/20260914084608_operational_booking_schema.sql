-- Operational foundation for resources, immutable quotes, bookings and the outbox.
-- Browser roles are read-only and row-filtered. Mutations belong to audited server cases.

create extension if not exists btree_gist with schema extensions;

alter table public.customer_records
  add column email text,
  add column phone text,
  add column nif text,
  add column locale text not null default 'pt-PT',
  add column notes text,
  add column updated_at timestamptz not null default now(),
  add constraint customer_records_email_check check (email is null or length(trim(email)) between 3 and 254),
  add constraint customer_records_phone_check check (phone is null or length(trim(phone)) between 7 and 30),
  add constraint customer_records_nif_check check (nif is null or nif ~ '^[0-9]{9}$'),
  add constraint customer_records_locale_check check (locale in ('pt-PT', 'en'));

alter table public.customer_records
  add constraint customer_records_organization_id_id_key unique (organization_id, id);

alter table public.driver_profiles
  add column display_name_en text,
  add column biography_pt text,
  add column biography_en text,
  add column phone text,
  add column photo_path text,
  add column languages text[] not null default array['pt-PT']::text[],
  add column status text not null default 'draft',
  add column published_at timestamptz,
  add column updated_at timestamptz not null default now(),
  add constraint driver_profiles_status_check check (status in ('draft', 'active', 'inactive')),
  add constraint driver_profiles_publishable_check check (
    status <> 'active' or (
      length(trim(display_name)) > 0 and
      display_name_en is not null and length(trim(display_name_en)) > 0 and
      biography_pt is not null and length(trim(biography_pt)) > 0 and
      biography_en is not null and length(trim(biography_en)) > 0 and
      phone is not null and length(trim(phone)) >= 7 and
      photo_path is not null and length(trim(photo_path)) > 0 and
      cardinality(languages) > 0 and
      published_at is not null
    )
  );

alter table public.scheduling_policy_versions
  add column status text not null default 'published',
  add column effective_at timestamptz not null default now(),
  add column values_json jsonb not null default '{}'::jsonb,
  add column author_user_id uuid,
  add constraint scheduling_policy_versions_status_check check (status in ('draft', 'published', 'retired')),
  add constraint scheduling_policy_versions_values_check check (jsonb_typeof(values_json) = 'object'),
  add constraint scheduling_policy_versions_author_fkey foreign key (organization_id, author_user_id)
    references public.memberships(organization_id, user_id);

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  registration text not null,
  make text not null,
  model text not null,
  passenger_capacity integer not null,
  luggage_capacity integer not null default 0,
  amenities jsonb not null default '[]'::jsonb,
  minimum_notice_hours integer not null default 2,
  supplement_cents integer not null default 0,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (organization_id, registration),
  constraint vehicles_registration_check check (length(trim(registration)) between 2 and 20),
  constraint vehicles_make_check check (length(trim(make)) between 1 and 80),
  constraint vehicles_model_check check (length(trim(model)) between 1 and 80),
  constraint vehicles_capacity_check check (passenger_capacity between 1 and 20),
  constraint vehicles_luggage_check check (luggage_capacity between 0 and 30),
  constraint vehicles_notice_check check (minimum_notice_hours between 0 and 8760),
  constraint vehicles_supplement_check check (supplement_cents between 0 and 100000000),
  constraint vehicles_amenities_check check (jsonb_typeof(amenities) = 'array'),
  constraint vehicles_status_check check (status in ('draft', 'active', 'inactive', 'maintenance'))
);

create table public.driver_vehicle_assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  driver_user_id uuid not null,
  vehicle_id uuid not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (organization_id, driver_user_id) references public.driver_profiles(organization_id, user_id),
  foreign key (organization_id, vehicle_id) references public.vehicles(organization_id, id),
  constraint driver_vehicle_assignment_window_check check (ends_at is null or ends_at > starts_at),
  unique (organization_id, driver_user_id, vehicle_id, starts_at)
);

create table public.quote_snapshots (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  customer_id uuid,
  driver_user_id uuid not null,
  vehicle_id uuid not null,
  settings_version integer not null,
  service_kind text not null,
  route_json jsonb not null,
  lines_json jsonb not null,
  total_cents integer not null,
  deposit_cents integer not null,
  balance_cents integer not null,
  valid_until timestamptz not null,
  created_at timestamptz not null default now(),
  unique (organization_id, id),
  foreign key (organization_id, customer_id) references public.customer_records(organization_id, id),
  foreign key (organization_id, driver_user_id) references public.driver_profiles(organization_id, user_id),
  foreign key (organization_id, vehicle_id) references public.vehicles(organization_id, id),
  foreign key (organization_id, settings_version) references public.scheduling_policy_versions(organization_id, version),
  constraint quote_snapshots_kind_check check (service_kind in ('transfer', 'tour')),
  constraint quote_snapshots_route_check check (jsonb_typeof(route_json) = 'object'),
  constraint quote_snapshots_lines_check check (jsonb_typeof(lines_json) = 'array'),
  constraint quote_snapshots_money_check check (
    total_cents >= 0 and deposit_cents >= 0 and balance_cents >= 0 and
    deposit_cents + balance_cents = total_cents
  ),
  constraint quote_snapshots_validity_check check (valid_until > created_at)
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  reference text not null,
  customer_id uuid not null,
  quote_id uuid not null,
  driver_user_id uuid not null,
  vehicle_id uuid not null,
  status text not null default 'requested',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  hold_expires_at timestamptz,
  pickup_json jsonb not null,
  destination_json jsonb not null,
  stops_json jsonb not null default '[]'::jsonb,
  customer_note text,
  internal_note text,
  original_starts_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  cancelled_at timestamptz,
  unique (organization_id, id),
  unique (organization_id, reference),
  foreign key (organization_id, customer_id) references public.customer_records(organization_id, id),
  foreign key (organization_id, quote_id) references public.quote_snapshots(organization_id, id),
  foreign key (organization_id, driver_user_id) references public.driver_profiles(organization_id, user_id),
  foreign key (organization_id, vehicle_id) references public.vehicles(organization_id, id),
  constraint bookings_reference_check check (reference ~ '^[A-Z0-9-]{6,30}$'),
  constraint bookings_status_check check (status in ('requested', 'confirmed', 'in_progress', 'completed', 'cancelled', 'expired')),
  constraint bookings_window_check check (ends_at > starts_at),
  constraint bookings_original_check check (original_starts_at <= starts_at or status in ('cancelled', 'completed')),
  constraint bookings_hold_check check ((status <> 'requested') or hold_expires_at is not null),
  constraint bookings_pickup_check check (jsonb_typeof(pickup_json) = 'object'),
  constraint bookings_destination_check check (jsonb_typeof(destination_json) = 'object'),
  constraint bookings_stops_check check (jsonb_typeof(stops_json) = 'array')
);

create table public.resource_allocations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  booking_id uuid not null,
  driver_user_id uuid,
  vehicle_id uuid,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  state text not null default 'hold',
  hold_expires_at timestamptz,
  service_window tstzrange generated always as (tstzrange(starts_at, ends_at, '[)')) stored,
  created_at timestamptz not null default now(),
  unique (organization_id, booking_id, driver_user_id, vehicle_id),
  foreign key (organization_id, booking_id) references public.bookings(organization_id, id) on delete cascade,
  foreign key (organization_id, driver_user_id) references public.driver_profiles(organization_id, user_id),
  foreign key (organization_id, vehicle_id) references public.vehicles(organization_id, id),
  constraint resource_allocations_one_resource_check check ((driver_user_id is null) <> (vehicle_id is null)),
  constraint resource_allocations_window_check check (ends_at > starts_at),
  constraint resource_allocations_state_check check (state in ('hold', 'confirmed', 'in_progress', 'released', 'completed')),
  constraint resource_allocations_hold_check check (state <> 'hold' or hold_expires_at is not null),
  exclude using gist (organization_id with =, driver_user_id with =, service_window with &&)
    where (driver_user_id is not null and state in ('hold', 'confirmed', 'in_progress')),
  exclude using gist (organization_id with =, vehicle_id with =, service_window with &&)
    where (vehicle_id is not null and state in ('hold', 'confirmed', 'in_progress'))
);

create table public.request_commands (
  organization_id uuid not null references public.organizations(id),
  idempotency_key text not null,
  payload_hash text not null,
  booking_id uuid,
  result_json jsonb,
  created_at timestamptz not null default now(),
  primary key (organization_id, idempotency_key),
  foreign key (organization_id, booking_id) references public.bookings(organization_id, id),
  constraint request_commands_key_check check (length(idempotency_key) between 16 and 200),
  constraint request_commands_hash_check check (payload_hash ~ '^[a-f0-9]{64}$'),
  constraint request_commands_result_check check (result_json is null or jsonb_typeof(result_json) = 'object')
);

create table public.outbox_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  aggregate_type text not null,
  aggregate_id uuid not null,
  event_type text not null,
  payload_json jsonb not null,
  status text not null default 'pending',
  attempts integer not null default 0,
  available_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  processed_at timestamptz,
  constraint outbox_events_payload_check check (jsonb_typeof(payload_json) = 'object'),
  constraint outbox_events_status_check check (status in ('pending', 'processing', 'processed', 'failed')),
  constraint outbox_events_attempts_check check (attempts between 0 and 1000)
);

create index vehicles_organization_status_idx on public.vehicles(organization_id, status);
create index driver_vehicle_assignments_lookup_idx on public.driver_vehicle_assignments(organization_id, driver_user_id, starts_at, ends_at);
create index quote_snapshots_customer_idx on public.quote_snapshots(organization_id, customer_id, created_at desc);
create index bookings_schedule_idx on public.bookings(organization_id, starts_at, ends_at) where status in ('requested', 'confirmed', 'in_progress');
create index bookings_driver_schedule_idx on public.bookings(organization_id, driver_user_id, starts_at);
create index bookings_vehicle_schedule_idx on public.bookings(organization_id, vehicle_id, starts_at);
create index allocations_booking_idx on public.resource_allocations(organization_id, booking_id);
create index outbox_pending_idx on public.outbox_events(status, available_at, created_at) where status in ('pending', 'failed');

alter table public.vehicles enable row level security;
alter table public.driver_vehicle_assignments enable row level security;
alter table public.quote_snapshots enable row level security;
alter table public.bookings enable row level security;
alter table public.resource_allocations enable row level security;
alter table public.request_commands enable row level security;
alter table public.outbox_events enable row level security;

create policy owner_or_assigned_driver_vehicles on public.vehicles for select to authenticated using (
  exists (select 1 from public.memberships m where m.organization_id = vehicles.organization_id and m.user_id = (select auth.uid()) and m.active and m.role = 'owner')
  or exists (select 1 from public.driver_vehicle_assignments a where a.organization_id = vehicles.organization_id and a.vehicle_id = vehicles.id and a.driver_user_id = (select auth.uid()) and a.starts_at <= now() and (a.ends_at is null or a.ends_at > now()))
);
create policy owner_or_own_assignments on public.driver_vehicle_assignments for select to authenticated using (
  driver_user_id = (select auth.uid())
  or exists (select 1 from public.memberships m where m.organization_id = driver_vehicle_assignments.organization_id and m.user_id = (select auth.uid()) and m.active and m.role = 'owner')
);
create policy owner_quotes on public.quote_snapshots for select to authenticated using (
  exists (select 1 from public.memberships m where m.organization_id = quote_snapshots.organization_id and m.user_id = (select auth.uid()) and m.active and m.role = 'owner')
);
create policy owner_or_assigned_driver_bookings on public.bookings for select to authenticated using (
  driver_user_id = (select auth.uid())
  or exists (select 1 from public.memberships m where m.organization_id = bookings.organization_id and m.user_id = (select auth.uid()) and m.active and m.role = 'owner')
);
create policy owner_or_assigned_driver_allocations on public.resource_allocations for select to authenticated using (
  driver_user_id = (select auth.uid())
  or exists (select 1 from public.memberships m where m.organization_id = resource_allocations.organization_id and m.user_id = (select auth.uid()) and m.active and m.role = 'owner')
);

revoke all on table public.vehicles, public.driver_vehicle_assignments, public.quote_snapshots,
  public.bookings, public.resource_allocations, public.request_commands, public.outbox_events
  from public, anon, authenticated;
grant select on table public.vehicles, public.driver_vehicle_assignments, public.resource_allocations to authenticated;
grant select (id, organization_id, reference, driver_user_id, vehicle_id, status, starts_at, ends_at,
  hold_expires_at, pickup_json, destination_json, stops_json, customer_note, original_starts_at,
  created_at, updated_at, cancelled_at) on public.bookings to authenticated;
grant all on table public.vehicles, public.driver_vehicle_assignments, public.quote_snapshots,
  public.bookings, public.resource_allocations, public.request_commands, public.outbox_events
  to service_role;
