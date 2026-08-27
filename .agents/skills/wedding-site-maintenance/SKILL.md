---
name: wedding-site-maintenance
description: Maintain the Jervis and Hazel static wedding website. Use for root page or wedding gallery edits, photo gallery updates, local preview/debugging, cache-busting, GitHub Pages deployment checks, visual QA, image optimization planning, or fixing stale/broken assets. Do not use for unrelated backend, framework, database, or non-website tasks.
---

# Wedding Site Maintenance

Use this skill to make production-safe changes to the static wedding website. Read the repo-root `AGENTS.md` first and follow it as the source of truth for project rules.

## Quick Rules

- Keep the site static and GitHub Pages-compatible.
- Do not add a framework, backend, bundler, database, or dependency unless the user explicitly asks.
- Preserve `CNAME`.
- Preserve native browser scrolling; do not add wheel-event scroll hijacking.
- Treat wedding photos as personal content. Do not upload or transmit them externally unless the user explicitly asks.
- Keep UI copy guest-facing and polished.

## Core Workflow

1. Inspect the relevant files before editing.
   - Root site: `index.html`, `style.css`, `script.js`.
   - Wedding gallery: `wedding/index.html`, `wedding/assets/css/wedding.css`, `wedding/assets/js/wedding.js`.
2. Make narrow static-file edits.
3. Bump cache-busting versions when changing production CSS, JS, or image references.
4. Run or use the local server for verification when possible.
5. Check the browser for obvious layout issues and JavaScript errors.
6. Summarize changed files, verification performed, and any remaining risk.

## Gallery Updates

- Edit gallery data in `galleryPhotos` inside `wedding/assets/js/wedding.js`.
- Prefer replacing only `thumb`, `full`, `alt`, `caption`, `category`, and optional `size`.
- Keep category values aligned with the existing filters unless the user asks for new categories:
  - `Ceremony`
  - `Portraits`
  - `Family`
  - `Reception`
  - `Details`
- Future real photo paths should follow:
  - `wedding/photos/thumbs/photo-001.webp`
  - `wedding/photos/full/photo-001.webp`
- Keep image fallback, lightbox captions, counters, keyboard navigation, and mobile swipe behavior working.

## Cache-Busting

When CSS, JS, or production image references change, update every relevant version in the same edit:

- `style.css?v=...` and `script.js?v=...` in `index.html`.
- `wedding.css?v=...` and `wedding.js?v=...` in `wedding/index.html`.
- `galleryAssetVersion` in `wedding/assets/js/wedding.js`.

Use `YYYYMMDD-1`, then increment for later same-day changes.

## Local Verification

Use one of these:

- `start_localhost.bat`
- `cmd /c npm run serve`
- `node local-server.js`

Then check:

- `http://127.0.0.1:5173/`
- `http://127.0.0.1:5173/wedding/`

For gallery work, verify filters, cards, lightbox open/close, next/previous navigation, captions, counters, and image fallback.

## Useful Built-In Capabilities

- Use the Browser skill/plugin for local visual QA after frontend changes.
- Use image generation only for requested placeholder art, mockups, or visual assets; do not replace real wedding photos with generated images.
- Use GitHub capabilities only when the user asks for GitHub/PR/issue/sync work.
- Use OpenAI docs only for OpenAI/Codex/API questions, not for ordinary website edits.
