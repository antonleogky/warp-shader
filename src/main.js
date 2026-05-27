import "./geist-fonts.js";
import vertSource from "./shaders/quad.vert?raw";

const DEV_PORT = 5190;
const badge = document.getElementById("app-badge");
if (import.meta.env.DEV && badge) {
  const port = window.location.port || String(DEV_PORT);
  badge.hidden = false;
  badge.textContent = `warp-shader · :${port}`;
  if (port !== String(DEV_PORT)) {
    badge.style.color = "hsl(0 70% 65%)";
    badge.title = `Expected port ${DEV_PORT}. You may be on the wrong dev server.`;
  }
}
import fragSource from "./shaders/warp.frag?raw";
import { createControlPanel, MAX_BEAM_COLORS, hexToRgb } from "./panel.js";

const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2", {
  alpha: false,
  antialias: false,
  preserveDrawingBuffer: true,
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
  backgroundColor: { r: 0.01, g: 0.02, b: 0.06 },
  bloomStrength: 0.55,
  exposure: 1.05,
  vignette: 0.15,
  seed: 1.0,
};

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
  gl.uniform3f(
    uniforms.u_backgroundColor,
    params.backgroundColor.r,
    params.backgroundColor.g,
    params.backgroundColor.b
  );
  gl.uniform1f(uniforms.u_bloomStrength, params.bloomStrength);
  gl.uniform1f(uniforms.u_exposure, params.exposure);
  gl.uniform1f(uniforms.u_vignette, params.vignette);
}

function render(time) {
  uploadUniforms(time * 0.001);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

let recorder = null;
let recordChunks = [];

function startRecording() {
  if (recorder?.state === "recording") return;
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

function applyReferencePreset() {
  Object.assign(params, {
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
    bloomStrength: 0.55,
    exposure: 1.05,
    vignette: 0.15,
    seed: 1,
  });
  params.beamColors = [
    "#5ce1ff",
    "#4d8dff",
    "#c56bff",
    "#ffffff",
    "#00e8c6",
    "#ff6eb4",
    "#ffd166",
    "#a8b4ff",
  ];
}

const panel = createControlPanel(document.getElementById("panel"), params, {
  onPreset: () => {
    applyReferencePreset();
    panel.syncAll();
  },
  onSave: saveSettings,
});

panel.syncAll();

window.addEventListener("keydown", (e) => {
  if (e.key === "r" || e.key === "R") startRecording();
  if (e.key === "s" || e.key === "S") saveSettings();
});

function loop(now) {
  render(now);
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
