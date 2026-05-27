# Warp Shader

A small browser toy for a hyperspace-style effect. You get glowing streaks on a black background, moving out from the center. Tweak sliders, pick colors, see what happens.

**Try it here:** [antonleogky.github.io/warp-shader](https://antonleogky.github.io/warp-shader/)

## What's the point?

Honestly, it's mostly for playing around. The whole thing runs in your browser with a WebGL shader. No video files, no assets to download. You move a few controls and the look changes right away.

If you like what you see, you're free to use it. Record a clip, drop it into an edit, whatever works for you. Black background helps if you blend it in Screen or Add mode in Premiere, DaVinci, After Effects, that kind of thing.

That's really it. Not a big framework, not a product. Just a shader prototype with a panel on the side.

## What you can do

- Move beams outward from the center (warp / hyperspace vibe)
- Change speed, how many streaks, thickness, colors
- Pick up to 8 beam colors (only the ones you turn on show in the panel)
- Add a bit of spin on some beams if you want
- Hit **Reference preset** when you want a sane starting point again
- Press **R** to grab an 8 second WebM loop
- Press **S** (or Save settings) to download your values as JSON

Output is square, 1080×1080, black behind everything.

## Run it locally

You need Node 18+.

```bash
git clone https://github.com/antonleogky/warp-shader.git
cd warp-shader
npm install
npm run dev
```

Then open **http://localhost:5190** in your browser.

Build for production:

```bash
npm run build
```

To check how it looks on GitHub Pages paths:

```bash
npm run preview:pages
```

## Controls (quick)

| Key / button | What it does |
|--------------|--------------|
| Panel on the right | All the knobs |
| **Reference preset** | Reset to default-ish look |
| **Save settings** | JSON file with your values |
| **R** | Record 8s WebM |
| **S** | Same as save |

Main groups: **Motion**, **Density & shape**, **Color**.

## Parameters (if you care)

**Motion** - loop speed, repeat period, streak length. Faster loop speed = shorter loop time (roughly 1 divided by speed, in seconds).

**Density & shape** - how many streaks, how thick, rounded corners, dark hole in the middle, jitter, spin speed, how many beams actually spin.

**Color** - how many colors are active, the swatches, brightness, white core, background tint, bloom, exposure, vignette, seed.

There's no import button for JSON yet. You can still save and copy values by hand if you need to.

## Using the clip in an edit

1. Tune it in the browser.
2. Record with **R** or screen capture.
3. Put the clip on top of your footage.
4. Blend: **Screen** or **Add**.
5. Trim or loop so it fits.

If you want the loop to feel seamless, mess with **loop speed** until it lines up with your clip length.

## Put it online

This repo already has a GitHub Actions workflow. Push to `main`, enable **Pages → GitHub Actions** in repo settings, and you get a site at:

`https://YOUR_USERNAME.github.io/warp-shader/`

Vercel works too if you prefer. Build command `npm run build`, output folder `dist`. There's a `vercel.json` in the repo.

## What's inside

- `src/shaders/warp.frag` - the effect
- `src/main.js` - WebGL + loop
- `src/panel/` - React + shadcn Design sidebar (Geist, white theme)
- `src/app.css` - canvas viewport layout
- Vite for dev and build

## License

No license file yet. If you want to use this commercially or ship it somewhere serious, add a license first or ask the repo owner.
