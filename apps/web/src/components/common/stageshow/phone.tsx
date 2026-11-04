import type { HTMLAttributes, ReactNode } from "react";

// A quiet phone shell for the marketing scenes: a dark bezel, a light screen,
// a status bar and a home indicator. The kit's frame variants, lock screen and
// notifications are not vendored.

export interface PhoneProps extends HTMLAttributes<HTMLDivElement> {
  /** Outer width in px. */
  width?: number;
  /** Outer height in px. Scenes crop the bottom when they need to. */
  height?: number;
  /** Status bar time. */
  time?: string;
  children?: ReactNode;
}

export function Phone({
  width = 340,
  height = 690,
  time = "9:41",
  className,
  style,
  children,
  ...rest
}: PhoneProps) {
  return (
    <div
      {...rest}
      className={`ss-phone${className ? ` ${className}` : ""}`}
      style={{ width, height, ...style }}
    >
      <div className="ss-phone__screen">
        <div className="ss-phone__status">
          <span className="ss-phone__time">{time}</span>
          <span className="ss-phone__glyphs">
            <Signal />
            <Wifi />
            <Battery />
          </span>
        </div>
        <span className="ss-phone__island" />
        <div className="ss-phone__content">{children}</div>
        <span className="ss-phone__home" />
      </div>
    </div>
  );
}

function Signal() {
  return (
    <svg
      viewBox="0 0 18 12"
      width="18"
      height="12"
      className="ss-phone__glyph"
      aria-hidden
    >
      {[5, 7, 9, 12].map((h, i) => (
        <rect
          key={h}
          x={i * 4.5}
          y={12 - h}
          width={3}
          height={h}
          rx={1.5}
          fill="currentColor"
        />
      ))}
    </svg>
  );
}

function Wifi() {
  return (
    <svg
      viewBox="0 0 16 12"
      width="16"
      height="12"
      className="ss-phone__glyph"
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M8 9.6a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm0-3.5c1.2 0 2.3.4 3.2 1.2l1-1.1A6.7 6.7 0 0 0 8 4.4c-1.6 0-3.1.6-4.2 1.8l1 1.1A4.8 4.8 0 0 1 8 6.1Zm0-3.7c2 0 3.8.7 5.2 2l1-1.1A9 9 0 0 0 8 .7 9 9 0 0 0 1.8 3.3l1 1.1A7.4 7.4 0 0 1 8 2.4Z"
      />
    </svg>
  );
}

function Battery() {
  return (
    <svg
      viewBox="0 0 26 12"
      width="26"
      height="12"
      className="ss-phone__glyph"
      aria-hidden
    >
      <rect
        x="0.75"
        y="0.75"
        width="21.5"
        height="10.5"
        rx="3"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeWidth="1.5"
      />
      <rect
        x="2.5"
        y="2.5"
        width="16.5"
        height="7"
        rx="1.5"
        fill="currentColor"
      />
      <path
        d="M24.5 4v4c.8-.3 1.4-1.1 1.4-2s-.6-1.7-1.4-2Z"
        fill="currentColor"
        opacity="0.45"
      />
    </svg>
  );
}
