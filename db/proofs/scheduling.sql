-- BAS-02 disposable PostgreSQL proof. NOT a production/Supabase migration.
-- Run only in the isolated pm_foundation database, never against a remote project.
create schema pm_proof;
revoke all on schema pm_proof from public;
create table pm_proof.organizations (id uuid primary key);
create table pm_proof.memberships (
  organization_id uuid references pm_proof.organizations(id), user_id uuid,
  role text not null check (role in ('owner','driver')), active boolean not null default true,
  primary key (organization_id,user_id)
);
create table pm_proof.settings (
  organization_id uuid primary key references pm_proof.organizations(id),
  version integer not null check (version>0),
  minimum_gap integer not null check (minimum_gap>=0),
  tolerance integer not null check (tolerance>=0)
);
create table pm_proof.resources (
  organization_id uuid references pm_proof.organizations(id), id uuid,
  kind text not null check (kind in ('driver','vehicle')), active boolean not null default true,
  primary key(organization_id,id), unique(organization_id,id,kind)
);
create table pm_proof.commands (
  organization_id uuid references pm_proof.organizations(id), key text,
  request_hash text not null, result jsonb,
  primary key(organization_id,key)
);
create table pm_proof.bookings (
  organization_id uuid references pm_proof.organizations(id), id uuid,
  driver_id uuid not null, vehicle_id uuid not null,
  driver_kind text not null default 'driver' check(driver_kind='driver'),
  vehicle_kind text not null default 'vehicle' check(vehicle_kind='vehicle'),
  starts_at timestamptz not null, ends_at timestamptz not null check(ends_at>starts_at),
  expires_at timestamptz not null,
  status text not null check(status in ('requested','cancelled','expired')),
  quote_snapshot jsonb not null, policy_snapshot jsonb not null,
  version integer not null default 1 check(version>0), created_at timestamptz not null default clock_timestamp(),
  primary key(organization_id,id),
  foreign key(organization_id,driver_id,driver_kind) references pm_proof.resources(organization_id,id,kind),
  foreign key(organization_id,vehicle_id,vehicle_kind) references pm_proof.resources(organization_id,id,kind)
);
create index bookings_driver on pm_proof.bookings(organization_id,driver_id,starts_at);
create index bookings_vehicle on pm_proof.bookings(organization_id,vehicle_id,starts_at);
create table pm_proof.allocations (
  organization_id uuid, booking_id uuid, resource_id uuid,
  primary key(organization_id,booking_id,resource_id),
  foreign key(organization_id,booking_id) references pm_proof.bookings(organization_id,id),
  foreign key(organization_id,resource_id) references pm_proof.resources(organization_id,id)
);
create table pm_proof.outbox (
  organization_id uuid, booking_id uuid, event_type text not null,
  payload jsonb not null, created_at timestamptz not null default clock_timestamp(),
  primary key(organization_id,booking_id,event_type),
  foreign key(organization_id,booking_id) references pm_proof.bookings(organization_id,id)
);
alter table pm_proof.organizations enable row level security;
alter table pm_proof.memberships enable row level security;
alter table pm_proof.settings enable row level security;
alter table pm_proof.resources enable row level security;
alter table pm_proof.commands enable row level security;
alter table pm_proof.bookings enable row level security;
alter table pm_proof.allocations enable row level security;
alter table pm_proof.outbox enable row level security;
revoke all on all tables in schema pm_proof from public;
-- No browser/API grants or permissive RLS policies. Test backend uses the local DB owner.
