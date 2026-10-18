# Deploy with Aiven MySQL + Render (step by step)

What changed in this copy of the project (everything else is untouched):
- `server/_core/dbConfig.ts` (new): understands Aiven's `?ssl-mode=REQUIRED` URL. The original code ignored it, so Aiven would refuse the connection.
- `server/db.ts`, `drizzle.config.ts`: use that helper (app + migrations).
- `server/_core/migrate.ts` (new) + one line in `server/_core/index.ts`: with `RUN_MIGRATIONS=true` the tables are created automatically at startup.
- `.env.example` (new): the variables you must set. Note `MANUS_JWT_SECRET` is REQUIRED for admin login even outside Manus.

## Part A: Aiven (database)
1. Open the Aiven service `jhenaidahagentbnking` > Overview. If it is on the trial plan, change the plan to **Free** (Aiven allows this if your data fits in 1 GB). Free plans keep running after the trial ends.
2. In "Connection information" > MySQL tab, click the password reveal link and copy the **Service URI**. Keep `?ssl-mode=REQUIRED` at the end.
3. Download the **CA certificate** from the same page (ca.pem). Open it in Notepad and copy the whole text. (Optional but recommended.)
4. Leave "Allowed IP addresses" open (the default). Free Render and free Aiven have no fixed IPs.

## Part B: GitHub
5. Create a **private** repository on GitHub.
6. Unzip this project, open a terminal in the folder and run:
   git init
   git add .
   git commit -m "Initial"
   git branch -M main
   git remote add origin https://github.com/YOUR-NAME/YOUR-REPO.git
   git push -u origin main

## Part C: Render (runs the app)
7. render.com > New > Web Service > connect the GitHub repo.
8. Language: **Docker**. Instance type: **Free**. Advanced > Health Check Path: `/api/health`.
9. Environment variables (Render > Environment):
   - DATABASE_URL = the Service URI from step 2
   - DATABASE_CA_CERT = the ca.pem text from step 3 (optional)
   - AGENT_ADMIN_USERNAME = a username you choose
   - AGENT_ADMIN_PASSWORD = a long, unique password
   - MANUS_JWT_SECRET = a long random string (see below)
   - RUN_MIGRATIONS = true
   Random string in Windows PowerShell:
   $b = New-Object byte[] 48; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b); [Convert]::ToBase64String($b)
10. Create the service and wait for the deploy log to say "Migrations complete." and "Server listening".

## Part D: Test
11. Open https://YOUR-APP.onrender.com/api/health -> {"status":"ok"}
12. Submit the form on the home page.
13. Open /admin > Sign in locally > the query should be listed.

## If something fails
- "MANUS_JWT_SECRET is unavailable": set MANUS_JWT_SECRET.
- "Access denied": wrong password in DATABASE_URL (re-copy the Service URI).
- Connection timeout: check Allowed IP addresses in Aiven; make sure the Aiven service is powered on.
- Certificate errors: re-copy the whole ca.pem (including BEGIN/END lines), or remove DATABASE_CA_CERT.
- Free Render sleeps after 15 minutes idle; the first visit afterwards takes a while to load.
