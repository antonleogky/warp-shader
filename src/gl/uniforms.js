// ── UNIFORMS ──────────────────────────────────────────────────────────────────
// Resolves GLSL uniform locations once at startup, then uploads all params
// to the GPU on every frame.
//
// AI AGENT GUIDE — to add a new uniform:
//   1. Add its name to UNIFORM_NAMES below.
//   2. Add upload logic in uploadUniforms() below.
//   3. Declare the uniform in src/shaders/warp.frag.
//   4. Add the default value in src/params.js → DEFAULT_PARAMS.
//
// Param → Uniform quick-reference:
//   speed              → u_speed
//   repeatPeriod       → u_repeatPeriod
//   streakLength       → u_streakLength
//   streakCount        → u_streakCount        (int)
//   thickness          → u_thickness
//   centerVoidRadius   → u_centerVoidRadius
//   jitter             → u_jitter
//   jitterSpin         → u_jitterSpin
//   jitterSpinMix      → u_jitterSpinMix
//   cornerRadius       → u_cornerRadius
//   beamColors[]       → u_beamColors[0..7]   (vec3 array, MAX_BEAM_COLORS=8)
//   beamColorCount     → u_beamColorCount     (int)
//   brightness         → u_brightness
//   coreWhite          → u_coreWhite
//   backgroundColor +
//     backgroundAlpha  → u_backgroundColor   (vec4, alpha = backgroundAlpha)
//   backgroundUseImage
//   + bgImageReady     → u_useBackgroundImage (float 0|1, both must be true)
//   bloomStrength      → u_bloomStrength
//   exposure           → u_exposure
//   vignette           → u_vignette
//   seed               → u_seed
// ─────────────────────────────────────────────────────────────────────────────

import { MAX_BEAM_COLORS, hexToRgb } from "@/panel/lib/color.js";

const UNIFORM_NAMES = [
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
];

/**
 * Resolves all uniform locations once at startup.
 * Logs a warning for any uniform declared in UNIFORM_NAMES but absent from
 * the compiled program (catches typos in GLSL declarations early).
 * @param {WebGL2RenderingContext} gl
 * @param {WebGLProgram} program
 * @returns {Record<string, WebGLUniformLocation | null>}
 */
export function buildUniformRegistry(gl, program) {
  const uniforms = {};
  for (const name of UNIFORM_NAMES) {
    // u_beamColors is an array — query the first element so the registry holds
    // the base location; individual indices are queried per-frame in uploadBeamColors.
    const loc =
      name === "u_beamColors"
        ? gl.getUniformLocation(program, "u_beamColors[0]")
        : gl.getUniformLocation(program, name);
    uniforms[name] = loc;
    if (loc === null) {
      console.warn(`Uniform not found in program: ${name}`);
    }
  }
  return uniforms;
}

/**
 * Uploads all 8 beam color slots and the active count to the GPU.
 * Both uniform3fv (flat array) and per-index uniform3f are used because some
 * WebGL implementations don't accept uniform3fv on GLSL array uniforms.
 * @param {WebGL2RenderingContext} gl
 * @param {Record<string, WebGLUniformLocation | null>} uniforms
 * @param {WebGLProgram} program
 * @param {import('../params.js').WarpParams} params
 */
export function uploadBeamColors(gl, uniforms, program, params) {
  const count = Math.round(
    Math.min(MAX_BEAM_COLORS, Math.max(1, params.beamColorCount))
  );
  const flat = new Float32Array(MAX_BEAM_COLORS * 3);
  for (let i = 0; i < MAX_BEAM_COLORS; i++) {
    const [r, g, b] = hexToRgb(params.beamColors[i] ?? "#ffffff");
    flat.set([r, g, b], i * 3);
    const loc = gl.getUniformLocation(program, `u_beamColors[${i}]`);
    if (loc) gl.uniform3f(loc, r, g, b);
  }
  if (uniforms.u_beamColors) gl.uniform3fv(uniforms.u_beamColors, flat);
  if (uniforms.u_beamColorCount) gl.uniform1i(uniforms.u_beamColorCount, count);
}

/**
 * Uploads all shader uniforms for a single frame.
 * Called every frame inside the render loop.
 * @param {WebGL2RenderingContext} gl
 * @param {Record<string, WebGLUniformLocation | null>} uniforms
 * @param {WebGLProgram} program
 * @param {import('../params.js').WarpParams} params
 * @param {HTMLCanvasElement} canvas
 * @param {number} timeSec - elapsed time in seconds
 * @param {WebGLTexture} bgTexture
 * @param {boolean} bgImageReady - true once the image has finished loading
 */
export function uploadUniforms(
  gl,
  uniforms,
  program,
  params,
  canvas,
  timeSec,
  bgTexture,
  bgImageReady
) {
  gl.uniform2f(uniforms.u_resolution, canvas.width, canvas.height);
  gl.uniform1f(uniforms.u_time, timeSec);
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

  uploadBeamColors(gl, uniforms, program, params);

  gl.uniform1f(uniforms.u_brightness, params.brightness);
  gl.uniform1f(uniforms.u_coreWhite, params.coreWhite);

  const [br, bg, bb] = hexToRgb(params.backgroundColor ?? "#000000");
  const ba = Math.min(1, Math.max(0, params.backgroundAlpha ?? 1));
  gl.uniform4f(uniforms.u_backgroundColor, br, bg, bb, ba);

  const useImage =
    params.backgroundUseImage && params.backgroundImageDataUrl && bgImageReady;
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, bgTexture);
  gl.uniform1i(uniforms.u_backgroundImage, 0);
  gl.uniform1f(uniforms.u_useBackgroundImage, useImage ? 1 : 0);

  gl.uniform1f(uniforms.u_bloomStrength, params.bloomStrength);
  gl.uniform1f(uniforms.u_exposure, params.exposure);
  gl.uniform1f(uniforms.u_vignette, params.vignette);
}

/**
 * Configures GL blending and clears the framebuffer before drawing.
 * When backgroundAlpha < 1 the canvas needs a transparent clear so the
 * checkerboard behind the canvas shows through.
 * @param {WebGL2RenderingContext} gl
 * @param {import('../params.js').WarpParams} params
 */
export function prepareFramebuffer(gl, params) {
  const alpha = params.backgroundAlpha ?? 1;
  if (alpha < 0.995) {
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
