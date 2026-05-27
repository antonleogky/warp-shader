import "./geist-fonts.js";
import "./app.css";
import vertSource from "./shaders/quad.vert?raw";

const DEV_PORT = 5190;
const badge = document.getElementById("app-badge");
if (import.meta.env.DEV && badge) {
  const port = window.location.port || String(DEV_PORT);
  badge.hidden = false;
  badge.textContent = `warp-shader · :${port}`;
  if (port !== String(DEV_PORT)) {
    badge.style.color = "hsl(0 70% 45%)";
    badge.title = `Expected port ${DEV_PORT}. You may be on the wrong dev server.`;
  }
}
import fragSource from "./shaders/warp.frag?raw";
import { mountPanel } from "./panel/index.jsx";
import { MAX_BEAM_COLORS, hexToRgb } from "./panel/lib/color.js";
import {
  applyPresetToParams,
  getLoopDurationSec,
  resetSectionParams,
} from "./panel/lib/presets.js";

const canvas = document.getElementById("canvas");
const viewport = document.getElementById("viewport");
const canvasMeta = document.getElementById("canvas-meta");
const recordingPill = document.getElementById("recording-pill");

const gl = canvas.getContext("webgl2", {
  alpha: true,
  antialias: false,
  preserveDrawingBuffer: true,
  premultipliedAlpha: false,
});

if (!gl) {
  throw new Error("WebGL2 is required for this prototype.");
}

const SIZE = 1080;

const params = {
  speed: 0.35,
  repeatPeriod: 0.28,
  streakLength: 0.09,

  streakCount: 72,
  thickness: 0.022,
  centerVoidRadius: 0.08,
  jitter: 0.35,
  jitterSpin: 0.0,
  jitterSpinMix: 0.45,
  cornerRadius: 0.55,

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
  backgroundColor: "#010206",
  backgroundAlpha: 1,
  backgroundUseImage: false,
  backgroundImageDataUrl: "",
  bloomStrength: 0.55,
  exposure: 1.05,
  vignette: 0.15,
  seed: 1.0,
};

function migrateLegacyParams() {
  const bg = params.backgroundColor;
  if (bg && typeof bg === "object" && "r" in bg) {
    const toHex = (v) =>
      Math.round(Math.min(1, Math.max(0, v)) * 255)
        .toString(16)
        .padStart(2, "0");
    params.backgroundColor = `#${toHex(bg.r)}${toHex(bg.g)}${toHex(bg.b)}`;
  }
}

migrateLegacyParams();

let bgTexture = null;
let bgImageReady = false;

function ensureBgTexture() {
  if (bgTexture) return;
  bgTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, bgTexture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([0, 0, 0, 255])
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
}

function uploadBackgroundImage(dataUrl) {
  ensureBgTexture();
  if (!dataUrl) {
    bgImageReady = false;
    return;
  }
  const img = new Image();
  img.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, bgTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    bgImageReady = true;
  };
  img.onerror = () => {
    bgImageReady = false;
  };
  img.src = dataUrl;
}

function updateViewportChecker() {
  if (!viewport) return;
  const show =
    params.backgroundAlpha < 0.995 ||
    (params.backgroundUseImage && params.backgroundImageDataUrl);
  viewport.classList.toggle("viewport--checker", show);
}

function compileShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(log || "Shader compile failed");
  }
  return shader;
}

function createProgram(vsSource, fsSource) {
  const vs = compileShader(gl.VERTEX_SHADER, vsSource);
  const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) || "Program link failed");
  }
  return program;
}

function showFatal(message) {
  const el = document.createElement("pre");
  el.style.cssText =
    "position:fixed;inset:16px;padding:16px;background:#300;color:#fff;font:14px/1.4 monospace;z-index:9999;white-space:pre-wrap";
  el.textContent = message;
  document.body.appendChild(el);
}

let program;
try {
  program = createProgram(vertSource, fragSource);
} catch (err) {
  showFatal(String(err));
  throw err;
}
gl.useProgram(program);

const quad = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, quad);
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
  gl.STATIC_DRAW
);

const aPosition = gl.getAttribLocation(program, "a_position");
gl.enableVertexAttribArray(aPosition);
gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

const uniforms = {};
for (const name of [
  "u_resolution",
  "u_time",
  "u_seed",
  "u_speed",
  "u_repeatPeriod",
  "u_streakLength",
  "u_streakCount",
  "u_thickness",
  "u_centerVoidRadius",
  "u_jitter",
  "u_jitterSpin",
  "u_jitterSpinMix",
  "u_cornerRadius",
  "u_beamColors",
  "u_beamColorCount",
  "u_brightness",
  "u_coreWhite",
  "u_backgroundColor",
  "u_backgroundImage",
  "u_useBackgroundImage",
  "u_bloomStrength",
  "u_exposure",
  "u_vignette",
]) {
  const loc =
    name === "u_beamColors"
      ? gl.getUniformLocation(program, "u_beamColors[0]")
      : gl.getUniformLocation(program, name);
  uniforms[name] = loc;
  if (loc === null && name.startsWith("u_")) {
    console.warn(`Uniform not found: ${name}`);
  }
}

ensureBgTexture();

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = SIZE * dpr;
  canvas.height = SIZE * dpr;
  gl.viewport(0, 0, canvas.width, canvas.height);
}

window.addEventListener("resize", resize);
resize();

function uploadBeamColors() {
  const count = Math.round(
    Math.min(MAX_BEAM_COLORS, Math.max(1, params.beamColorCount))
  );
  for (let i = 0; i < MAX_BEAM_COLORS; i++) {
    const [r, g, b] = hexToRgb(params.beamColors[i] ?? "#ffffff");
    const loc = gl.getUniformLocation(program, `u_beamColors[${i}]`);
    if (loc) gl.uniform3f(loc, r, g, b);
  }
  if (uniforms.u_beamColors) {
    const flat = new Float32Array(MAX_BEAM_COLORS * 3);
    for (let i = 0; i < MAX_BEAM_COLORS; i++) {
      const [r, g, b] = hexToRgb(params.beamColors[i] ?? "#ffffff");
      flat.set([r, g, b], i * 3);
    }
    gl.uniform3fv(uniforms.u_beamColors, flat);
  }
  if (uniforms.u_beamColorCount) {
    gl.uniform1i(uniforms.u_beamColorCount, count);
  }
}

function uploadUniforms(time) {
  gl.uniform2f(uniforms.u_resolution, canvas.width, canvas.height);
  gl.uniform1f(uniforms.u_time, time);
  gl.uniform1f(uniforms.u_seed, params.seed);

  gl.uniform1f(uniforms.u_speed, params.speed);
  gl.uniform1f(uniforms.u_repeatPeriod, params.repeatPeriod);
  gl.uniform1f(uniforms.u_streakLength, params.streakLength);

  gl.uniform1i(uniforms.u_streakCount, Math.round(params.streakCount));
  gl.uniform1f(uniforms.u_thickness, params.thickness);
  gl.uniform1f(uniforms.u_centerVoidRadius, params.centerVoidRadius);
  gl.uniform1f(uniforms.u_jitter, params.jitter);
  gl.uniform1f(uniforms.u_jitterSpin, params.jitterSpin);
  gl.uniform1f(uniforms.u_jitterSpinMix, params.jitterSpinMix);
  gl.uniform1f(uniforms.u_cornerRadius, params.cornerRadius);

  uploadBeamColors();

  gl.uniform1f(uniforms.u_brightness, params.brightness);
  gl.uniform1f(uniforms.u_coreWhite, params.coreWhite);

  const [br, bg, bb] = hexToRgb(params.backgroundColor ?? "#000000");
  const ba = Math.min(1, Math.max(0, params.backgroundAlpha ?? 1));
  gl.uniform4f(uniforms.u_backgroundColor, br, bg, bb, ba);

  const useImage =
    params.backgroundUseImage &&
    params.backgroundImageDataUrl &&
    bgImageReady;
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, bgTexture);
  gl.uniform1i(uniforms.u_backgroundImage, 0);
  gl.uniform1f(uniforms.u_useBackgroundImage, useImage ? 1 : 0);

  gl.uniform1f(uniforms.u_bloomStrength, params.bloomStrength);
  gl.uniform1f(uniforms.u_exposure, params.exposure);
  gl.uniform1f(uniforms.u_vignette, params.vignette);
}

function prepareFramebuffer() {
  const alpha = params.backgroundAlpha ?? 1;
  const needsBlend = alpha < 0.995;

  if (needsBlend) {
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
  } else {
    gl.disable(gl.BLEND);
    const [r, g, b] = hexToRgb(params.backgroundColor ?? "#000000");
    gl.clearColor(r, g, b, 1);
  }
  gl.clear(gl.COLOR_BUFFER_BIT);
}

function render(time) {
  prepareFramebuffer();
  uploadUniforms(time * 0.001);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

let recorder = null;
let recordChunks = [];

function startRecording() {
  if (recorder?.state === "recording") return;
  panel.setRecording(true);
  if (recordingPill) recordingPill.hidden = false;
  recordChunks = [];
  const stream = canvas.captureStream(60);
  recorder = new MediaRecorder(stream, {
    mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm",
    videoBitsPerSecond: 12_000_000,
  });
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) recordChunks.push(e.data);
  };
  recorder.onstop = () => {
    panel.setRecording(false);
    if (recordingPill) recordingPill.hidden = true;
    const blob = new Blob(recordChunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `warp-${Date.now()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  };
  recorder.start();
  setTimeout(() => {
    if (recorder?.state === "recording") recorder.stop();
  }, 8000);
}

function saveSettings() {
  const blob = new Blob([JSON.stringify(params, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `warp-settings-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function updateCanvasMeta() {
  if (!canvasMeta) return;
  const loopSec = getLoopDurationSec(params).toFixed(1);
  canvasMeta.textContent = `1080 × 1080 · ${loopSec}s loop @ 60fps`;
}

function onPanelChange() {
  updateViewportChecker();
  updateCanvasMeta();
  if (params.backgroundImageDataUrl) {
    uploadBackgroundImage(params.backgroundImageDataUrl);
  } else {
    bgImageReady = false;
  }
}

async function loadSettingsFile(file) {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    Object.assign(params, data);
    if (Array.isArray(data.beamColors)) {
      params.beamColors = [...data.beamColors];
    }
    migrateLegacyParams();
    panel.syncAll();
    onPanelChange();
  } catch (err) {
    console.error("Failed to load settings:", err);
    alert("Could not load settings — check that the file is valid JSON.");
  }
}

const panel = mountPanel(document.getElementById("panel"), params, {
  onChange: onPanelChange,
  onRecord: startRecording,
  onSave: saveSettings,
  onLoad: loadSettingsFile,
  onApplyPreset: (id) => {
    if (applyPresetToParams(params, id)) {
      onPanelChange();
    }
  },
  onResetSection: (sectionId) => {
    if (resetSectionParams(params, sectionId)) {
      onPanelChange();
    }
  },
});

panel.syncAll();
onPanelChange();
updateCanvasMeta();
if (params.backgroundImageDataUrl) {
  uploadBackgroundImage(params.backgroundImageDataUrl);
}

window.addEventListener("keydown", (e) => {
  if (e.key === "r" || e.key === "R") startRecording();
  if (e.key === "s" || e.key === "S") saveSettings();
});

function loop(now) {
  render(now);
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
