import { useCallback, useMemo, useState } from "react";
import { PanelContext } from "@/panel/PanelContext";
import { DesignSidebar } from "@/panel/components/DesignSidebar";
import { TooltipProvider } from "@/panel/components/ui/tooltip";

export function App({
  params,
  tick,
  onParamChange,
  isRecording,
  actions,
}) {
  const notifyChange = useCallback(() => {
    onParamChange?.();
  }, [onParamChange]);

  const value = useMemo(
    () => ({ params, tick, notifyChange, isRecording, actions }),
    [params, tick, notifyChange, isRecording, actions]
  );

  return (
    <TooltipProvider delayDuration={200}>
      <PanelContext.Provider value={value}>
        <DesignSidebar />
      </PanelContext.Provider>
    </TooltipProvider>
  );
}
