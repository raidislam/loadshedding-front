import { Info } from "lucide-react";

// Shown wherever sample data is displayed, so nobody mistakes it for live data.
export function DemoNotice({ children }: { children?: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
      <Info className="mt-0.5 size-4 shrink-0" />
      <p>
        {children ??
          "Demonstration data only. This is not a real-time feed from an electricity authority."}
      </p>
    </div>
  );
}
