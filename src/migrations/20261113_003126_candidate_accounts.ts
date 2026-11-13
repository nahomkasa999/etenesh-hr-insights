import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_applications_source" AS ENUM('form', 'auto');
  CREATE TYPE "public"."enum_candidates_preferred_types" AS ENUM('contract', 'full-time', 'internship', 'other', 'part-time', 'per-diem', 'temporary', 'volunteer');
  CREATE TYPE "public"."enum_candidates_preferred_workplaces" AS ENUM('hybrid', 'onsite', 'remote');
  CREATE TYPE "public"."enum_candidates_education" AS ENUM('None', 'Grade 10', 'Grade 12', 'TVET Certificate', 'Diploma', 'Bachelor''s degree', 'Master''s degree');
  CREATE TYPE "public"."enum_candidate_documents_kind" AS ENUM('cv', 'cover_letter', 'certificate', 'id', 'other');
  CREATE TABLE "candidates_skills" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "candidates_preferred_categories" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "candidates_preferred_locations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "candidates_preferred_types" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_candidates_preferred_types",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "candidates_preferred_workplaces" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_candidates_preferred_workplaces",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "candidates_auto_apply_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"at" timestamp(3) with time zone,
  	"job_title" varchar,
  	"outcome" varchar,
  	"detail" varchar
  );
  
  CREATE TABLE "candidates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"auth_user_id" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"full_name" varchar,
  	"phone" varchar,
  	"city" varchar,
  	"headline" varchar,
  	"summary" varchar,
  	"years_experience" numeric,
  	"education" "enum_candidates_education",
  	"auto_apply" boolean DEFAULT false,
  	"auto_apply_min_score" numeric DEFAULT 70,
  	"auto_apply_daily_limit" numeric DEFAULT 5,
  	"auto_apply_note" varchar,
  	"auto_apply_last_run" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "candidates_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "candidate_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"candidate_id" integer NOT NULL,
  	"kind" "enum_candidate_documents_kind" DEFAULT 'cv' NOT NULL,
  	"name" varchar NOT NULL,
  	"mime_type" varchar,
  	"size" numeric,
  	"data" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "candidate_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  ALTER TABLE "applications" ADD COLUMN "candidate_id" integer;
  ALTER TABLE "applications" ADD COLUMN "source" "enum_applications_source" DEFAULT 'form';
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "candidates_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "candidate_documents_id" integer;
  ALTER TABLE "candidates_skills" ADD CONSTRAINT "candidates_skills_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "candidates_preferred_categories" ADD CONSTRAINT "candidates_preferred_categories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "candidates_preferred_locations" ADD CONSTRAINT "candidates_preferred_locations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "candidates_preferred_types" ADD CONSTRAINT "candidates_preferred_types_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "candidates_preferred_workplaces" ADD CONSTRAINT "candidates_preferred_workplaces_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "candidates_auto_apply_log" ADD CONSTRAINT "candidates_auto_apply_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "candidates_rels" ADD CONSTRAINT "candidates_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "candidates_rels" ADD CONSTRAINT "candidates_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "candidate_documents" ADD CONSTRAINT "candidate_documents_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "candidate_documents_rels" ADD CONSTRAINT "candidate_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."candidate_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "candidate_documents_rels" ADD CONSTRAINT "candidate_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "candidates_skills_order_idx" ON "candidates_skills" USING btree ("_order");
  CREATE INDEX "candidates_skills_parent_id_idx" ON "candidates_skills" USING btree ("_parent_id");
  CREATE INDEX "candidates_preferred_categories_order_idx" ON "candidates_preferred_categories" USING btree ("_order");
  CREATE INDEX "candidates_preferred_categories_parent_id_idx" ON "candidates_preferred_categories" USING btree ("_parent_id");
  CREATE INDEX "candidates_preferred_locations_order_idx" ON "candidates_preferred_locations" USING btree ("_order");
  CREATE INDEX "candidates_preferred_locations_parent_id_idx" ON "candidates_preferred_locations" USING btree ("_parent_id");
  CREATE INDEX "candidates_preferred_types_order_idx" ON "candidates_preferred_types" USING btree ("order");
  CREATE INDEX "candidates_preferred_types_parent_idx" ON "candidates_preferred_types" USING btree ("parent_id");
  CREATE INDEX "candidates_preferred_workplaces_order_idx" ON "candidates_preferred_workplaces" USING btree ("order");
  CREATE INDEX "candidates_preferred_workplaces_parent_idx" ON "candidates_preferred_workplaces" USING btree ("parent_id");
  CREATE INDEX "candidates_auto_apply_log_order_idx" ON "candidates_auto_apply_log" USING btree ("_order");
  CREATE INDEX "candidates_auto_apply_log_parent_id_idx" ON "candidates_auto_apply_log" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "candidates_auth_user_id_idx" ON "candidates" USING btree ("auth_user_id");
  CREATE INDEX "candidates_email_idx" ON "candidates" USING btree ("email");
  CREATE INDEX "candidates_updated_at_idx" ON "candidates" USING btree ("updated_at");
  CREATE INDEX "candidates_created_at_idx" ON "candidates" USING btree ("created_at");
  CREATE INDEX "candidates_rels_order_idx" ON "candidates_rels" USING btree ("order");
  CREATE INDEX "candidates_rels_parent_idx" ON "candidates_rels" USING btree ("parent_id");
  CREATE INDEX "candidates_rels_path_idx" ON "candidates_rels" USING btree ("path");
  CREATE INDEX "candidates_rels_users_id_idx" ON "candidates_rels" USING btree ("users_id");
  CREATE INDEX "candidate_documents_candidate_idx" ON "candidate_documents" USING btree ("candidate_id");
  CREATE INDEX "candidate_documents_kind_idx" ON "candidate_documents" USING btree ("kind");
  CREATE INDEX "candidate_documents_updated_at_idx" ON "candidate_documents" USING btree ("updated_at");
  CREATE INDEX "candidate_documents_created_at_idx" ON "candidate_documents" USING btree ("created_at");
  CREATE INDEX "candidate_documents_rels_order_idx" ON "candidate_documents_rels" USING btree ("order");
  CREATE INDEX "candidate_documents_rels_parent_idx" ON "candidate_documents_rels" USING btree ("parent_id");
  CREATE INDEX "candidate_documents_rels_path_idx" ON "candidate_documents_rels" USING btree ("path");
  CREATE INDEX "candidate_documents_rels_users_id_idx" ON "candidate_documents_rels" USING btree ("users_id");
  ALTER TABLE "applications" ADD CONSTRAINT "applications_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_candidates_fk" FOREIGN KEY ("candidates_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_candidate_documents_fk" FOREIGN KEY ("candidate_documents_id") REFERENCES "public"."candidate_documents"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "applications_candidate_idx" ON "applications" USING btree ("candidate_id");
  CREATE INDEX "applications_source_idx" ON "applications" USING btree ("source");
  CREATE INDEX "payload_locked_documents_rels_candidates_id_idx" ON "payload_locked_documents_rels" USING btree ("candidates_id");
  CREATE INDEX "payload_locked_documents_rels_candidate_documents_id_idx" ON "payload_locked_documents_rels" USING btree ("candidate_documents_id");`)
  // Better Auth tables for candidate sign-in (email and password). They are
  // read and written by better-auth, not by Payload, so they live outside
  // the Payload schema and are created here once.
  await db.execute(sql`
  CREATE TABLE IF NOT EXISTS "candidate_user" ("id" text NOT NULL PRIMARY KEY, "name" text NOT NULL, "email" text NOT NULL UNIQUE, "emailVerified" boolean NOT NULL, "image" text, "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL, "updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL);
  CREATE TABLE IF NOT EXISTS "candidate_session" ("id" text NOT NULL PRIMARY KEY, "expiresAt" timestamptz NOT NULL, "token" text NOT NULL UNIQUE, "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL, "updatedAt" timestamptz NOT NULL, "ipAddress" text, "userAgent" text, "userId" text NOT NULL REFERENCES "candidate_user" ("id") ON DELETE CASCADE);
  CREATE TABLE IF NOT EXISTS "candidate_account" ("id" text NOT NULL PRIMARY KEY, "accountId" text NOT NULL, "providerId" text NOT NULL, "userId" text NOT NULL REFERENCES "candidate_user" ("id") ON DELETE CASCADE, "accessToken" text, "refreshToken" text, "idToken" text, "accessTokenExpiresAt" timestamptz, "refreshTokenExpiresAt" timestamptz, "scope" text, "password" text, "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL, "updatedAt" timestamptz NOT NULL);
  CREATE TABLE IF NOT EXISTS "candidate_verification" ("id" text NOT NULL PRIMARY KEY, "identifier" text NOT NULL, "value" text NOT NULL, "expiresAt" timestamptz NOT NULL, "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL, "updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL);
  CREATE INDEX IF NOT EXISTS "candidate_session_userId_idx" ON "candidate_session" ("userId");
  CREATE INDEX IF NOT EXISTS "candidate_account_userId_idx" ON "candidate_account" ("userId");
  CREATE INDEX IF NOT EXISTS "candidate_verification_identifier_idx" ON "candidate_verification" ("identifier");`)

}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP TABLE IF EXISTS "candidate_verification" CASCADE;
  DROP TABLE IF EXISTS "candidate_account" CASCADE;
  DROP TABLE IF EXISTS "candidate_session" CASCADE;
  DROP TABLE IF EXISTS "candidate_user" CASCADE;
   ALTER TABLE "candidates_skills" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "candidates_preferred_categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "candidates_preferred_locations" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "candidates_preferred_types" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "candidates_preferred_workplaces" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "candidates_auto_apply_log" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "candidates" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "candidates_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "candidate_documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "candidate_documents_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "candidates_skills" CASCADE;
  DROP TABLE "candidates_preferred_categories" CASCADE;
  DROP TABLE "candidates_preferred_locations" CASCADE;
  DROP TABLE "candidates_preferred_types" CASCADE;
  DROP TABLE "candidates_preferred_workplaces" CASCADE;
  DROP TABLE "candidates_auto_apply_log" CASCADE;
  DROP TABLE "candidates" CASCADE;
  DROP TABLE "candidates_rels" CASCADE;
  DROP TABLE "candidate_documents" CASCADE;
  DROP TABLE "candidate_documents_rels" CASCADE;
  ALTER TABLE "applications" DROP CONSTRAINT "applications_candidate_id_candidates_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_candidates_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_candidate_documents_fk";
  
  DROP INDEX "applications_candidate_idx";
  DROP INDEX "applications_source_idx";
  DROP INDEX "payload_locked_documents_rels_candidates_id_idx";
  DROP INDEX "payload_locked_documents_rels_candidate_documents_id_idx";
  ALTER TABLE "applications" DROP COLUMN "candidate_id";
  ALTER TABLE "applications" DROP COLUMN "source";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "candidates_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "candidate_documents_id";
  DROP TYPE "public"."enum_applications_source";
  DROP TYPE "public"."enum_candidates_preferred_types";
  DROP TYPE "public"."enum_candidates_preferred_workplaces";
  DROP TYPE "public"."enum_candidates_education";
  DROP TYPE "public"."enum_candidate_documents_kind";`)
}
