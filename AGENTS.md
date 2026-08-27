# AGENTS.md

Instructions for AI coding agents working in this repository. Treat this file as the project-specific operating manual.

## Project Overview

- This is a static wedding website for Jervis and Hazel.
- Production is GitHub Pages with custom domain `jervisandhazel.com` from `CNAME`.
- Keep the site deployable as static files only: HTML, CSS, JavaScript, and image assets.
- Do not introduce a framework, bundler, backend, database, API service, or new dependency unless the user explicitly asks.

## Important Files

- Root site: `index.html`, `style.css`, `script.js`.
- Wedding gallery: `wedding/index.html`, `wedding/assets/css/wedding.css`, `wedding/assets/js/wedding.js`.
- Local server: `local-server.js`.
- Local startup shortcut: `start_localhost.bat`.
- GitHub sync helper: `sync_git.bat`.
- Existing shared photos: `photos/`.

Future real wedding gallery photos should use this convention:

```text
wedding/photos/thumbs/photo-001.webp
wedding/photos/full/photo-001.webp
```

## Local Development

- Preferred local URL: `http://127.0.0.1:5173/`.
- Wedding gallery URL: `http://127.0.0.1:5173/wedding/`.
- Start the local site with one of:
  - `start_localhost.bat`
  - `cmd /c npm run serve`
  - `node local-server.js`
- On Windows, PowerShell may block `npm.ps1`; use `npm.cmd` or `cmd /c npm ...`.
- The local server sends `Cache-Control: no-store` to make local testing reflect file changes immediately.

## Engineering Rules

- Keep changes small, direct, and static-site friendly.
- Preserve mobile usability first; most guests will open the site on phones.
- Keep UI text guest-facing and polished. Do not expose implementation language in the page.
- Do not add custom wheel-scroll hijacking. Native browser scrolling must stay responsive. Smooth anchor scrolling is acceptable.
- Do not remove `CNAME`.
- Do not force-push, rewrite Git history, or run `sync_git.bat` unless the user explicitly asks to sync/push.
- Avoid changing unrelated files. If the worktree is dirty, preserve user changes.

## Agent Skills

- Repo-scoped skill: `.agents/skills/wedding-site-maintenance/SKILL.md`.
- Use that skill for root page edits, wedding gallery edits, photo import/update work, cache-busting, GitHub Pages deployment checks, local preview debugging, and visual QA.
- Do not create additional repo skills unless a workflow becomes clearly repeatable and worth maintaining.
- Useful available capabilities for this repo:
  - Browser/in-app browser for local visual QA.
  - Image generation only for requested mockups/placeholders, never to replace real wedding photos without permission.
  - GitHub only for requested GitHub sync, PR, issue, or CI work.
  - OpenAI docs only for OpenAI/Codex/API questions.

## Cache-Busting Rules

GitHub Pages and browsers may serve stale static assets. When changing CSS, JS, or image assets that affect production, bump every relevant version string in the same change:

- `style.css?v=...` and `script.js?v=...` in `index.html`.
- `wedding.css?v=...` and `wedding.js?v=...` in `wedding/index.html`.
- `galleryAssetVersion` in `wedding/assets/js/wedding.js`.

Use a simple monotonic version format such as `YYYYMMDD-1`, then increment to `YYYYMMDD-2` for another change on the same day.

## Wedding Gallery Rules

- The gallery is rendered from `galleryPhotos` in `wedding/assets/js/wedding.js`.
- To replace placeholders with real photos, edit only the data fields when possible:
  - `thumb`
  - `full`
  - `alt`
  - `caption`
  - `category`
  - optional layout size such as `span-2` or `span-3`
- Keep categories to the existing filter set unless the user asks for more:
  - `All`, `Ceremony`, `Portraits`, `Family`, `Reception`, `Details`
- Use optimized thumbnail images for grid cards and larger optimized images for the lightbox.
- Keep image failure handling so guests see a clean fallback instead of broken-image icons.
- Keep lightbox keyboard support (`Escape`, `ArrowLeft`, `ArrowRight`) and mobile swipe support working.
- Treat wedding photos as personal content. Do not upload, transmit, or replace them with third-party-hosted copies unless the user explicitly requests it.

## Image Guidance

- Prefer `.webp` for production gallery images.
- Keep thumbnails visually sharp but small enough for fast mobile loading.
- Keep full-size lightbox images large enough for viewing, but not original camera-size files if they are many megabytes.
- If using `convert.js` or `sharp`, preserve originals unless the user explicitly asks to delete them.
- Do not rename many user photo files unless the user asks or the rename is part of a clearly explained import workflow.

## Verification Checklist

Before finishing meaningful website changes:

- Load `http://127.0.0.1:5173/` for root-page changes.
- Load `http://127.0.0.1:5173/wedding/` for wedding gallery changes.
- Check for JavaScript console errors when browser tools are available.
- Check that desktop and mobile layouts have no obvious overlap, clipped controls, or unreadable text.
- For gallery changes, verify:
  - filter buttons render,
  - photo cards render,
  - category filtering updates the grid,
  - lightbox opens and closes,
  - next/previous navigation works,
  - captions and counters update,
  - image fallback still works.
- Search for garbled UTF-8 output before finishing, especially around arrows, quotes, hearts, and close buttons.

## OpenAI and Codex Questions

- If the task asks about OpenAI APIs, ChatGPT Apps SDK, Codex, Agents SDK, or current OpenAI product behavior, use official OpenAI documentation first.
- Prefer the OpenAI developer docs MCP server when available. Otherwise, use official OpenAI domains only.
