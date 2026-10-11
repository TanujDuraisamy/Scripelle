# Contributing

The rebuild is under private review. Confirm contribution and redistribution terms with the owner before accepting external contributions; no project-wide open-source license has been granted.

Follow the README's per-app installation, environment and fresh PostgreSQL setup. Use fake local accounts and your own optional provider credentials. Keep secrets and data exports out of source control.

Create a descriptive branch, normally `codex/<change>` or your team's convention. Keep changes focused; avoid unrelated formatting and framework migrations. Preserve existing features and document any proposed removal. Use TypeScript and the existing React/component conventions in active apps. Prefer explicit types and validate data at HTTP boundaries.

Run the affected app's typecheck, build and lint commands, backend regression tests when touching API/auth/data behavior, and `npm run check:release`. Record failures as failures. A passing build does not prove live integration. Inspect install scripts before enabling hooks. Commit the matching application lockfile when dependencies change.

PRs should explain the concrete problem, resulting behavior, tests executed and outstanding limitations. Target the maintainer-designated development branch (`tanuj-main` for this rebuild). Database changes require a migration and a data-preservation plan. Never run migrations against a shared database merely to test a PR.

For ordinary bugs, provide sanitized reproduction steps, expected/actual behavior, app and runtime versions. Do not attach credentials, production records, private documents or unredacted logs. Report vulnerabilities using SECURITY.md instead of public issues.

Known lint/security debt is tracked in docs/validation-report.md and docs/security-audit.md. Do not weaken checks to make a PR appear green. Changes to `legacy/` should be minimal and preserve provenance; it is reference source, not a supported deployment target.
