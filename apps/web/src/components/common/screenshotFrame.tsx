import { cn } from "@/lib/utils";
import Image from "next/image";

import { ScreenshotExpand } from "./screenshotExpand";

const frameRatios = {
  "8/5": "lg:aspect-[8/5]",
  video: "lg:aspect-video",
  "4/3": "lg:aspect-[4/3]",
  square: "lg:aspect-square",
} as const;

const frameSizes = {
  md: "max-w-xl",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
} as const;

const frameSizesAttribute = {
  md: "(max-width: 1024px) 100vw, 36rem",
  lg: "(max-width: 1024px) 100vw, 42rem",
  xl: "(max-width: 1024px) 100vw, 56rem",
} as const;

const focusPosition = {
  top: "center top",
  center: "center center",
  bottom: "center bottom",
} as const;

type ScreenshotFrameProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  ratio?: keyof typeof frameRatios;
  size?: keyof typeof frameSizes;
  focus?: keyof typeof focusPosition;
  /** Draws window chrome around the screenshot. The image keeps its intrinsic aspect ratio (no letterboxing). */
  browser?: boolean;
  /** Shown in the address bar when `browser` is set. */
  url?: string;
  priority?: boolean;
  className?: string;
};

export function ScreenshotFrame({
  src,
  alt,
  width,
  height,
  caption,
  ratio = "8/5",
  size = "lg",
  focus = "center",
  browser = false,
  url,
  priority = false,
  className,
}: Readonly<ScreenshotFrameProps>) {
  const imageClassName = browser
    ? "block h-auto w-full"
    : cn("h-full w-full object-cover", "rounded-xl");

  return (
    <figure
      className={cn("w-full min-w-0 max-w-full", frameSizes[size], className)}
    >
      <div
        className={cn(
          "group relative flex w-full flex-col overflow-hidden rounded-2xl bg-muted shadow-[0_18px_40px_-28px_hsl(var(--foreground)/0.45)]",
          !browser && cn("min-h-0", frameRatios[ratio]),
        )}
      >
        {browser ? <BrowserChrome url={url} /> : null}
        <ScreenshotExpand src={src} alt={alt} width={width} height={height} />
        <div
          className={cn(
            "relative w-full overflow-hidden bg-white",
            browser
              ? "mx-1.5 mb-1.5 sm:mx-2 sm:mb-2 rounded-b-lg"
              : "m-2 min-h-0 flex-1 overflow-hidden sm:m-3 rounded-xl",
          )}
        >
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            priority={priority}
            sizes={frameSizesAttribute[size]}
            className={imageClassName}
            style={
              browser ? undefined : { objectPosition: focusPosition[focus] }
            }
          />
        </div>
      </div>
      {caption ? (
        <figcaption className="mt-3 max-w-prose text-sm leading-6 text-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

function BrowserChrome({ url }: { url?: string }) {
  return (
    <div
      aria-hidden
      className="flex shrink-0 items-center gap-3 border-b bg-muted px-3 py-2"
    >
      <div className="flex shrink-0 gap-1.5">
        <span className="size-2.5 rounded-full bg-red-400" />
        <span className="size-2.5 rounded-full bg-yellow-400" />
        <span className="size-2.5 rounded-full bg-green-400" />
      </div>
      {url ? (
        <>
          <div className="flex h-6 min-w-0 flex-1 items-center justify-center rounded-md bg-white px-3">
            <span className="truncate text-xs text-foreground">{url}</span>
          </div>
          <div className="w-[3.25rem] shrink-0" />
        </>
      ) : null}
    </div>
  );
}
