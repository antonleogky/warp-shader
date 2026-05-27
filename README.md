# Warp Shader

A browser-based WebGL toy that renders a hyperspace warp effect — glowing streaks radiating outward from center on a black background, fully tunable in real time.

**[Live demo →](https://antonleogky.github.io/warp-shader/)**

---

## Features

- Real-time parameter panel — no page reloads needed
- Up to 8 customizable beam colors with per-color brightness and bloom
- Motion controls: speed, streak length, repeat period, spin
- Shape controls: streak count, thickness, corner rounding, jitter, vignette
- **R** — record an 8-second WebM loop at 1080×1080
- **S** — export current settings as JSON

## Stack

| Layer | Tool |
|---|---|
| Rendering | WebGL2 + GLSL ES 3.0 |
| UI | React 19 + shadcn/ui |
| Build | Vite |

## Local development

Requires Node 18+.

```bash
git clone https://github.com/antonleogky/warp-shader.git
cd warp-shader
npm install
npm run dev   # http://localhost:5190
```

```bash
npm run build        # production build → dist/
npm run preview:pages  # test GitHub Pages paths locally
```

## Using the clip in an edit

1. Tune it in the browser, hit **R** to record an 8-second WebM.
2. Drop the clip on top of your footage.
3. Set blend mode to **Screen** or **Add**.
4. Trim or loop to fit.

## Deployment

GitHub Actions automatically deploys to GitHub Pages on push to `main`.
Enable **Settings → Pages → GitHub Actions** in your repo, and the site
goes live at `https://YOUR_USERNAME.github.io/warp-shader/`.

A `vercel.json` is also included if you prefer Vercel (build command:
`npm run build`, output dir: `dist`).

## For AI agents

See [CLAUDE.md](./CLAUDE.md) for a full architecture map, file descriptions,
and step-by-step guides for common edits (adding params, presets, sections).
