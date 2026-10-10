"use client";

import { Expand, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

type ScreenshotExpandProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export function ScreenshotExpand({
  src,
  alt,
}: Readonly<ScreenshotExpandProps>) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const trigger = triggerRef.current;
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <a
        ref={triggerRef}
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="View full size"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="absolute right-2 top-2 z-10 inline-flex size-8 items-center justify-center rounded-full border border-border bg-background/90 text-foreground opacity-0 transition-opacity hover:bg-background focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100"
        onClick={(event) => {
          if (
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey ||
            event.button !== 0
          ) {
            return;
          }
          event.preventDefault();
          setOpen(true);
        }}
      >
        <Expand className="size-3.5" aria-hidden />
      </a>
      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="fixed inset-0 z-50 overflow-auto"
        >
          <button
            type="button"
            tabIndex={-1}
            aria-label="Close"
            className="absolute inset-0 bg-black/80"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10">
            <div className="pointer-events-none sticky top-0 z-20 flex justify-end p-3">
              <button
                ref={closeRef}
                type="button"
                className="pointer-events-auto inline-flex size-9 items-center justify-center rounded-full bg-background text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => setOpen(false)}
              >
                <X className="size-4" aria-hidden />
                <span className="sr-only">Close</span>
              </button>
            </div>
            <h2 id={titleId} className="sr-only">
              {alt}
            </h2>
            <img
              src={src}
              alt={alt}
              className="relative z-10 mx-auto mb-8 block h-auto w-auto min-w-full max-w-none bg-white"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
