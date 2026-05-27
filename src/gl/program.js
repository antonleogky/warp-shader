// ── WEBGL PROGRAM ─────────────────────────────────────────────────────────────
// Shader compilation and program linking utilities.
// These are pure functions — they hold no state and have no side-effects
// beyond the WebGL context itself.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {WebGL2RenderingContext} gl
 * @param {number} type - gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
 * @param {string} source
 * @returns {WebGLShader}
 */
export function compileShader(gl, type, source) {
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

/**
 * @param {WebGL2RenderingContext} gl
 * @param {string} vsSource
 * @param {string} fsSource
 * @returns {WebGLProgram}
 */
export function createProgram(gl, vsSource, fsSource) {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);
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

/**
 * Renders a fatal error overlay on top of the page.
 * Called when shader compilation fails — keeps the error visible without
 * needing dev tools open.
 * @param {string} message
 */
export function showFatal(message) {
  const el = document.createElement("pre");
  el.style.cssText =
    "position:fixed;inset:16px;padding:16px;background:#300;color:#fff;font:14px/1.4 monospace;z-index:9999;white-space:pre-wrap";
  el.textContent = message;
  document.body.appendChild(el);
}
