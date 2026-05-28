/**
 * Background segment mode: solid color, transparent, or image plate.
 *
 * Mode is stored explicitly in params.backgroundMode so that setting
 * opacity to 0 in color mode doesn't silently flip the segment to "clear".
 * Legacy params without backgroundMode fall back to alpha-sniffing.
 */

/** @param {Record<string, unknown>} params */
export function getBackgroundMode(params) {
  if (params.backgroundUseImage) return "image";
  // Explicit mode flag takes precedence over alpha value
  if (params.backgroundMode === "clear") return "clear";
  if (params.backgroundMode === "color") return "color";
  // Legacy fallback: infer from alpha
  if ((params.backgroundAlpha ?? 1) <= 0.001) return "clear";
  return "color";
}

/**
 * @param {Record<string, unknown>} params
 * @param {"color" | "clear" | "image"} mode
 */
export function applyBackgroundMode(params, mode) {
  if (mode === "clear") {
    params.backgroundMode = "clear";
    params.backgroundAlpha = 0;
    params.backgroundUseImage = false;
    return;
  }
  if (mode === "image") {
    params.backgroundMode = "image";
    params.backgroundUseImage = true;
    if ((params.backgroundAlpha ?? 1) <= 0.001) {
      params.backgroundAlpha = 1;
    }
    return;
  }
  /* color */
  params.backgroundMode = "color";
  params.backgroundUseImage = false;
  // Restore alpha only if coming from clear (alpha was zeroed by that mode)
  if (params.backgroundAlpha != null && params.backgroundAlpha <= 0.001) {
    params.backgroundAlpha = 1;
  }
  if (!params.backgroundColor) {
    params.backgroundColor = "#000000";
  }
}
