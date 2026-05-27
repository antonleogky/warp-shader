import { createContext, useContext } from "react";

/** @typedef {{
 *   params: Record<string, unknown>;
 *   tick: number;
 *   notifyChange: () => void;
 *   isRecording: boolean;
 *   actions: {
 *     onRecord?: () => void;
 *     onSave?: () => void;
 *     onLoad?: (file: File) => void;
 *     onApplyPreset?: (id: string) => void;
 *     onResetSection?: (sectionId: string) => void;
 *     onShuffleSeed?: () => void;
 *   };
 * }} PanelContextValue */

export const PanelContext = createContext(/** @type {PanelContextValue | null} */ (null));

export function usePanel() {
  const ctx = useContext(PanelContext);
  if (!ctx) {
    throw new Error("usePanel must be used within PanelProvider");
  }
  return ctx;
}
