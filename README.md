# Etenesh HR Insights

An Ethiopian job board with application tracking on Telegram and a small course shop. It is built on [Bordful](https://github.com/craftled/bordful) (MIT), with Next.js, Payload CMS and PostgreSQL.

## What works today

- **Landing page** at `/` in Bordful's style, with Etenesh text and pictures of the real board.
- **Job board** at `/jobs` with 24 demo vacancies from made-up Ethiopian companies.
- **Admin** at `/admin` with an Etenesh sign-in page and a simple dashboard: job counts, big action buttons and recent jobs.

## Next steps

1. Import jobs by pasting a JSON list (the format is in `src/lib/etenesh/job-import.ts`).
2. An apply form with a CV upload, screening questions and a criteria check.
3. A screen in the admin to review applications.
4. Application updates on Telegram.
5. Course shop: video link, thumbnail, Drive link, price, paid on Telegram and checked by hand.

## Run locally

Install the Node.js version in [`.nvmrc`](.nvmrc), Bun and PostgreSQL.

```bash
bun install --frozen-lockfile
cp .env.example .env   # set DATABASE_URL, PAYLOAD_SECRET, CRON_SECRET, DEMO_EDITOR_*
bun run payload migrate
bun run seed:demo      # first admin, site name, 24 demo jobs
bun run dev
```

The board runs at [localhost:3000](http://localhost:3000) and the admin at [localhost:3000/admin](http://localhost:3000/admin). The seed command skips anything that already exists.

## Deploy on Vercel

Use the Neon database as `DATABASE_URL`, set `BORDFUL_MARKETING=true`, and set `NEXT_PUBLIC_SERVER_URL` to the site's address. Connect Vercel Blob for uploads.
