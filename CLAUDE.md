# Warp Shader — Architecture Guide

This file is the entry point for AI agents editing this codebase.
It maps common tasks to the exact files you need to touch.

---

## Project overview

A browser-based WebGL hyperspace effect. A full-screen GLSL fragment shader
draws radial glowing streaks on a canvas. A React sidebar panel exposes all
shader parameters as sliders and color pickers. Everything is wired through a
single mutable `params` object.

**Tech stack:** Vite · React 19 · WebGL2 · GLSL ES 3.0 · Tailwind v4 · shadcn/ui

---

## File map

```
src/
  main.js                    Entry point — thin orchestrator, start here
  params.js                  ALL shader parameter definitions + JSDoc types
  io.js                      Recording (WebM) and settings save/load

  gl/
    program.js               compileShader / createProgram / showFatal
    uniforms.js              Uniform registry + uploadUniforms() per frame
    background.js            Background texture upload + viewport checker

  shaders/
    quad.vert                Pass-through vertex shader (full-screen quad)
    warp.frag                Fragment shader — all visual logic lives here

  panel/
    index.jsx                mountPanel() — React root, returns { syncAll, setRecording }
    App.jsx                  PanelContext.Provider wrapper
    PanelContext.jsx          usePanel() hook — params, notifyChange, actions
    components/
      DesignSidebar.jsx       Top-level sidebar layout (tabs + looks footer)
      ExportBar.jsx           Record / Save / Load / Copy JSON buttons
      SegmentedControl.jsx    Pill-style segmented control
      SlidingSegmentList.jsx  Animated sliding indicator
      sections/
        BackgroundSection.jsx  Color / Clear / Image plate picker
        ColorSection.jsx       Palette + Grade sliders
        MotionSection.jsx      Loop timing + Spin controls
        ShapeSection.jsx       Beam count, thickness, layout
      fields/
        SliderField.jsx        Labeled slider row
        ColorPopoverField.jsx  Hex color swatch + popover picker
        FieldGroup.jsx         Collapsible section group with reset button
        FieldLabel.jsx         Label + tooltip wrapper
    lib/
      presets.js              DESIGN_PRESETS, SECTION_RESET, SECTION_META
      settingHints.js         Tooltip strings for every param
      settingLayout.js        Shared Tailwind spacing constants
      color.js                hexToRgb, normalizeHex, MAX_BEAM_COLORS
      backgroundMode.js       getBackgroundMode / applyBackgroundMode
      utils.js                cn() className helper
```

---

## How to add a new shader parameter end-to-end

Follow these steps in order:

1. **`src/params.js`** — Add to `DEFAULT_PARAMS` with a sensible default.
   Add a `@property` line to the `WarpParams` typedef.

2. **`src/shaders/warp.frag`** — Declare `uniform float u_yourParam;`
   in the matching group (Motion / Shape / Color / Background).
   Use the value in the rendering logic.

3. **`src/gl/uniforms.js`** — Two changes:
   - Add `"u_yourParam"` to `UNIFORM_NAMES`.
   - Add `gl.uniform1f(uniforms.u_yourParam, params.yourParam);`
     in `uploadUniforms()`.
   - Update the Param → Uniform comment table at the top of the file.

4. **`src/panel/components/sections/<Section>.jsx`** — Add a `<SliderField>`
   (or other control) that reads `params.yourParam` and writes it back.

5. **`src/panel/lib/settingHints.js`** — Add a tooltip string.

6. **`src/panel/lib/presets.js`** — Add the param to the relevant entry
   in `SECTION_RESET` so "Reset section" restores a clean default.

---

## How the params object flows

```
params (plain object, mutated in place)
   │
   ├── React panel reads via usePanel().params (re-renders on tick bump)
   │   └── SliderField onChange → params.foo = v → notifyChange()
   │                                                    └── setTick(t+1) → re-render
   │
   └── GL render loop reads via uploadUniforms() every frame (~60fps)
```

`params` is **not** reactive state. The panel forces re-renders with an
integer `tick` counter. The GL loop always reads the latest value because
`uploadUniforms` runs on every animation frame.

---

## How to add a new preset

Edit `DESIGN_PRESETS` in `src/panel/lib/presets.js`.
Add an entry to `PRESET_OPTIONS` to make it appear in the Looks footer.

---

## How to add a new panel section (tab)

1. Create `src/panel/components/sections/YourSection.jsx`.
2. Add `{ id: "your-id", label: "Label", Panel: YourSection }` to the
   `SECTIONS` array in `src/panel/components/DesignSidebar.jsx`.
3. Add a `SECTION_RESET["your-id"]` entry in `src/panel/lib/presets.js`.
4. Add a `SECTION_META["your-id"]` entry in the same file.

---

## Build & run

```bash
npm install
npm run dev      # http://localhost:5190
npm run build    # production build → dist/
```

Keyboard shortcuts (live in `src/main.js`):
- **R** — record an 8-second WebM loop
- **S** — save current settings as JSON
