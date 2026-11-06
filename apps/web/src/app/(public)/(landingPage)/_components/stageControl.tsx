"use client";

import type { StageStatus } from "@/components/common/stageshow";

// The one control the marketing stages share. It lives outside the role="img"
// stage shell, so the stage keeps a single accessible image and this stays a
// normal, keyboard-reachable button. The visible face is 32px; the ::before
// inset grows the hit area past 44px without changing the layout.

/** The imperative side of a custom play-once scene. */
export type PlayOnceStageHandle = {
  pause: () => void;
  play: () => void;
  replay: () => void;
};

const LABEL: Record<StageStatus, string> = {
  playing: "Pause animation",
  paused: "Play animation",
  done: "Replay animation",
};

function PauseIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M8 5v14M16 5v14"
        stroke="currentColor"
        strokeWidth={1.875}
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M8 5.5v13l11-6.5-11-6.5Z"
        stroke="currentColor"
        strokeWidth={1.875}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ReplayIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <g
        stroke="currentColor"
        strokeWidth={1.875}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
      </g>
    </svg>
  );
}

export function StageControl({
  status,
  onPause,
  onPlay,
  onReplay,
}: {
  status: StageStatus;
  onPause: () => void;
  onPlay: () => void;
  onReplay: () => void;
}) {
  const label = LABEL[status];
  const onClick =
    status === "playing" ? onPause : status === "paused" ? onPlay : onReplay;

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="relative inline-grid size-8 shrink-0 place-items-center rounded-full border-[1.25px] border-marketing-hair bg-marketing-paper text-marketing-label transition-colors duration-150 before:absolute before:-inset-2 before:rounded-full before:content-[''] hover:border-marketing-blue-300 hover:text-marketing-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marketing-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-marketing-paper"
    >
      {status === "playing" ? (
        <PauseIcon />
      ) : status === "paused" ? (
        <PlayIcon />
      ) : (
        <ReplayIcon />
      )}
    </button>
  );
}
