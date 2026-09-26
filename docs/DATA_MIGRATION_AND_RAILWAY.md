# Contify Data Migration and Railway Deployment

This runbook applies only to the React + Spring Boot + MySQL application. `php_project/` is excluded.

## Safety Rule: Back Up First

Do not change the local database or deploy the application until a complete backup exists. The backup must include schema, users, roles, projects, proposals, tasks, deliverables, messages, notifications, and every other application table.

From a machine with the MySQL client installed:

```bash
mysqldump --single-transaction --routines --triggers --events --hex-blob --set-gtid-purged=OFF -h 127.0.0.1 -P 3306 -u root -p Contify > contify-backup-2026-09-25.sql
```

Keep the dump outside Git. Confirm it is non-empty and copy it to secure backup storage. Do not paste the password into shell history.

## What Was Inspected

The existing `users` table uses stable `CHAR(36)` IDs, `email`, `username`, `role`, `password_hash`, `is_active`, `created_at`, and `updated_at`. Existing passwords remain BCrypt hashes. User-owned relationships include company/editor profiles, project requests, plans, milestones, tasks, submissions, files, finance records, messages, notifications, and password reset tokens through existing user IDs.

There was no email verification field. The new design adds nullable `users.email_verified` and a separate `email_verification_tokens` table. Existing rows remain `NULL` and can continue to log in. New password registrations are `false` and cannot receive a normal JWT until verified. No existing ID, password hash, role, project, task, proposal, message, or notification is rewritten.

## Prepare Railway MySQL

1. Create a Railway project.
2. Add a MySQL service.
3. Inspect the new database before importing:

   ```sql
   SELECT COUNT(*) AS existing_rows FROM information_schema.tables WHERE table_schema = DATABASE();
   ```

4. If it contains application data, stop and decide whether it is the intended target. Do not import over an unknown non-empty database.
5. Obtain the Railway MySQL host, port, database, username, password, and SSL requirements from Railway variables.
6. Import the backup into the intended database. Replace placeholders with values from Railway and do not commit them:

   ```bash
   mysql --host=RAILWAY_HOST --port=RAILWAY_PORT --ssl-mode=REQUIRED \
     --user=RAILWAY_USER --password RAILWAY_DATABASE < contify-backup-2026-09-25.sql
   ```

7. Verify counts before applying the additive migration.
8. Run `server/migrations/001_add_email_verification.sql` manually after the backup and data import. Production starts with `SPRING_PROFILES_ACTIVE=prod` and `spring.jpa.hibernate.ddl-auto=validate`; do not rely on Hibernate to alter the schema.

## Data Verification Queries

Run these against the imported Railway database. They expose counts and IDs only, never passwords or password hashes:

```sql
SELECT COUNT(*) AS users FROM users;
SELECT role, COUNT(*) AS users_by_role FROM users GROUP BY role ORDER BY role;
SELECT COUNT(*) AS projects FROM project_requests;
SELECT COUNT(*) AS proposals FROM project_plans;
SELECT COUNT(*) AS tasks FROM tasks;
SELECT COUNT(*) AS deliverables FROM task_submissions;
SELECT COUNT(*) AS messages FROM messages;
SELECT COUNT(*) AS notifications FROM notifications;
SELECT id, email, role, is_active, created_at FROM users ORDER BY created_at, id;
```

Compare the output with the local database before deployment. The user IDs must match exactly. Do not select `password_hash` in verification queries.

## Railway Spring Boot Service

Create a Railway service from the repository and set its root directory to `server`. Use:

- Build command: `./mvnw clean package -DskipTests`
- Start command: `java -jar target/server-0.0.1-SNAPSHOT.jar`
- Railway injects `PORT`; the application uses `server.port=${PORT:9090}`.

In Railway, open the Spring Boot service, select **Variables**, click **New Variable**, and add each variable below. Do not paste these into `application.properties`, commit them, or add them to the React project.

```env
DB_URL=jdbc:mysql://RAILWAY_HOST:RAILWAY_PORT/RAILWAY_DATABASE?useSSL=true&sslMode=VERIFY_IDENTITY&serverTimezone=UTC&allowPublicKeyRetrieval=true
SPRING_PROFILES_ACTIVE=prod
DB_USERNAME=RAILWAY_USER
DB_PASSWORD=RAILWAY_PASSWORD
JWT_SECRET=LONG_RANDOM_SECRET_AT_LEAST_32_CHARACTERS
FRONTEND_URL=https://YOUR-VERCEL-DOMAIN
FRONTEND_BASE_URL=https://YOUR-VERCEL-DOMAIN
MAIL_ENABLED=true
MAIL_HOST=YOUR_SMTP_HOST
MAIL_PORT=587
MAIL_USERNAME=YOUR_SMTP_USERNAME
MAIL_PASSWORD=YOUR_SMTP_PASSWORD
MAIL_FROM=no-reply@YOUR-DOMAIN
MAIL_DEV_EXPOSE_VERIFICATION_URL=false
GOOGLE_CLIENT_ID=YOUR_GOOGLE_WEB_CLIENT_ID
PORT=DO_NOT_SET_MANUALLY_UNLESS_RAILWAY_REQUIRES_IT
```

Never place `DB_PASSWORD`, `JWT_SECRET`, or `MAIL_PASSWORD` in React/Vercel variables. Keep `MAIL_DEV_EXPOSE_VERIFICATION_URL=false` in Railway.

## Email Verification Policy

- Existing users with `email_verified IS NULL` can log in and see a reminder.
- New password users are created with `email_verified=false`, receive a verification email, and receive no JWT until verified.
- Google users are accepted only when Google confirms the email and are marked verified.
- Tokens are cryptographically random, stored only as SHA-256 hashes, expire, and are single-use.
- `MAIL_ENABLED=false` is suitable for local development. With `MAIL_DEV_EXPOSE_VERIFICATION_URL=true`, the local registration response includes a development-only link. Never enable that setting in production.
- Existing users are not emailed automatically. They can use the in-app resend action.

## Google Sign-In Setup

1. In Google Cloud Console, create a Web OAuth client ID.
2. Add the local origin `http://localhost:5173` and the deployed Vercel origin to Authorized JavaScript origins.
3. Set `VITE_GOOGLE_CLIENT_ID` in `client/.env` locally and in the Vercel project environment.
4. Set the same value as Railway `GOOGLE_CLIENT_ID`.
5. The browser obtains a Google ID token through Google Identity Services; Spring Boot verifies the token audience and verified email before issuing the Contify JWT.
6. Existing users are matched by email, preserving their existing ID, role, and BCrypt password hash. A new Google account defaults to Stakeholder unless the selected signup role is sent.

## Frontend Deployment

For local development, copy `client/.env.example` to `client/.env` and set the values there. For deployment, open Vercel **Project Settings → Environment Variables** and add:

```env
VITE_API_URL=https://YOUR-RAILWAY-BACKEND-DOMAIN/api
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_WEB_CLIENT_ID
```

Then set Railway `FRONTEND_URL` to the exact Vercel origin, without a trailing slash. Verify:

```text
https://YOUR-RAILWAY-BACKEND-DOMAIN/api/health
https://YOUR-VERCEL-DOMAIN/demo
```

## Final Test Order

1. Restore and count existing users/data.
2. Test an existing verified user's password login.
3. Test an existing legacy user's password login and resend verification.
4. Verify the legacy user's email and log in again.
5. Register a new password user and confirm no JWT is issued before verification.
6. Verify the new user and confirm login succeeds.
7. Test Google sign-in with an existing email and a new Google account.
8. Test Admin, Editor, and Stakeholder authorization.
9. Test Guest Mode; it must not call the API or receive a JWT.
10. Test project, task, deliverable, messaging, and notification workflows.
