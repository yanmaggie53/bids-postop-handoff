# bids-postop-handoff

An interactive, single-page **scrollytelling** presentation of an ongoing
quality improvement (QI) study on the OR-to-ICU postoperative handoff workflow.
Everything lives on one page; you scroll top-to-bottom to read the story,
explore the Epic handoff tool, watch the workflow timeline animate, and read the
findings as interactive bubble charts.

Built with [Vite](https://vitejs.dev/),
[Scrollama](https://github.com/russellsamora/scrollama), and
[D3](https://d3js.org/) (force + shape modules). Styled after
[The Pudding](https://pudding.cool/).

## Page flow

1. Title / hero
2. Problem & goal
3. Data collection methodology
4. Epic handoff tool (click-through interactive screenshots)
5. Educational efforts (flyers)
6. Workflow visualization (winding "snake" timeline that expands in place to
   reveal the proposed step)
7. Findings & analysis title
8. Analysis methodology
9. Bubble charts (Challenges, Usefulness, Suggestions, Elements liked,
   Elements disliked)
10. Sources cited

## Develop

```bash
npm install
npm run dev      # local dev server at http://localhost:5173/bids-postop-handoff/
```

```bash
npm run build    # production build into dist/
npm run preview  # preview the production build locally
```

## Project structure

```
index.html                 All section markup, in scroll order
src/
  main.js                  Entry; wires up the interactive modules
  style.css                Global typography, layout, and component styles
  data/placeholder.js      Placeholder content + data (replace with real data)
  sections/
    screenshots.js         Click-through Epic screenshot carousel
    flyers.js              Flyer gallery with scroll reveal
    timeline.js            Snake-path workflow timeline + proposed-step morph
    bubbles.js             D3 force bubble charts (one per feedback category)
public/assets/
  screenshots/             Epic handoff tool images (placeholders for now)
  flyers/                  Educational flyer images (placeholders for now)
```

## Replacing the placeholders

All real content is stubbed in [`src/data/placeholder.js`](src/data/placeholder.js):

- **Screenshots** — drop real images into `public/assets/screenshots/` and update
  the `screenshots` array (paths + captions).
- **Flyers** — drop real images into `public/assets/flyers/` and update the
  `flyers` array.
- **Timeline steps** — edit `timelineSteps`. Steps flagged `proposed: true` are
  the ones inserted by the proposed workflow.
- **Bubble data** — edit `bubbleCategories`; each item's `value` controls its
  bubble size.
- **Narrative copy and sources** — edit the text directly in `index.html`.

## Deploy (GitHub Pages)

A GitHub Actions workflow at
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds and
publishes the site on every push to `main`.

One-time setup: in the repo, go to **Settings → Pages → Build and deployment →
Source** and choose **GitHub Actions**. The site will then be served at
`https://<your-username>.github.io/bids-postop-handoff/`.

> If you fork or rename the repo, update `base` in
> [`vite.config.js`](vite.config.js) to match the new repo name.
