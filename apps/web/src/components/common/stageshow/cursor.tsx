import type { Ref } from "react";
import "./cursor.css";

// The one cursor these scenes use: the macOS arrow. The kit's other glyphs,
// styles and ripples are not vendored.

function MacPointer() {
  return (
    <svg height="24" width="24" viewBox="0 0 32 32" fill="none" aria-hidden>
      <g transform="translate(10 7)">
        <path
          d="m6.148 18.473 1.863-1.003 1.615-.839-2.568-4.816h4.332l-11.379-11.408v16.015l3.316-3.221z"
          fill="var(--marketing-surface)"
        />
        <path
          d="m6.431 17 1.765-.941-2.775-5.202h3.604l-8.025-8.043v11.188l2.53-2.442z"
          fill="var(--marketing-ink)"
        />
      </g>
    </svg>
  );
}

/** The cursor element. The stage moves it (a transform on cursorRef) and marks it pressed or idle. */
export function Cursor({ cursorRef }: { cursorRef: Ref<HTMLDivElement> }) {
  return (
    <div ref={cursorRef} className="ss-cursor" aria-hidden>
      <div className="ss-cursor__press">
        <div className="ss-cursor__glyph">
          <MacPointer />
        </div>
      </div>
    </div>
  );
}
