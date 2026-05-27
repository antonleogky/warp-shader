// ── BACKGROUND TEXTURE ────────────────────────────────────────────────────────
// Manages the optional image that sits behind the warp effect.
// The texture is created once at startup; image data is re-uploaded whenever
// the user picks a new image in BackgroundSection.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a 1×1 black placeholder texture.
 * The placeholder prevents GL errors before the user uploads an image.
 * @param {WebGL2RenderingContext} gl
 * @returns {WebGLTexture}
 */
export function createBgTexture(gl) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0,
    gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255])
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return tex;
}

/**
 * Uploads a base64 data URL as the background image texture.
 * Asynchronous — calls onReady(true) once the image has decoded and uploaded,
 * or onReady(false) on empty/error.
 * @param {WebGL2RenderingContext} gl
 * @param {WebGLTexture} bgTexture
 * @param {string} dataUrl
 * @param {(ready: boolean) => void} onReady
 */
export function uploadBackgroundImage(gl, bgTexture, dataUrl, onReady) {
  if (!dataUrl) {
    onReady(false);
    return;
  }
  const img = new Image();
  img.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, bgTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    onReady(true);
  };
  img.onerror = () => onReady(false);
  img.src = dataUrl;
}

/**
 * Toggles the checkerboard CSS class on the viewport element.
 * Checkerboard is shown whenever the background is transparent or an image
 * is active, so the user can see through to whatever is behind the canvas.
 * @param {HTMLElement | null} viewport
 * @param {import('../params.js').WarpParams} params
 */
export function updateViewportChecker(viewport, params) {
  if (!viewport) return;
  const show =
    params.backgroundAlpha < 0.995 ||
    (params.backgroundUseImage && params.backgroundImageDataUrl);
  viewport.classList.toggle("viewport--checker", show);
}
