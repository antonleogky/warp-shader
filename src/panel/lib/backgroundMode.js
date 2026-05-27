/**
 * Background segment mode: solid color, transparent, or image plate.
 */

/** @param {Record<string, unknown>} params */
export function getBackgroundMode(params) {
  if (params.backgroundUseImage) return "image";
  if ((params.backgroundAlpha ?? 1) <= 0.001) return "clear";
  return "color";
}

/**
 * @param {Record<string, unknown>} params
 * @param {"color" | "clear" | "image"} mode
 */
export function applyBackgroundMode(params, mode) {
  if (mode === "clear") {
    params.backgroundAlpha = 0;
    params.backgroundUseImage = false;
    return;
  }
  if (mode === "image") {
    params.backgroundUseImage = true;
    if ((params.backgroundAlpha ?? 1) <= 0.001) {
      params.backgroundAlpha = 1;
    }
    return;
  }
  /* color */
  params.backgroundUseImage = false;
  if ((params.backgroundAlpha ?? 1) <= 0.001) {
    params.backgroundAlpha = 1;
  }
  if (!params.backgroundColor) {
    params.backgroundColor = "#000000";
  }
}
