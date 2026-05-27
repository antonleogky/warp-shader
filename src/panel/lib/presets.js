/** @typedef {Record<string, unknown> & { beamColors?: string[] }} PresetPayload */

/** @type {Record<string, PresetPayload>} */
export const DESIGN_PRESETS = {
  reference: {
    speed: 0.35,
    repeatPeriod: 0.28,
    streakLength: 0.09,
    streakCount: 72,
    thickness: 0.022,
    cornerRadius: 0.55,
    centerVoidRadius: 0.08,
    jitter: 0.35,
    jitterSpin: 0.22,
    jitterSpinMix: 0.5,
    beamColorCount: 4,
    brightness: 1.15,
    coreWhite: 0.72,
    backgroundColor: "#010206",
    backgroundAlpha: 1,
    backgroundUseImage: false,
    backgroundImageDataUrl: "",
    bloomStrength: 0.55,
    exposure: 1.05,
    vignette: 0.15,
    seed: 1,
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
  },
  light: {
    speed: 0.32,
    repeatPeriod: 0.26,
    streakLength: 0.085,
    streakCount: 64,
    thickness: 0.02,
    cornerRadius: 0.6,
    centerVoidRadius: 0.1,
    jitter: 0.28,
    jitterSpin: 0.15,
    jitterSpinMix: 0.4,
    beamColorCount: 4,
    brightness: 1.35,
    coreWhite: 0.65,
    backgroundColor: "#f8f9fc",
    backgroundAlpha: 1,
    backgroundUseImage: false,
    backgroundImageDataUrl: "",
    bloomStrength: 0.45,
    exposure: 1.1,
    vignette: 0.08,
    seed: 2,
    beamColors: [
      "#0066ff",
      "#7c3aed",
      "#0ea5e9",
      "#6366f1",
      "#00e8c6",
      "#ff6eb4",
      "#ffd166",
      "#a8b4ff",
    ],
  },
  bold: {
    speed: 0.42,
    repeatPeriod: 0.24,
    streakLength: 0.1,
    streakCount: 96,
    thickness: 0.028,
    cornerRadius: 0.5,
    centerVoidRadius: 0.06,
    jitter: 0.42,
    jitterSpin: 0.35,
    jitterSpinMix: 0.55,
    beamColorCount: 5,
    brightness: 1.45,
    coreWhite: 0.78,
    backgroundColor: "#000000",
    backgroundAlpha: 1,
    backgroundUseImage: false,
    backgroundImageDataUrl: "",
    bloomStrength: 0.75,
    exposure: 1.15,
    vignette: 0.22,
    seed: 7,
    beamColors: [
      "#5ce1ff",
      "#4d8dff",
      "#c56bff",
      "#ffffff",
      "#ff3366",
      "#00e8c6",
      "#ffd166",
      "#a8b4ff",
    ],
  },
  calm: {
    speed: 0.22,
    repeatPeriod: 0.32,
    streakLength: 0.075,
    streakCount: 48,
    thickness: 0.018,
    cornerRadius: 0.65,
    centerVoidRadius: 0.12,
    jitter: 0.18,
    jitterSpin: 0.08,
    jitterSpinMix: 0.25,
    beamColorCount: 3,
    brightness: 0.95,
    coreWhite: 0.6,
    backgroundColor: "#0a0c14",
    backgroundAlpha: 1,
    backgroundUseImage: false,
    backgroundImageDataUrl: "",
    bloomStrength: 0.35,
    exposure: 0.95,
    vignette: 0.12,
    seed: 12,
    beamColors: [
      "#6b8cff",
      "#9b7bff",
      "#b8d4ff",
      "#ffffff",
      "#00e8c6",
      "#ff6eb4",
      "#ffd166",
      "#a8b4ff",
    ],
  },
};

export const PRESET_OPTIONS = [
  { id: "reference", label: "Reference" },
  { id: "light", label: "Light" },
  { id: "bold", label: "Bold" },
  { id: "calm", label: "Calm" },
];

/** @type {Record<string, Partial<PresetPayload>>} */
export const SECTION_RESET = {
  background: {
    backgroundColor: "#010206",
    backgroundAlpha: 1,
    backgroundUseImage: false,
    backgroundImageDataUrl: "",
  },
  color: {
    beamColorCount: 4,
    brightness: 1.15,
    coreWhite: 0.72,
    bloomStrength: 0.55,
    exposure: 1.05,
    vignette: 0.15,
    beamColors: [...DESIGN_PRESETS.reference.beamColors],
  },
  motion: {
    speed: 0.35,
    repeatPeriod: 0.28,
    streakLength: 0.09,
    jitterSpin: 0.22,
    jitterSpinMix: 0.5,
  },
  shape: {
    streakCount: 72,
    thickness: 0.022,
    cornerRadius: 0.55,
    centerVoidRadius: 0.08,
    jitter: 0.35,
    seed: 1,
  },
};

export const SECTION_META = {
  background: {
    title: "Background",
    description: "Export plate — pick color, transparency, or a photo underneath.",
  },
  color: {
    title: "Color",
    description: "Beam palette, brightness, bloom, and vignette.",
  },
  motion: {
    title: "Motion",
    description: "Loop timing, streak travel, and spin over time.",
  },
  shape: {
    title: "Shape",
    description: "Beam count, thickness, and static layout in frame.",
  },
};

const LOOK_MATCH_KEYS = [
  "speed",
  "streakCount",
  "brightness",
  "backgroundColor",
  "backgroundAlpha",
];

/** Pick the Looks preset that best matches current params (for segment UI). */
export function detectLookPreset(params) {
  for (const { id } of PRESET_OPTIONS) {
    const preset = DESIGN_PRESETS[id];
    const matches = LOOK_MATCH_KEYS.every((key) => {
      const a = params[key];
      const b = preset[key];
      if (key === "backgroundColor") {
        return String(a ?? "").toLowerCase() === String(b ?? "").toLowerCase();
      }
      return a === b;
    });
    if (matches) return id;
  }
  return "reference";
}

export function applyPresetToParams(params, presetId) {
  const preset = DESIGN_PRESETS[presetId];
  if (!preset) return false;
  const { beamColors, ...rest } = preset;
  Object.assign(params, rest);
  if (beamColors) params.beamColors = [...beamColors];
  return true;
}

export function resetSectionParams(params, sectionId) {
  const patch = SECTION_RESET[sectionId];
  if (!patch) return false;
  const { beamColors, ...rest } = patch;
  Object.assign(params, rest);
  if (beamColors) params.beamColors = [...beamColors];
  return true;
}

export function getLoopDurationSec(params) {
  const speed = Number(params.speed) || 0.35;
  return 1 / Math.max(speed, 0.05);
}
