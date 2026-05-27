import { useRef, useState } from "react";
import { Copy, Download, FileUp, Film, Loader2 } from "lucide-react";
import { Button } from "@/panel/components/ui/button";
import { usePanel } from "@/panel/PanelContext";
import { getLoopDurationSec } from "@/panel/lib/presets";
import { cn } from "@/panel/lib/utils";

export function ExportBar() {
  const { params, actions, isRecording } = usePanel();
  const loadRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const loopSec = getLoopDurationSec(params).toFixed(1);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(params, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      actions.onSave?.();
    }
  };

  return (
    <div className="space-y-3 border-b border-border bg-muted/30 px-5 py-4">
      <div className="flex items-baseline justify-between gap-2">
        <p className="type-overline">Export</p>
        <p className="type-mono-muted">
          1080² · {loopSec}s loop
        </p>
      </div>

      <Button
        type="button"
        static={isRecording}
        className={cn(
          "h-11 w-full gap-2 shadow-none",
          isRecording && "pointer-events-none opacity-90"
        )}
        onClick={() => actions.onRecord?.()}
        disabled={isRecording}
      >
        {isRecording ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Recording… 8s
          </>
        ) : (
          <>
            <Film className="size-4" />
            Record loop (WebM)
          </>
        )}
      </Button>

      <div className="grid grid-cols-3 gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 shadow-none"
          onClick={() => actions.onSave?.()}
        >
          <Download className="size-3.5 shrink-0" />
          Save
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 shadow-none"
          onClick={() => loadRef.current?.click()}
        >
          <FileUp className="size-3.5 shrink-0" />
          Load
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 shadow-none"
          onClick={handleCopy}
        >
          <Copy className="size-3.5 shrink-0" />
          {copied ? "Copied" : "Copy JSON"}
        </Button>
      </div>

      <input
        ref={loadRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) actions.onLoad?.(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
