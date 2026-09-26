# Contify CMS Production Readiness Audit

## Scope

Read-only static audit of the React client, Spring Boot server, legacy PHP MVC implementation, manifests, environment templates, security configuration, documentation, and deployment surfaces. Build/install/test execution was skipped under the prereq audit policy.

## Summary

**Overall status: BLOCKED for production deployment until security and release controls are corrected.**

The documented production architecture is viable: React/Vite on Vercel, Spring Boot on Render or a container platform, and managed MySQL-compatible storage such as TiDB Cloud. The codebase has manifests and lockfiles, a documented health route, JWT/role authorization, and externalized environment templates. It is not yet production-ready because production-safe secret enforcement, database migration policy, TLS defaults, deployment automation, and CI/CD evidence are incomplete.

## Component Matrix

| Component | Build | Completeness | Deployability | Assessment |
|---|---|---|---|---|
| `client/` | PASS by manifest and prior local build evidence | WARN | WARN | Deployable as a static SPA after environment injection and smoke checks |
| `server/` | PASS by Maven structure and prior local build evidence | WARN | WARN | Deployable after production configuration hardening and migration control |
| `php_project/` | SKIPPED | WARN | WARN | Legacy alternative; excluded by documented production architecture |

## Critical Findings

### Security and configuration

1. **Production can start with a fallback JWT secret.** `application.properties` supplies a development fallback when `JWT_SECRET` is missing. A production instance must fail fast instead of signing tokens with a predictable value.
2. **Database TLS is disabled in the default JDBC fallback.** Production must use an explicit TLS-enabled `DB_URL`; do not rely on the local fallback or `useSSL=false`.
3. **Hibernate `ddl-auto=update` is enabled.** This allows runtime schema mutation and creates migration drift. Use versioned migrations and `validate`/`none` in production.
4. **CORS configuration is duplicated.** Both Spring Security and MVC register CORS rules. Keep one source of truth and verify the exact deployed Vercel origin.
5. **The client build embeds public Cloudinary configuration.** Cloud name and unsigned upload preset are public by design, but API secret, database credentials, SMTP credentials, and JWT secrets must never enter `VITE_*` variables or the client bundle. Revoke any secret if it has ever appeared in generated `dist` or tracked history.

### Release/deployment

6. **No Dockerfile, IaC, or CI/CD workflow is present in the detected deployment surfaces.** The README describes manual Vercel/Render deployment, but reproducibility and automatic regression checks are not implemented.
7. **The repository contains three application implementations.** Deploy only the documented `client/` + `server/` path. Exclude `php_project/`, `server/target/`, `client/dist/`, database dumps, credentials, and local `.env` files from deployment artifacts.
8. **Database migration ownership is unclear.** There is a manual email-verification migration while Hibernate auto-update remains enabled. Pick one controlled migration path and test it against a clean staging database.

### Quality and runtime risks

9. **The audit could not certify current runtime behavior without executing the sanctioned build/test commands.** Existing manifests and prior local build evidence are positive, but a release gate still needs fresh client build, Maven test/package, PHP syntax checks if PHP remains supported, and endpoint/browser smoke tests.
10. **External integrations are required for complete behavior.** Production needs MySQL/TiDB, SMTP, Google OAuth, and Cloudinary values and must verify their origins, TLS, quotas, upload policies, and failure handling.

## Positive Evidence

- Client has `package.json` and `package-lock.json` with Vite build/lint scripts.
- Server has Maven wrapper, `pom.xml`, Java 21 configuration, Spring Boot entrypoint, health route, and tests.
- JWT, BCrypt, stateless sessions, DTO validation, and role-aware server routes are present.
- Environment templates exist for client, server, and PHP; local secret files are ignored by Git.
- Root documentation identifies the intended Vercel + Render + managed MySQL deployment path.
- Demo writes are blocked and demo media is wired to Cloudinary public IDs with local fallback.

## Recommended Deployment Target

Use the documented split deployment:

- **Frontend:** Vercel static deployment from `client/`.
- **Backend:** Render Web Service from `server/`, using the Maven wrapper and platform `PORT`, or containerize it for a more reproducible deployment.
- **Database:** TiDB Cloud/MySQL-compatible managed database with TLS.
- **Media:** Cloudinary with unsigned browser upload only for narrowly scoped public presets; signed server-side delivery/upload for protected assets.
- **Email/OAuth:** Brevo or another SMTP provider and Google OAuth with exact production origins.

Do not deploy the PHP implementation unless it receives its own PHP runtime, database, session, and deployment plan.
