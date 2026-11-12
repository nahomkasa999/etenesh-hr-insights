# Etenesh HR Insights

An Ethiopian job board and career resource built on [Bordful](https://github.com/craftled/bordful), Next.js, Payload CMS, and PostgreSQL.

- Browse and filter curated vacancies. Ethiojobs listings link to the original application instructions.
- Use the Payload admin to draft and publish jobs and career guides.
- Browse the course catalog and preview **Job Search Foundations** with its YouTube introduction and lesson outline.
- Try the fictional application walkthrough at `/demo/apply`. The practice form runs in the browser.

## Run locally

Install the Node.js version in [`.nvmrc`](.nvmrc), Bun 1.4.2, and PostgreSQL 17 or newer.

```bash
bun install --frozen-lockfile
cp .env.example .env
```

Set `DATABASE_URL`, `PAYLOAD_SECRET`, and `CRON_SECRET` in `.env`. For the first admin account, set `DEMO_EDITOR_EMAIL` and `DEMO_EDITOR_PASSWORD` with a password of at least 16 characters. Use a random Payload secret of at least 32 characters.

```bash
bun run payload migrate
bun run seed:etenesh
bun run dev
```

The board runs at [localhost:3000](http://localhost:3000) and the admin at [localhost:3000/admin](http://localhost:3000/admin). The seed command creates the starter guides, eligible curated vacancies, and the first admin on a fresh database.

## Theme

Edit [`src/app/globals.css`](src/app/globals.css) to change the light or dark palette. The board follows the system setting until a visitor chooses a theme. The stylesheet maps the same colors to the Tailwind tokens used by the board, blog, and courses.

## Deploy on Vercel

Connect this repository to the Vercel project and select `main` as the production branch. Use Neon or another PostgreSQL database and set the same required environment variables in Vercel. Set `NEXT_PUBLIC_SERVER_URL` to the deployed site's origin and connect Vercel Blob if you plan to upload media from the admin.

The build command in [`vercel.json`](vercel.json) initializes the database before building the site. Git pushes to the production branch trigger deployments after the repository is connected.

## Checks

```bash
bun run check
```

## License

MIT. See [LICENSE](LICENSE) and the [upstream Bordful project](https://github.com/craftled/bordful).
