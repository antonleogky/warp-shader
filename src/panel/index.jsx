import { useCallback, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "@/panel/styles/globals.css";
import { App } from "@/panel/App";

/**
 * @param {HTMLElement} mount
 * @param {Record<string, unknown>} params
 * @param {{
 *   onChange?: () => void;
 *   onRecord?: () => void;
 *   onSave?: () => void;
 *   onLoad?: (file: File) => void | Promise<void>;
 *   onApplyPreset?: (id: string) => void;
 *   onResetSection?: (sectionId: string) => void;
 * }} callbacks
 */
export function mountPanel(mount, params, callbacks = {}) {
  const root = createRoot(mount);
  let syncRef = () => {};
  /** @type {((v: boolean) => void) | null} */
  let setRecordingRef = null;

  function Shell() {
    const [tick, setTick] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    setRecordingRef = setIsRecording;
    syncRef = () => setTick((t) => t + 1);

    const onParamChange = useCallback(() => {
      callbacks.onChange?.();
      setTick((t) => t + 1);
    }, []);

    const actions = useMemo(
      () => ({
        onRecord: () => callbacks.onRecord?.(),
        onSave: () => callbacks.onSave?.(),
        onLoad: (file) => callbacks.onLoad?.(file),
        onApplyPreset: (id) => {
          callbacks.onApplyPreset?.(id);
          setTick((t) => t + 1);
        },
        onResetSection: (sectionId) => {
          callbacks.onResetSection?.(sectionId);
          onParamChange();
        },
        onShuffleSeed: () => {
          params.seed = Math.round(Math.random() * 1000) / 10;
          onParamChange();
        },
      }),
      [onParamChange]
    );

    return (
      <App
        params={params}
        tick={tick}
        onParamChange={onParamChange}
        isRecording={isRecording}
        actions={actions}
      />
    );
  }

  root.render(<Shell />);

  return {
    syncAll: () => syncRef(),
    setRecording: (v) => setRecordingRef?.(v),
  };
}

export { MAX_BEAM_COLORS, hexToRgb, normalizeHex } from "@/panel/lib/color";
