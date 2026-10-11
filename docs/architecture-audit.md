# Scripelle architecture audit

Audit date: 2026-10-11. Scope: five supplied ZIPs, original checkout, all fetched Git refs and source/package/build configuration. No supplied application was executed during extraction. This is a private integration candidate, not an approved public release.

## Preservation and evidence

Original branch: `tanuj-main`; original commit: `8e8e47dbea4e6efdc5986ae006512387c34361e6`. `old-version` was created at that commit, pushed to origin and verified with `git ls-remote`. Origin redirects to the private `TanujDuraisamy/Scripelle` repository. No history was rewritten. The lockfile initially reported modified had the same normalized Git object as HEAD; its original bytes and a complete Git bundle were saved outside the repository. All subsequent edits are on `open-source-rebuild`.

`archive-inventory.json` records ZIP hashes, entry counts, expanded sizes and flagged types; `source-manifest.json` inventories every delivered file with its SHA-256. Original ZIPs remain untouched. Extraction rejected absolute paths, traversal, drive/ADS syntax, symlinks, reserved Windows names, trailing-dot/space segments and case collisions. None were found. No embedded `.git` directories were present. SQL migrations, Dockerfiles, hidden configuration, environment files and package scripts were inspected. Archives were 0.09–17.7 MB compressed, with no dependency directories or database dumps identified.

## Project-by-project findings

| Input | Architecture and entry point | Behavior and dependencies | Disposition |
| --- | --- | --- | --- |
| Existing Git repository | JavaScript/JSX React 19/Vite 6 frontend (`src/main.jsx`); ESM Express 5 backend (`src/index.js`), PostgreSQL `pg` | Google OAuth sessions, Google Docs/Drive routes, AI completion/chat, document UI, fuzzy targeting utilities. No Prisma migrations. Root mistakenly tracked node_modules. Frontend `.env` tracked. Frontend/backend dependency declarations incomplete relative to imports. | Tracked source retained under `legacy/original`; exact pre-rebuild history remains on `old-version`. Excluded from active checks and deployment. |
| `Scripelle_project-master.zip` | Umbrella React 19/Vite 7 frontend and CommonJS TypeScript Express 5 backend; root Compose files | PostgreSQL/Prisma 6, password/JWT authentication, basic document CRUD, Gemini generate/stream/chat routes. Four Prisma migrations. Contenteditable/A4 editor, in-memory Zustand state. Dockerfile contains credentials. | Earlier umbrella of the newer application family, not the existing Google Docs app. Preserve unique controller/routes under `legacy/umbrella-backend`; do not copy obsolete credentials or duplicated builds. |
| `scripelle-backend-main.zip` | Express 5/TypeScript, `src/App.ts`; `tsc` -> `dist/App.js`; npm | Prisma 6 PostgreSQL, bcrypt, JWT access tokens plus refresh cookie, Passport Google OAuth, Gemini, Rephrasy, Gmail/Nodemailer. Adds admin/beta approval, analytics, password reset, credit accounting, autocomplete and document ownership field. Eight supplied Prisma migrations plus separate conflicting raw SQL schema. No automated test suite. | `apps/backend`, with targeted security/configuration repairs and new regression tests. |
| `scripelle-frontend-main.zip` | React 19/TypeScript, Vite 7, Tailwind 4; `src/main.tsx`, React Router, Zustand | TipTap 3 rich-text editor and retained A4 editor, dashboard CRUD, JWT refresh, password reset, AI sidebar, autocomplete. Axios to `/api/v1`. npm lockfile; Docker/Nginx. Template README. No tests. Some ribbon actions and secondary editor/comments/context UI incomplete or disconnected. | `apps/frontend`; preserve components, repair sidebar insertion callback and registration access-token field. |
| `scripelle-admin-panel-main.zip` | React 18/TypeScript, Vite 5, Tailwind 3, Radix/shadcn UI; `src/main.tsx` | Login, user approval/rejection, beta email list/bulk import, analytics; live pages use authenticated helpers. Unused generic Axios/API constants describe `/users` and `/access` endpoints that do not exist. Active pages instead use `/admin` and `/analytics`. npm and Bun lockfiles delivered; no tests. Template Lovable README/tagger. | `apps/admin`; retain npm, remove redundant Bun lock and development tagger; centralize backend URL. |
| `Scripelle-website-main.zip` | React 19/TypeScript, Vite 7, Tailwind 4, Framer Motion; `src/main.tsx` | Marketing page, email capture to Formspree, Google Analytics, fonts/images. Not connected to backend beta list. No database/authentication/tests or delivered container recipe. | `apps/website`; explicit opt-in collection endpoint and analytics settings; retained visuals pending rights review. |

### Evidence for the umbrella relationship

Byte comparison found **14 identical backend files** and **21 identical frontend files** between umbrella and split archives. Backend shared files include the first four Prisma migrations; the split backend adds four later migrations for ownership, OAuth, reset and beta/admin access. It also adds controllers and route groups absent from the umbrella. There are 15 changed shared backend files and 26 changed shared frontend files. Umbrella-only backend files are `GeminiAI.ts`, `Generator.ts` and `gemini.routes.ts`; these include streaming/chat wrappers absent from active split routes and are retained as reference. Umbrella-only frontend files are `.env` and the Vite SVG. Shared filenames alone were not treated as proof; hashes, schema progression, route implementation and dependencies support the relationship. ZIP timestamps are not trusted release dates.

### Compatibility boundaries

The active editor and admin use `/api/v1` and the same password/JWT refresh-cookie model as the split backend. Browser origins are frontend `http://localhost:5174`, admin `http://localhost:8080`, and backend `http://localhost:5000`. The website uses port 5173 and has independent email collection; submitting its form does not grant beta access. Use one hostname consistently for same-site cookies.

The original Google Docs/Drive APIs (`/docs`, Google access tokens and session users) are incompatible with the newer PostgreSQL `/documents` records and integer user IDs. No conversion of users, documents, tokens or existing databases is implied. Keeping the original implementation under `legacy/` prevents silent loss of its unique integration. The umbrella streaming wrappers are not mounted into the active API because they lack the active authorization/credit contract. Recover complete earlier variants from the untouched archives; the source manifest makes their provenance explicit.

## Architecture decisions and integration plan

1. Use a four-application monorepo with **independent npm lockfiles**. React 18/19 and Tailwind 3/4 differ; a shared dependency graph would force an unnecessary framework migration. Root scripts dispatch into applications. No empty `packages/` or artificial shared abstraction.
2. Adopt the split backend/editor as the active pair because they contain later schema/features and matching routes. Keep unique legacy functionality as source with explicit non-production status.
3. Preserve Prisma migration order as the database authority. The delivered `migrations/001_create_users_table.sql` uses a different users schema and is retained solely for historical reference, never part of setup. Only run Prisma migrations on a new disposable database until a separate data migration is reviewed.
4. Add a decimal credit migration: the delivered `Int` column cannot represent the existing 0.1 autocomplete charge. Retain credit units; reserve balances with conditional database updates and add a nonnegative constraint. Existing negative balances must be investigated before migration.
5. Centralize browser API origins and server CORS through environment settings. Remove Docker build credentials, default third-party collection destinations, signing-secret fallbacks and credential logging. Providers are optional for local startup; AI operations require explicit provider/model configuration.
6. Repair ownership and administrator authorization before enabling active routes. Check current account approval on protected requests and refresh. Use verified Google emails and reject implicit linking to existing password accounts. Do not put JWTs in redirect URLs.
7. Retain assets locally pending approval. Do not infer commissioned-code ownership or font/image/animation redistribution rights from their inclusion in an archive. No new root LICENSE is granted.
8. Validate installs with hooks disabled, compile, lint, run isolated HTTP regression tests, review dependencies and prepare CI. Database/provider/browser integration requires separate evidence; builds alone do not establish runtime correctness.

## Environment and service inventory

Backend: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `SESSION_SECRET`, `JWT_EXPIRES_IN` (15m), `JWT_REFRESH_EXPIRES_IN` (7d), `NODE_ENV`, `HOST`, `PORT`, `CORS_ORIGINS`, `CLIENT_URL`, `SERVER_URL`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`, `REPHRASY_API_KEY`. Removed optional `ADMIN_SECRET_KEY` network bootstrap in favor of existing-admin authorization and deliberate local database bootstrap.

Frontend/admin: `VITE_BACKEND_URL` (origin without `/api/v1`). Website: `VITE_WAITLIST_ENDPOINT`, `VITE_GA_MEASUREMENT_ID`. All `VITE_` values are public browser configuration. Existing legacy variables differ and are not used by the active applications. Examples contain no usable secrets.

Database models: users with identity, password/reset, approval/admin and credits; documents with optional owner relation and string-array chat history; beta_access_list with approved emails and adding administrator. Deleting a user cascades to owned documents. Null-owner legacy documents are intentionally inaccessible to ordinary accounts; reassignment needs an explicit data migration.

## Functionality and unresolved limits

- Core source implements document CRUD, rich-text editing, password authentication, beta administration and AI integrations. Provider calls, migration execution, persistence and browser behavior need live validation.
- Google OAuth and password accounts are not automatically linked. No safe account-linking UI was delivered.
- SMTP reset flows exist; the rebuild adds account-wide token revocation on reset/logout and hashed, atomically consumed reset tokens. A second additive migration stores token versions. Live reset delivery and database behavior remain unverified. Production session storage is still Express MemoryStore; deploy only after replacing it and reviewing proxy/cookie configuration.
- Analytics active-session count is a hardcoded zero, and admin trend/chart series are mock data; these are not real usage measurements. Billing/payment processing is absent. Credits require administrator allocation.
- Some ribbon menu actions only log; comments/context and alternative editor components are retained, not certified as complete. Faculty/campus/student interfaces are unrelated template residue.
- AI SDK/model availability must be verified with operator credentials. This rebuild makes the model configurable and does not claim an old hardcoded model still exists.
- Formspree collection and backend beta approval remain separate workflows. No credentials, external accounts, data migrations or provider access were invented.

See `security-audit.md`, `licensing-review.md` and `validation-report.md` before any launch. Publishing, history rewrites, licensing, production deployment and merging remain owner decisions.
