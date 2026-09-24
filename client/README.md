# Contify CMS Frontend

For complete project documentation, setup flow, architecture, and policies, use the root guide:

- `../README.md`

This file only contains frontend-local commands.

## Run (Development)

```bash
npm install
npm run dev
```

Frontend default URL:
- http://localhost:5173

## Build

```bash
npm run build
npm run preview
```

## Environment

- Runtime values should be in local `.env`
- Keep `.env.example` as template only

Primary frontend API variable:

```env
VITE_API_URL=http://localhost:9090/api
VITE_GOOGLE_CLIENT_ID=
```

For Vercel, set `VITE_API_URL` to the deployed Spring Boot URL ending in `/api`.
Set `VITE_GOOGLE_CLIENT_ID` to the Google Web OAuth client ID for the deployed frontend origin.

Local location: create `client/.env` beside this README. Vercel location: Project Settings → Environment Variables. Only `VITE_*` values belong there.
