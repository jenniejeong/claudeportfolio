# jenniejeong.com

Static portfolio site (plain HTML, CSS, and JS). No build step.

## Structure
- `index.html` — Home
- `works/connected-fellows.html` — served at `/works/connected-fellows`
- `works/synapp.html` — served at `/works/synapp`
- `assets/css` — `site.css` (shared), `home.css`, `case.css`
- `assets/js` — `common.js` (theme, nav, cursor), `home.js` (labels, shader, avatar), `case.js` (side steps)
- `assets/vendor` — GSAP, ScrollTrigger, Matter.js
- `assets/img` — images
- `vercel.json` — clean URLs (no `.html` in links)

## Preview locally
Run `npx serve .` in this folder and open the printed URL.
(Opening `index.html` by double-clicking won't load the images, because paths start with `/`.)

## Deploy
Import this repo in Vercel with Framework Preset "Other", no build command, output directory = root.
