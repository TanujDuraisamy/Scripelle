# Scripelle

Scripelle is an experimental writing application with a rich-text document editor, AI assistance, account approval tools and a separate marketing website.

**Status: private rebuild under review. Not yet approved for open-source release or production deployment.** Core source has been integrated; database/provider integration, security follow-ups and ownership/licensing review remain open. See [validation](docs/validation-report.md), [security](docs/security-audit.md) and [architecture](docs/architecture-audit.md).

## Applications

| Directory | Purpose | Local address |
| --- | --- | --- |
| `apps/frontend` | React 19, TipTap, Tailwind 4 writing interface | http://localhost:5174 |
| `apps/backend` | Express 5, TypeScript, Prisma/PostgreSQL API | http://localhost:5000 |
| `apps/admin` | React admin UI for beta approvals and analytics | http://localhost:8080 |
| `apps/website` | Marketing site and optional external email capture | http://localhost:5173 |
| `legacy` | Preserved original Google Docs app and umbrella reference code | Not part of the supported runtime |

Each application has its own npm lockfile because the delivered applications use different UI dependency generations. Root scripts provide convenience commands; this is not an npm workspace. Do not run the historical raw SQL migration alongside Prisma.

## Prerequisites and installation

Use an up-to-date Node.js 22 release (minimum 22.12), npm 10 or compatible, Git, and a **new local PostgreSQL 16 database**. Docker Compose is optional. Existing production databases need a separately reviewed migration plan.

From the repository root:

```sh
npm --prefix apps/backend ci --ignore-scripts
npm --prefix apps/frontend ci --ignore-scripts
npm --prefix apps/admin ci --ignore-scripts
npm --prefix apps/website ci --ignore-scripts
npm --prefix apps/backend run prisma:generate
```

Install hooks are deliberately disabled. The explicit Prisma generation command is reviewed and required. Native tools use platform packages; if your platform needs a build hook, inspect that package's script before running it. Do not globally enable lifecycle hooks to bypass an installation error.

## Configuration and database

Copy `apps/backend/.env.example` to `apps/backend/.env`. Set `DATABASE_URL` for your local database and independently generate values for `JWT_SECRET`, `JWT_REFRESH_SECRET` and `SESSION_SECRET` (at least 32 characters each). For example, run this command three times and put each output into a different setting:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

To use the optional local database container, copy root `.env.example` to `.env`, set a strong `POSTGRES_PASSWORD`, and use that same password in the backend database URL. Then run `docker compose up -d db`. The port is bound only to localhost. Data lives in a named volume; do not remove that volume unless deliberately discarding the local database.

Apply the supplied Prisma migrations only to the new local database:

```sh
cd apps/backend
npx --no-install prisma migrate deploy
cd ../..
```

The migration chain creates users, documents, beta access records and decimal credits. The added migration also stores document context. It has not been executed against an existing database during this rebuild. Existing negative credit balances will prevent the nonnegative constraint from applying; investigate them instead of forcing the migration.

Copy frontend/admin `.env.example` files if you need a different backend origin. `VITE_BACKEND_URL` excludes `/api/v1`. Use `localhost` consistently across all apps. Vite variables are public and compiled into browser bundles; never put secrets in them.

Optional backend services:

- Gemini: set `GEMINI_API_KEY` and a model available to your account in `GEMINI_MODEL`.
- Google OAuth: set client ID/secret and register `http://localhost:5000/api/v1/auth/google/callback`. Existing password accounts are not automatically linked.
- Password-reset email: configure `EMAIL_USER`, `EMAIL_PASS`, and optionally `EMAIL_FROM` for the delivered Gmail transport. TLS certificate validation is enabled.
- Rephrasy: set `REPHRASY_API_KEY` only if you intend to send text to that service.

Provider features are unavailable without configuration. Documents/prompts can be transmitted to configured providers when those features are used. The website has independent `VITE_WAITLIST_ENDPOINT` and `VITE_GA_MEASUREMENT_ID` settings, both blank by default. A website submission does not approve an application account.

## Run locally

Use separate terminals from the repository root:

```sh
npm run dev:backend
npm run dev:frontend
npm run dev:admin
npm run dev:website
```

The API defaults to loopback binding. `GET /health` checks process availability, not database readiness.

Register an account in the frontend; it starts on the waiting list. To bootstrap your own development administrator, enter `apps/backend` and run:

```sh
npm run admin:promote -- your-development-account@example.test
```

This requires local database access and promotes an existing account. The network admin-create endpoint requires an existing approved administrator. Use the admin UI to approve other accounts. Credits start at zero; an administrator can allocate them through the authenticated `/api/v1/credits/add` endpoint. No payment integration is supplied. Logout and password reset revoke all sessions for the account. The new token-version migration invalidates pre-rebuild tokens; users must sign in again. Old plaintext password-reset links are not accepted by the hashed-token flow.

## Validate

For each app, run `npm --prefix apps/APP run typecheck` and `npm --prefix apps/APP run build`. For frontend/admin/website, run `npm --prefix apps/APP run lint`. Backend checks use TypeScript and targeted tests:

```sh
npm --prefix apps/backend run build
npm test
npm run check:release
```

Backend HTTP tests use database doubles and no external credentials. They do not certify migrations, PostgreSQL transactions or provider integrations. The retained original targeting diagnostic can be run with `node legacy/original/frontend/src/utils/aiTargeting.test.js`; it is a console diagnostic, not a reliable assertion-based suite.

Run `npm audit` inside each active app. Inherited lint warnings and dependency advisories remain; exact outcomes and dates are recorded in [validation-report.md](docs/validation-report.md). CI intentionally exposes failing checks; it does not waive them.

## Features and limitations

Source includes document CRUD, rich-text formatting, AI chat/insertion, autocomplete, beta approval, email/password login, OAuth and password-reset flows. Live service functionality still needs integration testing. Some ribbon actions are unfinished, session analytics and trend charts are placeholders, and there is no billing implementation. Google Docs/Drive functionality from the original repository is retained under `legacy/` and is not connected to the active PostgreSQL document model.

## Deployment and contributions

Each app includes a Dockerfile; build with that app directory as context. Browser apps serve static builds through Nginx with SPA fallback. Set Vite origins at build time; backend secrets belong in runtime configuration. Apply database migrations as a separate reviewed deployment step. Production OAuth session storage, proxy/cookie policy, the open security findings must be addressed before deployment. No application was deployed during the rebuild.

See [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md). No project-wide open-source license has been selected or granted. Existing third-party terms remain applicable; owner approval and commissioned-code/asset rights confirmation are required. See [licensing-review.md](docs/licensing-review.md).
