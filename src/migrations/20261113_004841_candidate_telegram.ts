import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "candidates" ADD COLUMN "telegram_chat_id" varchar;
  CREATE INDEX "candidates_telegram_chat_id_idx" ON "candidates" USING btree ("telegram_chat_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "candidates_telegram_chat_id_idx";
  ALTER TABLE "candidates" DROP COLUMN "telegram_chat_id";`)
}
