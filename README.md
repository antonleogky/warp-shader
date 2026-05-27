# Warp Shader

A browser-based **hyperspace / warp-speed** effect built with WebGL2. Glowing streaks move outward from the center on a black background—useful for motion graphics, sci-fi UI, and video overlays.

**[Live demo →](https://antonleogky.github.io/warp-shader/)**

## What this project does

Warp Shader renders a procedural “flying through space” look: colored light beams spawn near the center and travel toward the viewer, with a dark void in the middle and a soft glow at the edges. Everything runs in real time in the browser.

You can tune the look with a built-in control panel (no code required), export settings as JSON, record a short loop for editing, or deploy the app as a static site.

**Typical uses**

- Overlay in Premiere, DaVinci Resolve, After Effects (**Screen** / **Add** blend on black)
- Reference for custom GLSL / game VFX
- Quick prototype for titles, transitions, or ambient backgrounds

## Features

- **Real-time WebGL2** fragment shader (no video assets)
- **Outward-only motion** — seamless looping field, fixed beam size
- **Rounded beam caps** and adjustable thickness, density, and center void
- **Multi-color palette** — choose how many beam colors are active (up to 8)
- **Animated jitter** — optional clockwise spin on a subset of beams
- **Control panel** — motion, shape, and color parameters with a reference preset
- **Export** — settings JSON (**S**) and 8s WebM recording (**R**)
- **Square 1080×1080** output, black background for compositing

## Quick start

**Requirements:** [Node.js](https://nodejs.org/) 18+ and a browser with WebGL2.

```bash
git clone https://github.com/antonleogky/warp-shader.git
cd warp-shader
npm install
npm run dev
```

Open **http://localhost:5190** (fixed port to avoid clashing with other Vite apps on 5173).

### Production build

```bash
npm run build
npm run preview
```

Preview the GitHub Pages build locally (correct asset paths):

```bash
npm run preview:pages
```

## Using the app

| Action | Description |
|--------|-------------|
| **Control panel** (right) | Adjust motion, density, colors, bloom, etc. |
| **Reference preset** | Reset parameters to a balanced default look |
| **Save settings** | Download current values as JSON |
| **R** | Record an 8-second WebM loop from the canvas |
| **S** | Save settings JSON (same as the Save button) |

Sections in the panel: **Motion**, **Density & shape**, **Color**.

## Parameters

| Group | Controls | Notes |
|-------|----------|--------|
| **Motion** | Loop speed, repeat period, streak length | Loop period ≈ `1 ÷ loop speed` seconds |
| **Density & shape** | Streak count, thickness, corner radius, center void, jitter, spin speed, spin beams | Spin: fraction of beams that rotate clockwise |
| **Color** | Active colors, beam swatches, brightness, core white, background, bloom, exposure, vignette, seed | Only **N** color pickers shown when “Active colors” = N |

Settings files from **S** can be restored by editing `params` in code or re-entering values manually (import UI not included yet).

## Video compositing

1. Tune the look in the app, then press **R** (or screen-record the canvas).
2. Import the clip into your editor on a track above your footage.
3. Set blend mode to **Screen** or **Add** (black stays dark; bright streaks add on top).
4. Match frame rate to your timeline; trim or loop to fit your edit.

For a seamless loop, align **loop speed** with your clip length (e.g. `loop speed = 1 / duration in seconds`).

## Deployment

### GitHub Pages (configured in this repo)

Pushes to `main` run [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) and publish to GitHub Pages.

1. Fork or clone this repository.
2. Enable **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push to `main`.

Site URL: `https://<your-username>.github.io/warp-shader/`

### Vercel (optional)

Import the repo at [vercel.com/new](https://vercel.com/new). Vite is auto-detected: build `npm run build`, output `dist`. See [`vercel.json`](vercel.json).

## Tech stack

- [Vite](https://vitejs.dev/) — dev server and static build
- WebGL2 — fullscreen quad + custom fragment shader ([`src/shaders/warp.frag`](src/shaders/warp.frag))
- Vanilla JS — UI and uniforms ([`src/panel.js`](src/panel.js))
- [Geist](https://vercel.com/font) — UI typography

## Project structure

```
warp-shader/
├── src/
│   ├── shaders/warp.frag   # Beam motion, color, glow
│   ├── main.js             # WebGL setup, render loop
│   ├── panel.js            # Control panel
│   └── panel.css
├── .github/workflows/      # GitHub Pages deploy
└── vite.config.js
```

## License

No license file is included yet. Add one before redistributing or using in commercial projects.
