# Hosting Guide — Jhenaidah Pourshova Bank Asia Agent Banking

This application is a full-stack website, not a static HTML-only site. It contains:

- A React frontend.
- An Express/Node.js backend.
- tRPC API routes for customer queries and the admin dashboard.
- A MySQL-compatible database for customer queries and application users.
- Local username/password admin login.
- Optional Manus OAuth admin login.

The easiest deployment method on another hosting provider is the included Dockerfile.

## 1. Recommended hosting options

Use a host that can run a Docker container and connect to a MySQL-compatible database. Examples include Render, Railway, Fly.io, DigitalOcean App Platform, an Ubuntu VPS, or another Docker-compatible provider.

Do not deploy this project to a static-only host such as GitHub Pages, ordinary Netlify static hosting, or ordinary Vercel static output. The public homepage may render, but customer query submission and the admin dashboard require the Node server and database.

You need:

1. A Git repository containing this project.
2. A MySQL-compatible database. PlanetScale, Aiven, Railway MySQL, DigitalOcean Managed MySQL, or a self-managed MySQL server can work if the provider supplies a standard connection URL.
3. A server/container service with a public HTTPS domain.
4. A way to define environment variables or secrets in the hosting provider dashboard.

## 2. What to upload or push

Push the complete project repository. Do not upload only `dist/` and do not commit a `.env` file.

Important files already included in the project are:

- `Dockerfile`
- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `drizzle/` migrations and schema
- `client/` frontend source
- `server/` backend source

The repository ignores `.env` files. Keep all passwords, database URLs, OAuth secrets, and admin credentials in your hosting provider’s protected environment-variable settings.

## 3. Required environment variables

Configure these values in the hosting provider before the first start.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | MySQL-compatible connection URL used by Drizzle and the application. |
| `AGENT_ADMIN_USERNAME` | Yes | Local admin dashboard username. |
| `AGENT_ADMIN_PASSWORD` | Yes | Strong local admin dashboard password. |
| `PORT` | Usually no | Set by most hosts automatically. The app defaults to `3000`. |
| `NODE_ENV` | No | The Dockerfile sets this to `production`. |

A typical database URL looks like this, but use the exact URL supplied by your provider:

```text
mysql://DATABASE_USER:DATABASE_PASSWORD@DATABASE_HOST:3306/DATABASE_NAME?ssl-mode=REQUIRED
```

Do not paste a real password into this guide, Git, a ticket, or a chat message.

## 4. Optional Manus OAuth variables

The local username/password login works on any compatible host and is the simplest external-host setup.

The existing Manus OAuth button is optional. If you also want Manus OAuth to work after moving the site, configure the following values from the original Manus project environment:

| Variable | Purpose |
| --- | --- |
| `MANUS_PROJECT_ID` | OAuth application/project identifier. |
| `MANUS_OAUTH_PORTAL_URL` | OAuth authorization portal base URL. |
| `MANUS_OAUTH_API_URL` | OAuth token-exchange and identity API base URL. |
| `MANUS_JWT_SECRET` | Secret used to sign and verify application sessions. |
| `OWNER_OPEN_ID` | Optional owner identifier used by the starter to assign admin role automatically. |

### OAuth caveat

Manus OAuth is tied to the project and its accepted redirect policy. The callback path in this application is:

```text
https://YOUR-DOMAIN.example.com/api/oauth/callback
```

Before relying on the Manus button on a new host, confirm that the new HTTPS domain is accepted by the Manus OAuth project. If the new domain cannot be registered for that OAuth project, use the local admin login instead.

For a simple independent deployment, it is acceptable to leave the Manus OAuth variables unset and use only the local admin credentials.

## 5. Deploy with Docker

From the project root, test the same build locally:

```bash
corepack enable
corepack prepare pnpm@10.18.0 --activate
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
```

Build the container:

```bash
docker build -t jhena-agent-banking .
```

Run it locally with your environment file:

```bash
docker run --rm \
  --env-file .env.production \
  -p 3000:3000 \
  jhena-agent-banking
```

A safe `.env.production` should exist only on your machine or hosting environment and should never be committed:

```dotenv
DATABASE_URL=mysql://user:password@host:3306/database?ssl-mode=REQUIRED
AGENT_ADMIN_USERNAME=your-admin-username
AGENT_ADMIN_PASSWORD=use-a-long-unique-password
PORT=3000
```

Check the local container:

```bash
curl http://127.0.0.1:3000/api/health
```

Expected response:

```json
{"status":"ok"}
```

Open `http://127.0.0.1:3000/` and `/admin` in a browser. The admin page should show both Manus sign-in and local admin login if the environment variables are present.

## 6. Provider settings

When creating the web service on a Docker-compatible host, use these values:

- **Build method:** Dockerfile.
- **Dockerfile path:** `Dockerfile`.
- **Listening port:** `3000`, or the provider’s injected `PORT` value.
- **Health check path:** `/api/health`.
- **Start command:** use the Dockerfile command; do not add a second process.
- **Persistent disk:** not required for application data because query records live in MySQL.
- **HTTPS:** required, especially for production admin sessions and any OAuth flow.

If the provider does not use the Dockerfile, use:

```bash
corepack enable
corepack prepare pnpm@10.18.0 --activate
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

The service must listen on `0.0.0.0` and use the provider’s `PORT` value. The application already does this in `server/_core/index.ts`.

## 7. Initialize the database

The database must contain the checked-in Drizzle migrations before the admin dashboard can store customer queries.

From a trusted deployment shell with `DATABASE_URL` configured, run:

```bash
pnpm install --frozen-lockfile
pnpm db:migrate
```

This applies:

- The starter `users` table used by Manus OAuth.
- The `customer_queries` table used by the public form and admin dashboard.

Run migrations once per database. Do not repeatedly run destructive schema commands against production. `pnpm db:migrate` is the safer deployment command because it applies only pending migrations.

If your host cannot run a release command, run the migration from a local machine that has secure network access to the database, or use a one-off container/job provided by the host.

## 8. Configure the first admin

Set these two protected variables in the host dashboard:

```text
AGENT_ADMIN_USERNAME
AGENT_ADMIN_PASSWORD
```

Use a unique password that is not reused for Bank Asia, email, hosting, or database access.

Then open:

```text
https://YOUR-DOMAIN.example.com/admin
```

Choose **Sign in locally**. The server creates a signed, HTTP-only admin session cookie. The password is never stored in the repository or database.

If you change the username or password later, restart/redeploy the service so the new environment values are loaded.

## 9. Domain and HTTPS

After deployment:

1. Add your custom domain in the hosting provider.
2. Point the DNS record to the provider’s target.
3. Wait for the provider to issue an HTTPS certificate.
4. Test `/api/health` over HTTPS.
5. Test `/` and `/admin` over HTTPS.
6. Test local admin login.
7. Submit a harmless test query and confirm it appears in the admin dashboard.
8. Remove the test query from the dashboard if it should not remain.

Do not use the site in production over plain HTTP. The local admin session is configured for secure HTTPS cookies on public deployments.

## 10. Backups and operational safety

The application stores customer query records in MySQL. Configure automated database backups with your database provider before collecting real customer information.

Restrict access to:

- The hosting provider account.
- The database provider account.
- The domain registrar/DNS account.
- The admin dashboard credentials.

Never share the admin password through a public document. Rotate it if it is exposed. Keep the database connection URL private.

## 11. Updating the site later

From a new checkout:

```bash
git pull origin main
corepack enable
corepack prepare pnpm@10.18.0 --activate
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
pnpm db:migrate
```

Then redeploy the container or trigger a new deployment from the host dashboard.

If a future code change adds a new migration, deploy the new code and apply `pnpm db:migrate` before relying on the new database feature. Keep the same `DATABASE_URL` so the existing query records remain available.

## 12. Final production checklist

- The service is running from the Dockerfile or the equivalent Node production command.
- `https://YOUR-DOMAIN.example.com/api/health` returns `{"status":"ok"}`.
- `https://YOUR-DOMAIN.example.com/` loads the public site.
- `https://YOUR-DOMAIN.example.com/admin` shows the local login option.
- Invalid local credentials are rejected.
- Valid local credentials open the dashboard.
- A customer query can be submitted and appears in the dashboard.
- Admin status updates and record removal work.
- Database backups are enabled.
- HTTPS is active.
- No `.env` files or secrets were committed to Git.
