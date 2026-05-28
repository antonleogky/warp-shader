// ── MAIN ──────────────────────────────────────────────────────────────────────
// Entry point. Wires together canvas, GL program, render loop, and React panel.
//
// AI AGENT GUIDE — this file is intentionally thin. Common tasks live in:
//   src/params.js          — add / change shader parameters
//   src/gl/uniforms.js     — connect a param to its GLSL uniform
//   src/gl/background.js   — background image / transparency
//   src/io.js              — recording, save/load settings
//   src/shaders/warp.frag  — GLSL rendering logic
//   src/panel/             — React UI panel
//   AGENTS.md              — full architecture map (start here)
// ─────────────────────────────────────────────────────────────────────────────

import "./geist-fonts.js";
import "./app.css";
import vertSource from "./shaders/quad.vert?raw";
import fragSource from "./shaders/warp.frag?raw";

import { DEFAULT_PARAMS, migrateLegacyParams } from "./params.js";
import { createProgram, showFatal } from "./gl/program.js";
import {
  buildUniformRegistry,
  uploadUniforms,
  prepareFramebuffer,
} from "./gl/uniforms.js";
import {
  createBgTexture,
  uploadBackgroundImage,
  updateViewportChecker,
} from "./gl/background.js";
import { startRecording, saveSettings, loadSettingsFile } from "./io.js";
import { mountPanel } from "./panel/index.jsx";
import {
  applyPresetToParams,
  getLoopDurationSec,
  resetSectionParams,
} from "./panel/lib/presets.js";

// ── DEV BADGE ──────────────────────────────────────────────────────────────
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

// ── CANVAS + GL SETUP ──────────────────────────────────────────────────────
const canvas = document.getElementById("canvas");
const viewport = document.getElementById("viewport");
const canvasMeta = document.getElementById("canvas-meta");
const recordingPill = document.getElementById("recording-pill");
const SIZE = 1080;

const gl = canvas.getContext("webgl2", {
  alpha: true,
  antialias: false,
  preserveDrawingBuffer: true,
  premultipliedAlpha: false,
});
if (!gl) throw new Error("WebGL2 is required.");

let program;
try {
  program = createProgram(gl, vertSource, fragSource);
} catch (err) {
  showFatal(String(err));
  throw err;
}
gl.useProgram(program);

// Full-screen quad — two triangles that together fill clip space [-1,1]².
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

const uniforms = buildUniformRegistry(gl, program);

// ── PARAMS ────────────────────────────────────────────────────────────────
// params is a plain mutable object shared between the GL render loop and the
// React panel. The panel mutates fields directly and calls notifyChange();
// the render loop reads the current values on every frame via uploadUniforms.
const params = { ...DEFAULT_PARAMS };
migrateLegacyParams(params);

// ── BACKGROUND TEXTURE ────────────────────────────────────────────────────
const bgTexture = createBgTexture(gl);
let bgImageReady = false;

function syncBgImage() {
  uploadBackgroundImage(
    gl,
    bgTexture,
    params.backgroundImageDataUrl,
    (ready) => {
      bgImageReady = ready;
    }
  );
}

// ── CANVAS RESIZE ─────────────────────────────────────────────────────────
function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = SIZE * dpr;
  canvas.height = SIZE * dpr;
  gl.viewport(0, 0, canvas.width, canvas.height);
}
window.addEventListener("resize", resize);
resize();

// ── RENDER LOOP ───────────────────────────────────────────────────────────
function render(timestampMs) {
  prepareFramebuffer(gl, params);
  uploadUniforms(
    gl,
    uniforms,
    program,
    params,
    canvas,
    timestampMs * 0.001,
    bgTexture,
    bgImageReady
  );
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

function loop(now) {
  render(now);
  requestAnimationFrame(loop);
}

// ── PANEL CALLBACKS ───────────────────────────────────────────────────────
function onPanelChange() {
  updateViewportChecker(viewport, params);
  updateCanvasMeta();
  if (params.backgroundImageDataUrl) syncBgImage();
  else bgImageReady = false;
}

function updateCanvasMeta() {
  if (!canvasMeta) return;
  canvasMeta.textContent = `1080 × 1080 · ${getLoopDurationSec(params).toFixed(1)}s loop @ 60fps`;
}

// ── RECORDING STATE ───────────────────────────────────────────────────────
// Guard prevents starting a second recording while one is in progress.
let isRecording = false;

function handleRecord() {
  if (isRecording) return;
  startRecording(canvas, {
    onStart: () => {
      isRecording = true;
      panel.setRecording(true);
      if (recordingPill) recordingPill.hidden = false;
    },
    onStop: () => {
      isRecording = false;
      panel.setRecording(false);
      if (recordingPill) recordingPill.hidden = true;
    },
  });
}

// ── PANEL MOUNT ───────────────────────────────────────────────────────────
const panel = mountPanel(document.getElementById("panel"), params, {
  onChange: onPanelChange,
  onRecord: handleRecord,
  onSave: () => saveSettings(params),
  onLoad: (file) =>
    loadSettingsFile(file, params, migrateLegacyParams, {
      onSync: () => panel.syncAll(),
      onChange: onPanelChange,
    }),
  onApplyPreset: (id) => {
    if (applyPresetToParams(params, id)) onPanelChange();
  },
  onResetSection: (sectionId) => {
    if (resetSectionParams(params, sectionId)) onPanelChange();
  },
});

panel.syncAll();
onPanelChange();
updateCanvasMeta();
if (params.backgroundImageDataUrl) syncBgImage();

// ── KEYBOARD SHORTCUTS ────────────────────────────────────────────────────
// R = record 8-second loop  |  S = save settings JSON
window.addEventListener("keydown", (e) => {
  if (e.key === "r" || e.key === "R") handleRecord();
  if (e.key === "s" || e.key === "S") saveSettings(params);
});

requestAnimationFrame(loop);
