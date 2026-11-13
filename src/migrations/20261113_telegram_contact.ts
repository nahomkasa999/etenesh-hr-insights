import { sql } from '@payloadcms/db-postgres'
import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "applications" ADD COLUMN "telegram_contact" varchar NOT NULL DEFAULT '';
    ALTER TABLE "applications" ALTER COLUMN "telegram_contact" DROP DEFAULT;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "applications" DROP COLUMN "telegram_contact";
  `)
}
