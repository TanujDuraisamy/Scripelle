# Security

This pre-release rebuild is not approved for production use. Review docs/security-audit.md before running it outside a disposable local environment.

Use GitHub's private vulnerability reporting option in the repository Security tab if the maintainer has enabled it. If it is unavailable, ask the maintainer for a private reporting channel without posting exploit details or secrets in an issue. No private personal contact address is published here. Maintainers should enable a private channel before public launch.

Include affected versions/paths, impact, sanitized reproduction steps and a suggested fix. Use synthetic accounts and data. Do not test against production or third-party services without authorization. Never include secret values in reports.

For an exposed credential, revoke or rotate it with its provider and inspect access logs. Removing it from the latest tree does not remove history, archives, images, forks or existing logs. Agree on a history-remediation plan before rewriting any Git refs; this rebuild has not rewritten history.

Only active `apps/` code is a candidate for support. Legacy code and the `old-version` snapshot are retained for recovery and comparison and carry known security weaknesses. There is no support SLA or security certification.
