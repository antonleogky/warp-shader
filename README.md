# Warp Shader

Procedural hyperspace / warp-speed streaks moving outward from center (toward the viewer). Black background, square **1080×1080** render target.

## Run

```bash
npm install
npm run dev
```

Open **http://localhost:5190** (this project uses a fixed port so it does not clash with other Vite apps on 5173).

## Deploy to GitHub Pages

Live URL (after deploy): **https://antonleogky.github.io/warp-shader/**

1. Create an empty repo on GitHub: `warp-shader` (under account **antonleogky**).
2. Push this project:

```bash
cd ~/Projects/warp-shader
git add .
git commit -m "Warp shader prototype"
git branch -M main
git remote add origin https://github.com/antonleogky/warp-shader.git
git push -u origin main
```

3. On GitHub: repo **Settings → Pages → Build and deployment → Source**: **GitHub Actions**.
4. The workflow `.github/workflows/deploy-pages.yml` runs on push and publishes `dist/`.

Preview the Pages build locally:

```bash
npm run preview:pages
```

## Deploy to Vercel (public link)

This is a static Vite app — Vercel serves the `dist` folder after `npm run build`.

### Option A — GitHub + Vercel (recommended)

1. Create a repo on GitHub and push this project:

```bash
cd ~/Projects/warp-shader
git add .
git commit -m "Initial warp shader prototype"
git remote add origin https://github.com/YOUR_USER/warp-shader.git
git push -u origin main
```

2. Go to [vercel.com/new](https://vercel.com/new), sign in, **Import** your `warp-shader` repo.
3. Leave defaults (Vercel detects **Vite**): Build `npm run build`, Output `dist`.
4. Click **Deploy**. You get a URL like `https://warp-shader.vercel.app`.

Every `git push` to `main` can auto-redeploy if you leave that enabled.

### Option B — Vercel CLI (no GitHub)

```bash
cd ~/Projects/warp-shader
npx vercel login
npx vercel          # first deploy (preview URL)
npx vercel --prod   # production URL
```

`vercel.json` in this repo already sets the Vite build settings.

## Controls

- **GUI** — all motion, density, and color uniforms
- **R** — record an 8-second **WebM** loop from the canvas (for video compositing)
- **S** — export current settings as JSON

## Video compositing

1. Record with **R** or screen-capture the canvas.
2. Place the clip above your footage in Premiere, DaVinci, After Effects, etc.
3. Blend mode: **Screen** or **Add** (black stays transparent-ish on Screen).
4. Match project frame rate to your timeline; trim to a seamless loop if needed.

## Parameters

| Group | Keys |
|-------|------|
| Motion | `speed` (loop cycles/s), `repeatPeriod`, `streakLength` — fixed size, center → outward only |
| Density | `streakCount`, `thickness`, `centerVoidRadius`, `jitter`, `jitterSpin`, `jitterSpinMix` |
| Color | `beamColorCount` + 8 beam color pickers, `cornerRadius`, `brightness`, `coreWhite`, `backgroundColor`, `bloomStrength`, `exposure`, `vignette`, `seed` |

Use **Reference preset** in the GUI to reset values close to the reference look.
