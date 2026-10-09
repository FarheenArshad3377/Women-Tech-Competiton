# Backend API

Express + PostgreSQL backend with JWT access tokens and rotating refresh tokens in HTTP-only cookies. Supports local Node.js development and Vercel serverless deployment.

## Requirements

- Node.js 20+
- PostgreSQL database (local or managed)
- npm

## Install

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env` with your real database URL and two different random secrets (each at least 32 characters). Never commit `.env`.

Generate secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Run it twice to generate separate access and refresh secrets.

## Initialize PostgreSQL

Create a database, then run the schema using `psql`:

```bash
psql "$DATABASE_URL" -f database/schema.sql
```

Or use the package script after `.env` is configured:

```bash
npm run db:init
```

For hosted PostgreSQL, set `DATABASE_SSL=true` only when your provider requires TLS. If your provider supplies a CA certificate, configure certificate validation according to that provider rather than disabling TLS verification.

## Run locally

```bash
npm run dev
```

API defaults to `http://localhost:5000`.

## Endpoints

- `GET /api/health`
- `POST /api/auth/register` body: `{ "name": "Example", "email": "person@example.com", "password": "a-long-password" }`
- `POST /api/auth/login` body: `{ "email": "person@example.com", "password": "a-long-password" }`
- `GET /api/auth/me` (requires the access cookie)
- `POST /api/auth/refresh` (uses refresh cookie and rotates it)
- `POST /api/auth/logout`

Successful login/register returns a user object and sets HTTP-only cookies. Tokens are not returned in JSON. Send requests with credentials enabled in the frontend, e.g. `fetch(url, { credentials: "include" })`.

## Vercel deployment

1. Push the repository to Git.
2. Import it into Vercel.
3. Configure the project Root Directory as `backend` if deploying this directory as its own project.
4. Ensure `api/index.js`, `src/`, `database/`, and `package.json` are included in the deployment.
5. Add all `.env.example` variables in Vercel Project Settings → Environment Variables. Set `NODE_ENV=production`, `COOKIE_SECURE=true`, and `FRONTEND_ORIGIN` to the exact deployed frontend origin.
6. Deploy, then initialize the hosted PostgreSQL schema once using your database provider's SQL editor or a trusted local `psql` connection.

If frontend and backend are deployed on different sites, cookies and CORS need deliberate configuration. For cross-site cookies, set `COOKIE_SAME_SITE=none` and `COOKIE_SECURE=true`, and add CSRF protection before production use. If using a custom domain under the same site, `lax` may be suitable. Do not use wildcard CORS with credentials.

## Security notes

- Passwords are hashed with bcrypt.
- Access JWTs are short-lived and stored in HTTP-only cookies.
- Refresh JWTs are stored only as SHA-256 hashes in PostgreSQL and rotated on use.
- Authentication routes are rate limited; input is validated.
- Cookie-based authentication needs CSRF defenses for production deployments, especially with cross-site cookies. Add an explicit CSRF token/origin strategy before exposing state-changing routes publicly.
- For production, review PostgreSQL TLS settings, monitoring, backup strategy, token reuse handling, and provider connection limits.

## Important implementation note

Refresh rotation consumes the previous refresh token and creates a new one. For stricter transactional guarantees, wrap token consumption and replacement in a database transaction; use a PostgreSQL client transaction helper if you extend this service. The current API is a foundation, not a substitute for a deployment-specific security review.
