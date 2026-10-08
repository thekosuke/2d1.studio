# 2D1 collaboration handoff

## Start here

Read `AGENTS.md` completely, then `README.md`. The current-direction block at the top of AGENTS supersedes its historical design notes. The owner is iterating in Figma next; wait for their revised frames and implementation request before redesigning.

Repository: https://github.com/thekosuke/newfiction-web
Working branch: `site-redesign` (not `main`). No build step or package installation is required.

```sh
git clone --branch site-redesign https://github.com/thekosuke/newfiction-web.git
cd newfiction-web
python3 scripts/preview.py
```

Open http://localhost:4173 and http://localhost:4173/about/. In an existing clone, use a clean working tree, fetch origin, and check out `site-redesign`; do not discard local work. GitHub access must be provided through the agent environment’s repository connection or normal Git credentials, never committed tokens.

## Figma source for the next iteration

Page: https://www.figma.com/design/z1J8lyfvwOqtHpQqfNin3x/Website-2026?node-id=242-319

The original sketch is untouched. Eight editable captures are arranged with default views above expanded views:

| Page/state | Desktop 1440 | Mobile 390 |
| --- | --- | --- |
| Home default | 252:2 | 259:2 |
| Home all projects expanded | 255:2 | 261:2 |
| About folded | 258:2 | 260:2 |
| About full essay | 256:2 | 262:2 |

Frames include all project images, forms, and footers. The 3D tote is represented by a still. Text retains Rand and Rand Mono assignments; local font access may be needed in Figma. The owner will supply revised frames; these exports are the current baseline, not a new approved design. Figma access must be available to the agent separately from GitHub access. Local-only `_figma-export/` capture copies are excluded from Git.

## Constraints and verification

Preserve copy and archived iterations. Use Icon Red #FF2B00, square UI, accessible native interactions, reduced-motion support, and clean in-page navigation. Both contact and waitlist are intentionally unconnected: never report saved or sent data. No deployment or backend setup is authorized.

Preview both pages at 390×844, 768×1024, 1280×800, 1440×900, and 1920×1080 after visual changes. Check overflow, focus, reduced motion, no-JavaScript behavior, project disclosures, and the About fold. Three.js loads from jsDelivr; the tote poster is the fallback when CDN/WebGL is unavailable.

This checkpoint was explicitly authorized for commit and push. Future commits/pushes and any deployment need a new request. Do not merge to main or change Pages settings. Leave tracked .DS_Store changes out of commits.
