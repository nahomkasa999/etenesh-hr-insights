import { sql } from '@payloadcms/db-postgres'
import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

// Applications made before Telegram was asked for have no contact.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "applications" ALTER COLUMN "telegram_contact" DROP NOT NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "applications" SET "telegram_contact" = '' WHERE "telegram_contact" IS NULL;
    ALTER TABLE "applications" ALTER COLUMN "telegram_contact" SET NOT NULL;
  `)
}
