# Contify CMS Backend

For complete project documentation, setup flow, architecture, and policies, use:

- `../README.md`

For endpoint details, use:

- `API_DOCUMENTATION.md`

This file only contains backend-local commands.

## Run (Development)

```bash
mvnw spring-boot:run
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
- Required deployment variables are `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `FRONTEND_URL`, and platform-provided `PORT`.
- Health check: `GET /api/health` returns the service status without sensitive data.
