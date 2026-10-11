# Rebuild Scripelle as a documented monorepo and harden account/document access

Target: `tanuj-main`. Source: `open-source-rebuild`. **Draft only; not submitted.**

The original repository mixed an older Google Docs application with tracked dependencies, while five deliveries contained overlapping application generations. This change preserves original source under `legacy/` and integrates the later backend, editor, admin panel and marketing site under `apps/`, with independent lockfiles and documented service boundaries.

The API now enforces document ownership and administrator permissions, requires independent signing secrets, revokes account tokens on logout/reset, stores hashed single-use reset tokens, and meters predictions. Additive migrations support fractional credits, document context and token versions. Browser API configuration, editor insertion, auth response typing, optional providers, privacy defaults, container recipes and CI have been repaired. No root license is granted.

Validation: all four builds/typechecks pass; all three frontend lint commands pass with warnings; 18 isolated backend regression tests pass; all four process/HTML smoke checks pass. Live PostgreSQL, provider and browser journeys remain unverified. Backend/admin dependency audits still fail on documented chains.

Do not publish or merge until archived credentials are rotated, source/asset rights and license are approved, residual security/dependency findings are addressed, and live integration validation is complete. Exact preservation snapshot: remote `old-version` at `8e8e47dbea4e6efdc5986ae006512387c34361e6`. See docs/architecture-audit.md, docs/security-audit.md and docs/validation-report.md.
