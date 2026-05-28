// ── I/O ───────────────────────────────────────────────────────────────────────
// Recording (WebM canvas capture) and settings save/load.
// These are the only functions that touch the filesystem or MediaRecorder API.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Starts an 8-second 1080×1080 WebM recording of the canvas at 60 fps.
 * The file downloads automatically when the recording stops.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {{ onStart: () => void, onStop: () => void }} callbacks
 */
export function startRecording(canvas, { onStart, onStop }) {
  const stream = canvas.captureStream(60);
  const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
    ? "video/webm;codecs=vp9"
    : "video/webm";

  const chunks = [];
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 12_000_000,
  });

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };
  recorder.onstop = () => {
    onStop();
    const blob = new Blob(chunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `warp-${Date.now()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  };

  onStart();
  recorder.start();
  setTimeout(() => {
    if (recorder.state === "recording") recorder.stop();
  }, 8000);
}

/**
 * Downloads the current params object as a JSON settings file.
 * @param {import('./params.js').WarpParams} params
 */
export function saveSettings(params) {
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

/**
 * Reads a settings JSON file into params, then calls onSync() + onChange()
 * so the React panel and GL loop pick up the new values.
 *
 * @param {File} file
 * @param {import('./params.js').WarpParams} params
 * @param {(p: import('./params.js').WarpParams) => void} migrate
 *   - Pass migrateLegacyParams from params.js to handle old save formats.
 * @param {{ onSync: () => void, onChange: () => void }} callbacks
 */
export async function loadSettingsFile(file, params, migrate, { onSync, onChange }) {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    Object.assign(params, data);
    if (Array.isArray(data.beamColors)) {
      params.beamColors = [...data.beamColors];
    }
    migrate(params);
    onSync();
    onChange();
  } catch (err) {
    console.error("Failed to load settings:", err);
    alert("Could not load settings — check that the file is valid JSON.");
  }
}
