// ── PARAMS ────────────────────────────────────────────────────────────────────
// Single source of truth for all shader/effect runtime parameters.
//
// AI AGENT GUIDE — to add a new parameter end-to-end:
//   1. Add it to DEFAULT_PARAMS below with a sensible default.
//   2. Declare the matching uniform in src/shaders/warp.frag.
//   3. Add upload logic in src/gl/uniforms.js → uploadUniforms().
//      (Also add its name to UNIFORM_NAMES in that file.)
//   4. Add a UI control in the relevant section:
//        src/panel/components/sections/MotionSection.jsx   — timing / spin
//        src/panel/components/sections/ShapeSection.jsx    — count / thickness / layout
//        src/panel/components/sections/ColorSection.jsx    — palette / grade
//        src/panel/components/sections/BackgroundSection.jsx — plate
//   5. Add a tooltip string in src/panel/lib/settingHints.js.
//   6. Add the param to the relevant SECTION_RESET entry in src/panel/lib/presets.js
//      so the "Reset section" button restores a sensible default.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} WarpParams
 *
 * Motion
 * @property {number} speed           - Loop speed (loops/sec). Range: 0.05–2.
 * @property {number} repeatPeriod    - Radial gap between streak repeats. Range: 0.1–0.6.
 * @property {number} streakLength    - Streak length as fraction of repeatPeriod. Range: 0.03–0.25.
 *
 * Spin
 * @property {number} jitterSpin      - Clockwise spin speed for spinning beams (rad/s). Range: 0–2.
 * @property {number} jitterSpinMix   - Fraction of beams that spin. Range: 0–1.
 *
 * Shape
 * @property {number} streakCount     - Beams drawn per frame. Range: 16–128.
 * @property {number} thickness       - Angular width of each beam. Range: 0.004–0.06.
 * @property {number} centerVoidRadius - Empty radius at center. Range: 0–0.25.
 * @property {number} jitter          - Static random angle offset per beam. Range: 0–1.
 * @property {number} cornerRadius    - Cap roundness (0=flat, 1=fully rounded). Range: 0–1.
 * @property {number} seed            - Random seed for beam layout. Range: 0–100.
 *
 * Color / Grade
 * @property {number}   beamColorCount        - Active palette slots. Range: 1–8.
 * @property {string[]} beamColors            - Hex palette, always 8 entries (extras ignored).
 * @property {number}   brightness            - Color intensity multiplier. Range: 0.2–2.5.
 * @property {number}   coreWhite             - Core vs. colored mix. Range: 0–1.
 * @property {number}   bloomStrength         - Glow spread from overlapping streaks. Range: 0–2.
 * @property {number}   exposure              - Final brightness multiplier. Range: 0.3–2.5.
 * @property {number}   vignette              - Edge darkening. Range: 0–1.
 *
 * Background plate
 * @property {string}  backgroundColor        - Hex color for the plate.
 * @property {number}  backgroundAlpha        - Plate opacity. Range: 0–1.
 * @property {boolean} backgroundUseImage     - Whether to render the uploaded image.
 * @property {string}  backgroundImageDataUrl - Base64 data URL for the image (may be "").
 */

/** @type {WarpParams} */
export const DEFAULT_PARAMS = {
  // Motion
  speed: 0.35,
  repeatPeriod: 0.28,
  streakLength: 0.09,

  // Spin
  jitterSpin: 0.0,
  jitterSpinMix: 0.45,

  // Shape
  streakCount: 72,
  thickness: 0.022,
  centerVoidRadius: 0.08,
  jitter: 0.35,
  cornerRadius: 0.55,
  seed: 1.0,

  // Color / Grade
  beamColorCount: 4,
  beamColors: [
    "#5ce1ff",
    "#4d8dff",
    "#c56bff",
    "#ffffff",
    "#00e8c6",
    "#ff6eb4",
    "#ffd166",
    "#a8b4ff",
  ],
  brightness: 1.15,
  coreWhite: 0.72,
  bloomStrength: 0.55,
  exposure: 1.05,
  vignette: 0.15,

  // Background plate
  backgroundColor: "#010206",
  backgroundAlpha: 1,
  backgroundUseImage: false,
  backgroundImageDataUrl: "",
};

/**
 * One-time migration for params loaded from old JSON saves.
 * backgroundColor used to be stored as { r, g, b } floats — convert to hex.
 * @param {WarpParams} params
 */
export function migrateLegacyParams(params) {
  const bg = params.backgroundColor;
  if (bg && typeof bg === "object" && "r" in bg) {
    const toHex = (v) =>
      Math.round(Math.min(1, Math.max(0, v)) * 255)
        .toString(16)
        .padStart(2, "0");
    params.backgroundColor = `#${toHex(bg.r)}${toHex(bg.g)}${toHex(bg.b)}`;
  }
}
