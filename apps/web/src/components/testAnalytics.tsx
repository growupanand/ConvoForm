"use client";

import { Button } from "@convoform/ui/components/ui/button";
import { sendGTMEvent } from "@next/third-parties/google";

export function TestAnaylytics() {
  return (
    <div className="p-10">
      <Button
        onClick={() => sendGTMEvent({ category: "test", action: "click" })}
      >
        Test google tag event
      </Button>
    </div>
  );
}
