export const MAX_BEAM_COLORS = 8;

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

export function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const full =
    h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return [1, 1, 1];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255);
}

export function isValidHex(hex) {
  return /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex);
}

export function normalizeHex(hex) {
  let h = hex.trim();
  if (!h.startsWith("#")) h = `#${h}`;
  if (!isValidHex(h)) return null;
  if (h.length === 4) {
    h = `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`;
  }
  return h.toLowerCase();
}

export function hexToRgba(hex, alpha = 1) {
  const [r, g, b] = hexToRgb(hex);
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
    a: Math.round(clamp(alpha, 0, 1) * 100),
  };
}

export function rgbaToHex(r, g, b) {
  const toByte = (v) =>
    Math.round(clamp(v, 0, 255))
      .toString(16)
      .padStart(2, "0");
  return `#${toByte(r)}${toByte(g)}${toByte(b)}`;
}
