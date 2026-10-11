# Licensing review — approval required

No root LICENSE has been added and no project-wide license has been granted. Commissioning code does not itself provide evidence of all redistribution rights. Confirm the relevant contracts, contributions and third-party materials before selecting a license.

| Candidate | Practical distinction | Decision |
| --- | --- | --- |
| MIT | Short permissive terms; retain copyright and permission notice. No express patent grant in the text. | Suitable for a simple permissive licensing policy if the owner approves. |
| Apache-2.0 | Permissive terms with an express contributor patent grant and patent-litigation termination; retain required notices and identify modified files. | Worth considering where explicit patent terms are desired; more notice obligations. |

Sources: [MIT text](https://opensource.org/license/mit), [Apache-2.0 text](https://www.apache.org/licenses/LICENSE-2.0). Neither choice establishes ownership of commissioned code, assets or trademarks. Selection and rights confirmation remain with the owner.

## Material requiring provenance

- Backend package manifests delivered an `ISC` field without a complete project licensing record. Imported active manifests are marked private and omit that ambiguous field; historical metadata remains in preserved source and archives. This does not cancel any valid pre-existing license.
- `apps/website/src/assets/fonts/Times_new_roman_regular.otf` and `Times_new_roman_italic.otf` have no accompanying redistribution evidence. Filenames are not proof of origin. Microsoft describes restrictions on redistributing Windows fonts and serving them as web fonts in its [font redistribution FAQ](https://learn.microsoft.com/en-us/typography/fonts/font-faq). Verify these specific files' rights or approve a replacement before public distribution.
- Marketing photographs/illustrations, frontend painting video, Lottie animations, icons and logos need an asset-by-asset ownership/license ledger. No provenance documents were supplied for those custom assets. They remain local pending review; do not publish them on assumption.
- npm dependency license metadata is recorded in `dependency-licenses.json`. Metadata is an inventory, not a legal clearance. Preserve dependency copyright/license/NOTICE files when distributing bundles or images and inspect nonstandard, missing and dual-license entries.
- Framework/template source (including shadcn UI and generated scaffold files) may have notice requirements. Confirm copied-source provenance as well as package licenses. Existing vendor licenses were not changed.

Required owner decisions: confirm rights to commissioned source, approve or replace assets with missing permissions, choose MIT or Apache-2.0 (or another license), and explicitly authorize adding it. Do not publish the branch or change repository visibility while these blockers remain.

## Dependency metadata summary

The final lockfiles include MIT, ISC, Apache-2.0, BSD-2/3-Clause, 0BSD, BlueOak-1.0.0, Python-2.0, MPL-2.0, CC-BY-4.0 and compound expressions. In particular, [MPL-2.0 has file-level source obligations](https://www.mozilla.org/en-US/MPL/2.0/FAQ/) and [CC-BY-4.0 requires attribution](https://creativecommons.org/licenses/by/4.0/); inspect the actual package license text and how each package is used/distributed. Six package instances lack license metadata in their lockfile. Repeated package instances across apps are intentional; the inventory is not a count of unique licenses. These items have not been legally cleared.
