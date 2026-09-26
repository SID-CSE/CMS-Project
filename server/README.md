# Contify CMS Backend

For complete project documentation, setup flow, architecture, and policies, use:

- `../README.md`

For endpoint details, use:

- `API_DOCUMENTATION.md`

This file only contains backend-local commands.

## Run (Development)

```bash
SPRING_PROFILES_ACTIVE=dev ./mvnw spring-boot:run
```

Backend default URL:
- http://localhost:9090

## Build and Test

```bash
mvnw clean compile
mvnw test
```

## Environment

- Runtime values should be in local `.env`
- Keep `.env.example` as template only
- Production sets `SPRING_PROFILES_ACTIVE=prod` and requires `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `FRONTEND_URL`, `FRONTEND_BASE_URL`, and platform-provided `PORT`. Local runs must explicitly select `dev`.
- Free deployment target: Render Free for the API and TiDB Cloud Starter for MySQL-compatible storage.
- Health check: `GET /api/health` returns the service status without sensitive data.
- Exact locations for local, Render, Vercel, Google, Brevo, and Cloudinary values: `../docs/ENVIRONMENT_SETUP.md`.
