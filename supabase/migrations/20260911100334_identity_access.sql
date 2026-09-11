CREATE TABLE "public"."customer_records" (
  "id"              uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "organization_id" uuid                     NOT NULL,
  "full_name"       text                     NOT NULL,
  "created_at"      timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "customer_records_full_name_check" CHECK (((length(TRIM(BOTH FROM full_name)) >= 1) AND (length(TRIM(BOTH FROM full_name)) <= 200))),
  CONSTRAINT "customer_records_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."customer_records"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."driver_profiles" (
  "organization_id" uuid                     NOT NULL,
  "user_id"         uuid                     NOT NULL,
  "display_name"    text                     NOT NULL,
  "created_at"      timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "driver_profiles_display_name_check" CHECK (((length(TRIM(BOTH FROM display_name)) >= 1) AND (length(TRIM(BOTH FROM display_name)) <= 120))),
  CONSTRAINT "driver_profiles_pkey" PRIMARY KEY (organization_id, user_id)
);

ALTER TABLE "public"."driver_profiles"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."memberships" (
  "organization_id" uuid                     NOT NULL,
  "user_id"         uuid                     NOT NULL,
  "role"            text                     NOT NULL,
  "active"          boolean                  NOT NULL DEFAULT true,
  "created_at"      timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "memberships_pkey" PRIMARY KEY (organization_id, user_id),
  CONSTRAINT "memberships_role_check" CHECK ((role = ANY (ARRAY['owner'::text, 'driver'::text])))
);

ALTER TABLE "public"."memberships"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."organizations" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "name"       text                     NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "organizations_name_check" CHECK (((length(TRIM(BOTH FROM name)) >= 1) AND (length(TRIM(BOTH FROM name)) <= 120))),
  CONSTRAINT "organizations_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."organizations"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."scheduling_policy_versions" (
  "organization_id"     uuid                     NOT NULL,
  "version"             integer                  NOT NULL,
  "minimum_gap_minutes" integer                  NOT NULL DEFAULT 60,
  "tolerance_minutes"   integer                  NOT NULL DEFAULT 15,
  "created_at"          timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "scheduling_policy_versions_minimum_gap_minutes_check" CHECK ((minimum_gap_minutes >= 0)),
  CONSTRAINT "scheduling_policy_versions_pkey" PRIMARY KEY (organization_id, VERSION),
  CONSTRAINT "scheduling_policy_versions_tolerance_minutes_check" CHECK ((tolerance_minutes >= 0)),
  CONSTRAINT "scheduling_policy_versions_version_check" CHECK ((version > 0))
);

ALTER TABLE "public"."scheduling_policy_versions"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."driver_profiles"
  ADD CONSTRAINT "driver_profiles_organization_id_user_id_fkey" FOREIGN KEY (organization_id, user_id) REFERENCES public.memberships(organization_id, user_id);

ALTER TABLE "public"."memberships"
  ADD CONSTRAINT "memberships_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id);

ALTER TABLE "public"."customer_records"
  ADD CONSTRAINT "customer_records_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

ALTER TABLE "public"."memberships"
  ADD CONSTRAINT "memberships_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

ALTER TABLE "public"."scheduling_policy_versions"
  ADD CONSTRAINT "scheduling_policy_versions_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

CREATE INDEX customer_records_org_idx ON public.customer_records USING btree (organization_id);

CREATE INDEX memberships_user_idx ON public.memberships USING btree (user_id, organization_id);

CREATE POLICY "owner_customers" ON "public"."customer_records"
  FOR SELECT
  TO "authenticated"
  USING ((organization_id IN ( SELECT memberships.organization_id
   FROM public.memberships
  WHERE (memberships.role = 'owner'::text))));

CREATE POLICY "allowed_driver_profile" ON "public"."driver_profiles"
  FOR SELECT
  TO "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM public.memberships m
  WHERE ((m.organization_id = driver_profiles.organization_id) AND ((m.role = 'owner'::text) OR (driver_profiles.user_id = ( SELECT auth.uid() AS uid)))))));

CREATE POLICY "own_active_membership" ON "public"."memberships"
  FOR SELECT
  TO "authenticated"
  USING (((user_id = ( SELECT auth.uid() AS uid)) AND active));

CREATE POLICY "member_organization" ON "public"."organizations"
  FOR SELECT
  TO "authenticated"
  USING ((id IN ( SELECT memberships.organization_id
   FROM public.memberships)));

CREATE POLICY "owner_policy_versions" ON "public"."scheduling_policy_versions"
  FOR SELECT
  TO "authenticated"
  USING ((organization_id IN ( SELECT memberships.organization_id
   FROM public.memberships
  WHERE (memberships.role = 'owner'::text))));

REVOKE ALL ON TABLE "public"."customer_records" FROM "authenticated";

GRANT SELECT ON TABLE "public"."customer_records" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."customer_records" TO "postgres", "service_role";

REVOKE ALL ON TABLE "public"."driver_profiles" FROM "authenticated";

GRANT SELECT ON TABLE "public"."driver_profiles" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."driver_profiles" TO "postgres", "service_role";

REVOKE ALL ON TABLE "public"."memberships" FROM "authenticated";

GRANT SELECT ON TABLE "public"."memberships" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."memberships" TO "postgres", "service_role";

REVOKE ALL ON TABLE "public"."organizations" FROM "authenticated";

GRANT SELECT ON TABLE "public"."organizations" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."organizations" TO "postgres", "service_role";

REVOKE ALL ON TABLE "public"."scheduling_policy_versions" FROM "authenticated";

GRANT SELECT ON TABLE "public"."scheduling_policy_versions" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."scheduling_policy_versions" TO "postgres", "service_role";

