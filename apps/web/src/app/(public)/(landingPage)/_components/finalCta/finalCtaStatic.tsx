const BODY_FONT = "var(--font-inter), system-ui, sans-serif";
const MONO_FONT = "var(--font-jetbrains-mono), ui-monospace, monospace";
const MESSAGE = "Hi! What should I call you?";

export function FinalCtaStatic() {
  return (
    <svg
      viewBox="16 84 428 196"
      fill="none"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="block h-auto w-full overflow-visible"
      style={{ fontFamily: BODY_FONT }}
    >
      <text
        x="42"
        y="112"
        fontSize="9.5"
        fill="var(--marketing-slate)"
        style={{ fontFamily: MONO_FONT, letterSpacing: ".06em" }}
      >
        CONVOFORM
      </text>
      <circle cx="34" cy="109" r="2.6" fill="var(--marketing-blue-600)" />

      <path
        d="M56 169.4 L36 179 L43 167"
        fill="var(--marketing-surface)"
        stroke="var(--marketing-blue-600)"
      />

      <rect
        x="30"
        y="124"
        width="272"
        height="46"
        rx="20"
        fill="var(--marketing-surface)"
        fillOpacity=".6"
        stroke="var(--marketing-blue-600)"
        strokeOpacity=".9"
      />
      <text
        x="49"
        y="152.5"
        fontSize="16"
        fontWeight="500"
        fill="var(--marketing-ink)"
      >
        {MESSAGE}
      </text>

      <g>
        <rect
          x="348"
          y="196"
          width="78"
          height="40"
          rx="18"
          fill="var(--marketing-blue-600)"
          fillOpacity=".06"
          stroke="var(--marketing-blue-600)"
        />
        <text
          x="387"
          y="222"
          textAnchor="middle"
          fontSize="16"
          fontWeight="600"
          fill="var(--marketing-blue-600)"
        >
          Priya
        </text>
      </g>
      <text
        x="422"
        y="252"
        textAnchor="end"
        fontSize="9.5"
        fill="var(--marketing-slate)"
        style={{ fontFamily: MONO_FONT, letterSpacing: ".06em" }}
      >
        YOU
      </text>
    </svg>
  );
}
