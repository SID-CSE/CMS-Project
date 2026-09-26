# Contify CMS

Contify CMS is a role-based content workflow platform built for production deployment with:

```
React frontend -> HTTPS REST API -> Spring Boot backend -> JDBC -> MySQL
```

The deployable application is `client/` plus `server/`. The legacy `php_project/` directory is intentionally out of scope and is not part of the production architecture or deployment instructions.

## Features

- JWT authentication with BCrypt password hashing
- Server-side role authorization for Admin, Editor, and Stakeholder workflows
- Project requests, proposals, tasks, deliverables, reviews, feedback, messaging, notifications, finance, media, and audit views
- Read-only guest workspace with fictional sample data and a guided workflow walkthrough
- Migration-safe email verification for new password accounts
- Google Identity Services sign-in verified by Spring Boot

## Local Development

Prerequisites: Node.js 22.12+, Java 21+, Maven wrapper, and MySQL 8+.

1. Copy `server/.env.example` to `server/.env` and set local MySQL values and a local JWT secret.
2. Copy `client/.env.example` to `client/.env`.
3. Start the backend:

   ```bash
   cd server
   SPRING_PROFILES_ACTIVE=dev ./mvnw spring-boot:run
   ```

   In PowerShell, use `$env:SPRING_PROFILES_ACTIVE="dev"; .\mvnw.cmd spring-boot:run`.

   The backend uses `http://localhost:9090` locally.

4. Start the frontend in another terminal:

   ```bash
   cd client
   npm install
   npm run dev
   ```

   The frontend uses `http://localhost:5173` locally.

5. To explore without an account, open `http://localhost:5173/demo` or choose **Try Demo** from the landing or login screen.

## Where To Enter Configuration

Use these locations; do not put backend secrets in React files:

| Environment | Location | Values to enter |
|---|---|---|
| Local backend | Create `server/.env` by copying `server/.env.example` | `DB_*`, `JWT_SECRET`, `FRONTEND_URL`, `FRONTEND_BASE_URL`, `MAIL_*`, `GOOGLE_CLIENT_ID` |
| Local frontend | Create `client/.env` by copying `client/.env.example` | `VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID`, and optional public Cloudinary values |
| Render backend | Render service → **Environment** | `DB_*`, `JWT_SECRET`, `FRONTEND_URL`, `FRONTEND_BASE_URL`, `MAIL_*`, `GOOGLE_CLIENT_ID` |
| Vercel frontend | Vercel project → **Settings → Environment Variables** | `VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID`, and optional public Cloudinary values |
| Google OAuth | Google Cloud Console → OAuth client → **Authorized JavaScript origins** | `http://localhost:5173` and your Vercel URL |

Never commit `server/.env` or `client/.env`. Never enter `DB_PASSWORD`, `JWT_SECRET`, or `MAIL_PASSWORD` in Vercel.

## Production Deployment

### 1. Create Free MySQL-Compatible Database

Use a free TiDB Cloud Starter database. TiDB speaks the MySQL protocol and works with the existing JDBC driver. Back up local `Contify` first, import the dump, and verify counts and stable user IDs. Do not commit database credentials.

### 2. Deploy Spring Boot

Deploy `server/` to a Render Free Web Service. In Render, open the service's **Environment** tab and add these values individually:

| Variable | Purpose | Local example | Production value |
|---|---|---|---|
| `DB_URL` | TiDB/MySQL JDBC URL | `jdbc:mysql://localhost:3306/Contify` | TiDB connection URL |
| `DB_USERNAME` | Database user | `root` | TiDB user |
| `DB_PASSWORD` | Database password | local-only value | TiDB password |
| `JWT_SECRET` | JWT signing key | local random value | Long random secret, 32+ characters |
| `FRONTEND_URL` | Comma-separated allowed browser origins | `http://localhost:5173` | Exact Vercel HTTPS origin(s) |
| `FRONTEND_BASE_URL` | Single origin used in password reset links | `http://localhost:5173` | Primary Vercel HTTPS origin |
| `SPRING_PROFILES_ACTIVE` | Runtime configuration profile | `dev` | `prod` |
| `PORT` | HTTP port | `9090` | Platform-provided value |
| `MAIL_ENABLED` | Enable verification/reset email delivery | `false` | `true` |
| `MAIL_HOST` / `MAIL_PORT` | SMTP server | local SMTP settings | Provider SMTP settings |
| `MAIL_USERNAME` / `MAIL_PASSWORD` | SMTP credentials | local-only values | Provider credentials |
| `MAIL_FROM` | Sender address | `no-reply@example.com` | Verified sender |
| `GOOGLE_CLIENT_ID` | Server-side Google token audience | blank until configured | Google Web client ID |

Render provides `PORT` automatically. Free Render services may sleep after inactivity; the first request can be slow.

Spring Boot defaults to the `prod` profile, which requires the database and JWT settings, enforces verified TLS, and uses `ddl-auto=validate`. Set Render `SPRING_PROFILES_ACTIVE=prod`. Back up and import the complete database, then apply `server/migrations/001_add_email_verification.sql` before the first production start. Local development uses the explicit `dev` profile and Hibernate `ddl-auto=update`.

### 3. Deploy React

Deploy `client/` to Vercel. Open **Project Settings → Environment Variables** and add these public build variables:

```env
VITE_API_URL=https://your-render-backend.onrender.com/api
VITE_GOOGLE_CLIENT_ID=your-google-web-client-id
```

Only `VITE_*` values are bundled into the browser. Never put passwords, JWT secrets, or provider API keys in them.

For Google sign-in, also set `VITE_GOOGLE_CLIENT_ID` to the same Google Web client ID used by the backend.

### 4. Configure CORS

Set the backend `FRONTEND_URL` to the exact deployed frontend origin, for example `https://contify.example.vercel.app`. Include the scheme and host, omit a trailing slash, and do not use `*` with authenticated requests.

### 5. Verify deployment

- `GET https://your-spring-backend-domain/api/health` returns `{"status":"UP","service":"Contify CMS"}`.
- Test login and signup with a non-production test account.
- Test Admin, Editor, and Stakeholder server-side permissions.
- Test project, task, deliverable, messaging, notification, media, and audit workflows.
- Test `https://your-frontend-domain/demo`; it must never issue a JWT or call the backend.

## Guest Mode

Guest Mode is a public `/demo` route. It contains fictional users, the Website Redesign project, Acme Corporation, sample tasks and deliverables, role-specific dashboard metrics, contextual workflow explanations, and a ten-step walkthrough. Role switching, workflow navigation, and the “See How Contify Works” presentation are client-side only.

Write actions display a disabled-action dialog with Sign Up and Log In links. No guest credentials, production records, API writes, or database access are involved.

## Existing Data Migration

Do not create a fresh database and recreate users. Back up the complete local `Contify` database first, import that backup into TiDB Cloud, verify counts and stable user IDs, and only then apply the additive email-verification migration. See [the free deployment and migration runbook](docs/FREE_DEPLOYMENT.md).

## CI

The GitHub Actions workflow in `.github/workflows/ci.yml` runs frontend lint/build and `./mvnw -B clean verify` on pushes and pull requests. It does not deploy automatically.

## Repository Hygiene

- `.env`, credentials, build output, `node_modules`, and Maven `target` output are ignored.
- `.env.example` files contain placeholders only.
- Production deployment excludes `php_project/`.
- `Credentials.txt` remains ignored and must not be committed.

## Module Documentation

- [Environment and deployment keys](docs/ENVIRONMENT_SETUP.md)
- [Free deployment runbook](docs/FREE_DEPLOYMENT.md)
- [Frontend guide](client/README.md)
- [Backend guide](server/README.md)
- [REST API reference](server/API_DOCUMENTATION.md)
