# October 20 cleanup archive

Nothing here is loaded by active routes or included in the preview package.

- `manifest.json`: eight retired runtime files, original paths and byte sizes. Restore a file to its original path if revisiting that design. Their original relative links assume those paths; this archive is source preservation, not a standalone runnable website.
- `before/`: snapshots of the active scripts and packaging helper before optimization, for comparison.
- `about-hero-template.html`: dormant About hero formerly embedded in the live document.
- `_figma-export/`: old Figma capture fixtures, preserved intact.
- `_exports/`: standalone FC screenshot export, preserved intact.
- `README-history.md`: full previous README and design-review history.

Only two marked generated builds were deleted: `dist/` and `tmp/hosted-build/`. A fresh `dist/` was generated and verified. The nested Git checkout `tmp/hosted-preview/`, image research, supplied images, font sources and older archives were not deleted.
