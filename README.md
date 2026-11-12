# Etenesh HR Insights

An Ethiopian job board with application tracking on Telegram and a small course shop. It is built on [Bordful](https://github.com/craftled/bordful) (MIT), with Next.js, Payload CMS and PostgreSQL.

## What works today

- **Landing page** at `/` in Bordful's style, with Etenesh text and pictures of the real board.
- **Job board** at `/jobs` with 24 demo vacancies from made-up Ethiopian companies.
- **Apply inside the board.** Open a job and press **Apply now**. The form opens right in the preview, or on the job page. People below a job's minimum years or education are told what is missing and cannot submit. Each application gets a reference like `ET-2026-0001`.
- **HR dashboard** at `/dashboard` (shadcn `dashboard-01`). Sign in at `/admin`. It shows applications per job, each applicant's details, CV, answers and match score, and buttons to move them through review, shortlist, interview, offer and hired (or hold and reject), plus internal notes and a history.
- **Hiring criteria on each job:** minimum years, minimum education, skills to check, and questions for applicants. Set them in **Edit job**.

CVs are stored in the database (PDF or Word, up to 4 MB) and only signed-in HR staff can open them.

## Next steps

1. Import jobs by pasting a JSON list (the format is in `src/lib/etenesh/job-import.ts`).
2. Application updates on Telegram.
3. Course shop: video link, thumbnail, Drive link, price, paid on Telegram and checked by hand.

## Run locally

Install the Node.js version in [`.nvmrc`](.nvmrc), Bun and PostgreSQL.

```bash
bun install --frozen-lockfile
cp .env.example .env   # set DATABASE_URL, PAYLOAD_SECRET, CRON_SECRET, DEMO_EDITOR_*
bun run payload migrate
bun run seed:demo      # first admin, site name, 24 demo jobs, demo applicants
bun run dev
```

The board runs at [localhost:3000](http://localhost:3000) and the admin at [localhost:3000/admin](http://localhost:3000/admin). The seed command skips anything that already exists.

## Deploy on Vercel

Use the Neon database as `DATABASE_URL` and set `NEXT_PUBLIC_SERVER_URL` to the site's address. Connect Vercel Blob for uploads.

Migrations run when the deployed app starts. To load the demo jobs and applicants into Neon, run once from your computer:

```bash
DATABASE_URL=<neon url> bun run seed:demo
```
