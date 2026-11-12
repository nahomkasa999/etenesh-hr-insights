import path from "node:path";
import { fileURLToPath } from "node:url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { sharpTransformer } from "@payloadcms/transformer-sharp";
import { buildConfig, type Payload } from "payload";
import sharp from "sharp";
import { collections } from "./collections";
import { resolvePayloadSecret } from "./config/payload-secret";
import { resolveServerUrl } from "./config/server-url";
import { globals } from "./globals";
import { bordfeedSyncTask } from "./jobs/bordfeed-sync";
import { expireJobsTask } from "./jobs/expire-job";
import { sendAlertsTask } from "./jobs/send-alerts";
import { stripDashes } from "./lib/codegen/strip-dashes";
import { ensureInstallId } from "./lib/install/install-id";
import { migrations } from "./migrations";
import { resolveMediaStorage } from "./storage/media-storage";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const serverURL = resolveServerUrl();
const secret = resolvePayloadSecret();

async function ensureInstallIdSafely(payload: Payload): Promise<void> {
  try {
    await ensureInstallId(payload);
  } catch (error) {
    payload.logger.warn(
      { err: error },
      "Could not ensure the install id. The database may not be migrated yet."
    );
  }
}

export default buildConfig({
  admin: {
    avatar: "default",
    components: {
      beforeNavLinks: ["/admin/components/etenesh-brand#EteneshNavBrand"],
      graphics: {
        Icon: "/admin/components/etenesh-brand#EteneshIcon",
        Logo: "/admin/components/etenesh-brand#EteneshLogo",
      },
      providers: ["/admin/components/etenesh-brand#EteneshFonts"],
      views: {
        dashboard: {
          Component: "/admin/components/etenesh-dashboard#EteneshDashboard",
        },
      },
    },
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      icons: [{ rel: "icon", type: "image/png", url: "/etenesh/logo.webp" }],
      titleSuffix: " | Etenesh HR",
    },
    theme: "light",
    user: "users",
  },
  cli: { commands: { bordful: "./cli/bordful.js#bordfulCommand" } },
  collections,
  cors: [serverURL],
  csrf: [serverURL],
  db: postgresAdapter({
    migrationDir: path.resolve(dirname, "migrations"),
    pool: { connectionString: process.env.DATABASE_URL ?? "" },
    prodMigrations: migrations,
    push: false,
  }),
  defaultDepth: 1,
  editor: lexicalEditor(),
  globals,
  graphQL: { disable: true },
  jobs: {
    access: {
      cancel: () => false,
      queue: () => false,
      run: () => false,
    },
    tasks: [bordfeedSyncTask, expireJobsTask, sendAlertsTask],
  },
  maxDepth: 3,
  onInit: async (payload) => {
    // `next build` boots Payload too. Seeding there would call Bordfeed from
    // the build machine and bake the board into the data cache.
    if (process.env.NEXT_PHASE === "phase-production-build") {
      return;
    }

    // Etenesh posts its own vacancies, so the Bordfeed sample feed stays off.
    await ensureInstallIdSafely(payload);
  },
  secret,
  serverURL,
  storage: [resolveMediaStorage()],
  telemetry: false,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
    postProcess: [({ compiledTypes }) => stripDashes(compiledTypes)],
  },
  upload: {
    limits: { fileSize: 5_000_000 },
    transformers: [
      sharpTransformer({
        collections: {
          media: {
            variants: [
              { height: 96, name: "thumb", width: 96 },
              { name: "card", width: 320 },
              { height: 630, name: "og", width: 1200 },
            ],
          },
        },
        sharp,
      }),
    ],
  },
});
