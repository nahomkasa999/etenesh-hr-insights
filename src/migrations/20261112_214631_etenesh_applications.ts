import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_jobs_criteria_education" AS ENUM('None', 'Grade 10', 'Grade 12', 'TVET Certificate', 'Diploma', 'Bachelor''s degree', 'Master''s degree');
  CREATE TYPE "public"."enum__jobs_v_version_criteria_education" AS ENUM('None', 'Grade 10', 'Grade 12', 'TVET Certificate', 'Diploma', 'Bachelor''s degree', 'Master''s degree');
  CREATE TYPE "public"."enum_applications_status" AS ENUM('submitted', 'under_review', 'shortlisted', 'interview', 'offer', 'hired', 'on_hold', 'rejected');
  CREATE TYPE "public"."enum_applications_education" AS ENUM('None', 'Grade 10', 'Grade 12', 'TVET Certificate', 'Diploma', 'Bachelor''s degree', 'Master''s degree');
  CREATE TABLE "jobs_criteria_required_skills" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "jobs_criteria_screening_questions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar
  );
  
  CREATE TABLE "_jobs_v_version_criteria_required_skills" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_jobs_v_version_criteria_screening_questions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "applications_skills" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "applications_answers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar
  );
  
  CREATE TABLE "applications_match_met" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "applications_match_missed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "applications_notes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL,
  	"author" varchar,
  	"at" timestamp(3) with time zone
  );
  
  CREATE TABLE "applications_history" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"status" varchar,
  	"by" varchar,
  	"at" timestamp(3) with time zone
  );
  
  CREATE TABLE "applications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"reference" varchar NOT NULL,
  	"job_id" integer NOT NULL,
  	"job_title" varchar,
  	"company_name" varchar,
  	"status" "enum_applications_status" DEFAULT 'submitted' NOT NULL,
  	"full_name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"city" varchar,
  	"years_experience" numeric,
  	"education" "enum_applications_education",
  	"cover_note" varchar,
  	"match_score" numeric,
  	"cv_name" varchar,
  	"cv_type" varchar,
  	"cv_size" numeric,
  	"cv_data" varchar,
  	"telegram_chat_id" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "applications_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  ALTER TABLE "jobs" ADD COLUMN "criteria_min_years_experience" numeric DEFAULT 0;
  ALTER TABLE "jobs" ADD COLUMN "criteria_education" "enum_jobs_criteria_education" DEFAULT 'None';
  ALTER TABLE "_jobs_v" ADD COLUMN "version_criteria_min_years_experience" numeric DEFAULT 0;
  ALTER TABLE "_jobs_v" ADD COLUMN "version_criteria_education" "enum__jobs_v_version_criteria_education" DEFAULT 'None';
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "applications_id" integer;
  ALTER TABLE "jobs_criteria_required_skills" ADD CONSTRAINT "jobs_criteria_required_skills_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "jobs_criteria_screening_questions" ADD CONSTRAINT "jobs_criteria_screening_questions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_jobs_v_version_criteria_required_skills" ADD CONSTRAINT "_jobs_v_version_criteria_required_skills_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_jobs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_jobs_v_version_criteria_screening_questions" ADD CONSTRAINT "_jobs_v_version_criteria_screening_questions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_jobs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "applications_skills" ADD CONSTRAINT "applications_skills_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "applications_answers" ADD CONSTRAINT "applications_answers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "applications_match_met" ADD CONSTRAINT "applications_match_met_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "applications_match_missed" ADD CONSTRAINT "applications_match_missed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "applications_notes" ADD CONSTRAINT "applications_notes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "applications_history" ADD CONSTRAINT "applications_history_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "applications" ADD CONSTRAINT "applications_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "applications_rels" ADD CONSTRAINT "applications_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "applications_rels" ADD CONSTRAINT "applications_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "jobs_criteria_required_skills_order_idx" ON "jobs_criteria_required_skills" USING btree ("_order");
  CREATE INDEX "jobs_criteria_required_skills_parent_id_idx" ON "jobs_criteria_required_skills" USING btree ("_parent_id");
  CREATE INDEX "jobs_criteria_screening_questions_order_idx" ON "jobs_criteria_screening_questions" USING btree ("_order");
  CREATE INDEX "jobs_criteria_screening_questions_parent_id_idx" ON "jobs_criteria_screening_questions" USING btree ("_parent_id");
  CREATE INDEX "_jobs_v_version_criteria_required_skills_order_idx" ON "_jobs_v_version_criteria_required_skills" USING btree ("_order");
  CREATE INDEX "_jobs_v_version_criteria_required_skills_parent_id_idx" ON "_jobs_v_version_criteria_required_skills" USING btree ("_parent_id");
  CREATE INDEX "_jobs_v_version_criteria_screening_questions_order_idx" ON "_jobs_v_version_criteria_screening_questions" USING btree ("_order");
  CREATE INDEX "_jobs_v_version_criteria_screening_questions_parent_id_idx" ON "_jobs_v_version_criteria_screening_questions" USING btree ("_parent_id");
  CREATE INDEX "applications_skills_order_idx" ON "applications_skills" USING btree ("_order");
  CREATE INDEX "applications_skills_parent_id_idx" ON "applications_skills" USING btree ("_parent_id");
  CREATE INDEX "applications_answers_order_idx" ON "applications_answers" USING btree ("_order");
  CREATE INDEX "applications_answers_parent_id_idx" ON "applications_answers" USING btree ("_parent_id");
  CREATE INDEX "applications_match_met_order_idx" ON "applications_match_met" USING btree ("_order");
  CREATE INDEX "applications_match_met_parent_id_idx" ON "applications_match_met" USING btree ("_parent_id");
  CREATE INDEX "applications_match_missed_order_idx" ON "applications_match_missed" USING btree ("_order");
  CREATE INDEX "applications_match_missed_parent_id_idx" ON "applications_match_missed" USING btree ("_parent_id");
  CREATE INDEX "applications_notes_order_idx" ON "applications_notes" USING btree ("_order");
  CREATE INDEX "applications_notes_parent_id_idx" ON "applications_notes" USING btree ("_parent_id");
  CREATE INDEX "applications_history_order_idx" ON "applications_history" USING btree ("_order");
  CREATE INDEX "applications_history_parent_id_idx" ON "applications_history" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "applications_reference_idx" ON "applications" USING btree ("reference");
  CREATE INDEX "applications_job_idx" ON "applications" USING btree ("job_id");
  CREATE INDEX "applications_status_idx" ON "applications" USING btree ("status");
  CREATE INDEX "applications_match_score_idx" ON "applications" USING btree ("match_score");
  CREATE INDEX "applications_telegram_chat_id_idx" ON "applications" USING btree ("telegram_chat_id");
  CREATE INDEX "applications_updated_at_idx" ON "applications" USING btree ("updated_at");
  CREATE INDEX "applications_created_at_idx" ON "applications" USING btree ("created_at");
  CREATE INDEX "applications_rels_order_idx" ON "applications_rels" USING btree ("order");
  CREATE INDEX "applications_rels_parent_idx" ON "applications_rels" USING btree ("parent_id");
  CREATE INDEX "applications_rels_path_idx" ON "applications_rels" USING btree ("path");
  CREATE INDEX "applications_rels_users_id_idx" ON "applications_rels" USING btree ("users_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_applications_fk" FOREIGN KEY ("applications_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_applications_id_idx" ON "payload_locked_documents_rels" USING btree ("applications_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "jobs_criteria_required_skills" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "jobs_criteria_screening_questions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_jobs_v_version_criteria_required_skills" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_jobs_v_version_criteria_screening_questions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "applications_skills" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "applications_answers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "applications_match_met" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "applications_match_missed" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "applications_notes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "applications_history" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "applications" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "applications_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "jobs_criteria_required_skills" CASCADE;
  DROP TABLE "jobs_criteria_screening_questions" CASCADE;
  DROP TABLE "_jobs_v_version_criteria_required_skills" CASCADE;
  DROP TABLE "_jobs_v_version_criteria_screening_questions" CASCADE;
  DROP TABLE "applications_skills" CASCADE;
  DROP TABLE "applications_answers" CASCADE;
  DROP TABLE "applications_match_met" CASCADE;
  DROP TABLE "applications_match_missed" CASCADE;
  DROP TABLE "applications_notes" CASCADE;
  DROP TABLE "applications_history" CASCADE;
  DROP TABLE "applications" CASCADE;
  DROP TABLE "applications_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_applications_fk";
  
  DROP INDEX "payload_locked_documents_rels_applications_id_idx";
  ALTER TABLE "jobs" DROP COLUMN "criteria_min_years_experience";
  ALTER TABLE "jobs" DROP COLUMN "criteria_education";
  ALTER TABLE "_jobs_v" DROP COLUMN "version_criteria_min_years_experience";
  ALTER TABLE "_jobs_v" DROP COLUMN "version_criteria_education";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "applications_id";
  DROP TYPE "public"."enum_jobs_criteria_education";
  DROP TYPE "public"."enum__jobs_v_version_criteria_education";
  DROP TYPE "public"."enum_applications_status";
  DROP TYPE "public"."enum_applications_education";`)
}
