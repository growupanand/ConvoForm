import type { TrustIconName } from "./trustIconName";

const MONO_FONT = "var(--font-jetbrains-mono), ui-monospace, monospace";

const STAR_PATH =
  "M138 7 L140.47 12.6 L146.56 13.22 L141.99 17.3 L143.29 23.28 L138 20.2 L132.71 23.28 L134.01 17.3 L129.44 13.22 L135.53 12.6 Z";

function OpenSourceIcon() {
  return (
    <>
      <path d="M58 22 L38 40 L58 58" />
      <path d="M102 22 L122 40 L102 58" />
      <path d="M88 16 L72 64" />
      <path
        d={STAR_PATH}
        fill="var(--marketing-blue-600)"
        stroke="var(--marketing-blue-600)"
      />
    </>
  );
}

function SelfHostIcon() {
  return (
    <>
      <path d="M20 14 H64 V66 H20 Z" stroke="var(--marketing-blue-600)" />
      <path d="M20 31 H64" stroke="var(--marketing-blue-600)" />
      <path d="M20 48 H64" stroke="var(--marketing-blue-600)" />
      <path d="M28 22.5 H42" stroke="var(--marketing-hair-soft)" />
      <path d="M28 39.5 H42" stroke="var(--marketing-hair-soft)" />
      <path d="M28 56.5 H42" stroke="var(--marketing-hair-soft)" />
      <circle cx="56" cy="22.5" r="2.2" fill="var(--marketing-blue-600)" />
      <circle cx="56" cy="39.5" r="2.2" fill="var(--marketing-blue-600)" />
      <circle cx="56" cy="56.5" r="2.2" fill="var(--marketing-blue-600)" />
      <path d="M110 54 H140 C147 54 151 48 149 42 C147 37 142 35 138 36 C136 29 129 25 122 27 C116 29 113 34 113 38 C107 38 103 42 104 47 C105 51 107 54 110 54 Z" />
      <path
        d="M70 40 H100"
        strokeDasharray="1.5 4.5"
        stroke="var(--marketing-slate)"
      />
      <circle cx="80" cy="40" r="3" fill="var(--marketing-blue-600)" />
      <text
        x="42"
        y="79"
        textAnchor="middle"
        fontSize="7.5"
        letterSpacing="0.6"
        fill="var(--marketing-blue-600)"
        style={{ fontFamily: MONO_FONT }}
      >
        YOUR SERVER
      </text>
      <text
        x="127"
        y="70"
        textAnchor="middle"
        fontSize="7.5"
        letterSpacing="0.6"
        fill="var(--marketing-slate)"
        style={{ fontFamily: MONO_FONT }}
      >
        OUR CLOUD
      </text>
    </>
  );
}

function NoSellIcon() {
  return (
    <>
      <path
        d="M80 8 L106 17 V38 C106 56 94 66 80 72 C66 66 54 56 54 38 V17 Z"
        stroke="var(--marketing-blue-600)"
      />
      <path
        d="M80 15 L99 21.5 V38 C99 52 90 60 80 65 C70 60 61 52 61 38 V21.5 Z"
        stroke="var(--marketing-hair-soft)"
      />
      <path
        d="M70 40 L77 47 L91 32"
        stroke="var(--marketing-blue-600)"
        strokeWidth="1.75"
      />
    </>
  );
}

function ExportIcon() {
  return (
    <>
      <path d="M12 14 H72 V66 H12 Z" />
      <path d="M12 27 H72" stroke="var(--marketing-hair-soft)" />
      <path
        d="M12 40 H72"
        stroke="var(--marketing-blue-200)"
        strokeWidth="1.75"
      />
      <path d="M12 53 H72" stroke="var(--marketing-hair-soft)" />
      <path d="M34 14 V66" stroke="var(--marketing-hair-soft)" />
      <path
        d="M96 16 H112 L120 24 V50 H96 Z"
        stroke="var(--marketing-blue-600)"
      />
      <path d="M112 16 V24 H120" stroke="var(--marketing-blue-600)" />
      <text
        x="108"
        y="41"
        textAnchor="middle"
        fontSize="7.5"
        fill="var(--marketing-blue-600)"
        style={{ fontFamily: MONO_FONT }}
      >
        CSV
      </text>
      <path d="M128 16 H152 V50 H128 Z" />
      <path d="M128 27 H152" stroke="var(--marketing-hair-soft)" />
      <path d="M128 38 H152" stroke="var(--marketing-hair-soft)" />
      <path d="M138 16 V50" stroke="var(--marketing-hair-soft)" />
      <text
        x="108"
        y="64"
        textAnchor="middle"
        fontSize="7"
        fill="var(--marketing-blue-600)"
        style={{ fontFamily: MONO_FONT }}
      >
        EXPORT
      </text>
      <text
        x="140"
        y="64"
        textAnchor="middle"
        fontSize="7"
        fill="var(--marketing-blue-600)"
        style={{ fontFamily: MONO_FONT }}
      >
        SHEETS
      </text>
    </>
  );
}

export function TrustIconStatic({ icon }: { icon: TrustIconName }) {
  return (
    <svg
      viewBox="0 0 160 80"
      fill="none"
      stroke="var(--marketing-slate)"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-20 w-40 overflow-visible"
    >
      {icon === "openSource" ? <OpenSourceIcon /> : null}
      {icon === "selfHost" ? <SelfHostIcon /> : null}
      {icon === "noSell" ? <NoSellIcon /> : null}
      {icon === "export" ? <ExportIcon /> : null}
    </svg>
  );
}
