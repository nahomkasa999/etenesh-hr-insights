import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_career_guides_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__career_guides_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "career_guides" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "slug" varchar,
    "topic" varchar,
    "summary" varchar,
    "body" jsonb,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "_status" "enum_career_guides_status" DEFAULT 'draft'
  );

  CREATE TABLE "career_guides_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "users_id" integer
  );

  CREATE TABLE "_career_guides_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_title" varchar,
    "version_slug" varchar,
    "version_topic" varchar,
    "version_summary" varchar,
    "version_body" jsonb,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "version__status" "enum__career_guides_v_version_status" DEFAULT 'draft',
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "latest" boolean
  );

  CREATE TABLE "_career_guides_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "users_id" integer
  );

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "career_guides_id" integer;
  ALTER TABLE "career_guides_rels" ADD CONSTRAINT "career_guides_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."career_guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "career_guides_rels" ADD CONSTRAINT "career_guides_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_career_guides_v" ADD CONSTRAINT "_career_guides_v_parent_id_career_guides_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."career_guides"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_career_guides_v_rels" ADD CONSTRAINT "_career_guides_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_career_guides_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_career_guides_v_rels" ADD CONSTRAINT "_career_guides_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "career_guides_slug_idx" ON "career_guides" USING btree ("slug");
  CREATE INDEX "career_guides_updated_at_idx" ON "career_guides" USING btree ("updated_at");
  CREATE INDEX "career_guides_created_at_idx" ON "career_guides" USING btree ("created_at");
  CREATE INDEX "career_guides__status_idx" ON "career_guides" USING btree ("_status");
  CREATE INDEX "career_guides_rels_order_idx" ON "career_guides_rels" USING btree ("order");
  CREATE INDEX "career_guides_rels_parent_idx" ON "career_guides_rels" USING btree ("parent_id");
  CREATE INDEX "career_guides_rels_path_idx" ON "career_guides_rels" USING btree ("path");
  CREATE INDEX "career_guides_rels_users_id_idx" ON "career_guides_rels" USING btree ("users_id");
  CREATE INDEX "_career_guides_v_parent_idx" ON "_career_guides_v" USING btree ("parent_id");
  CREATE INDEX "_career_guides_v_version_version_slug_idx" ON "_career_guides_v" USING btree ("version_slug");
  CREATE INDEX "_career_guides_v_version_version_updated_at_idx" ON "_career_guides_v" USING btree ("version_updated_at");
  CREATE INDEX "_career_guides_v_version_version_created_at_idx" ON "_career_guides_v" USING btree ("version_created_at");
  CREATE INDEX "_career_guides_v_version_version__status_idx" ON "_career_guides_v" USING btree ("version__status");
  CREATE INDEX "_career_guides_v_created_at_idx" ON "_career_guides_v" USING btree ("created_at");
  CREATE INDEX "_career_guides_v_updated_at_idx" ON "_career_guides_v" USING btree ("updated_at");
  CREATE INDEX "_career_guides_v_latest_idx" ON "_career_guides_v" USING btree ("latest");
  CREATE INDEX "_career_guides_v_rels_order_idx" ON "_career_guides_v_rels" USING btree ("order");
  CREATE INDEX "_career_guides_v_rels_parent_idx" ON "_career_guides_v_rels" USING btree ("parent_id");
  CREATE INDEX "_career_guides_v_rels_path_idx" ON "_career_guides_v_rels" USING btree ("path");
  CREATE INDEX "_career_guides_v_rels_users_id_idx" ON "_career_guides_v_rels" USING btree ("users_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_career_guides_fk" FOREIGN KEY ("career_guides_id") REFERENCES "public"."career_guides"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_career_guides_id_idx" ON "payload_locked_documents_rels" USING btree ("career_guides_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "career_guides" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "career_guides_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_career_guides_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_career_guides_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "career_guides" CASCADE;
  DROP TABLE "career_guides_rels" CASCADE;
  DROP TABLE "_career_guides_v" CASCADE;
  DROP TABLE "_career_guides_v_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_career_guides_fk";

  DROP INDEX "payload_locked_documents_rels_career_guides_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "career_guides_id";
  DROP TYPE "public"."enum_career_guides_status";
  DROP TYPE "public"."enum__career_guides_v_version_status";`)
}
