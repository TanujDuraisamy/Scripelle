# Preserved implementations

`original/` retains tracked source from commit `8e8e47d` before the rebuild. Exact history is preserved in the remote `old-version` branch and the local preservation bundle. Its tracked frontend `.env` has been replaced with a keys-only example; other examples contain placeholders. Installed dependencies are no longer tracked.

The original application includes Google Docs/Drive functionality not implemented by the new PostgreSQL editor. These APIs, sessions and data models are incompatible. No live data has been migrated. This source remains available for a separately reviewed migration; do not deploy it unchanged.

`umbrella-backend/` contains the three unique backend controller/route files from `Scripelle_project-master.zip`, including streaming/chat endpoints. They are intentionally not mounted in the active server. The full untouched archives are retained outside Git; hashes and file provenance appear in docs/source-manifest.json. Duplicated umbrella frontend/configuration was not imported over the later split projects.

Legacy source has known authorization, configuration, dependency and logging weaknesses. It is excluded from the active install, CI and build matrix. Retention does not grant redistribution rights or certify safety.
