/**
 * DropLANLogo — SVG logo matching the app icon (WiFi arc + water drop, purple gradient)
 * Used in the titlebar to keep visual identity consistent with the .app icon.
 */
export function DropLANLogo({ size = 22 }: { size?: number }): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#7c6dfa" />
        </linearGradient>
      </defs>
      {/* WiFi arc 1 — outermost */}
      <path
        d="M18 42 Q50 10 82 42"
        stroke="url(#logo-grad)"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />
      {/* WiFi arc 2 */}
      <path
        d="M28 54 Q50 32 72 54"
        stroke="url(#logo-grad)"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />
      {/* WiFi arc 3 — innermost */}
      <path
        d="M38 66 Q50 54 62 66"
        stroke="url(#logo-grad)"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />
      {/* Water drop */}
      <path
        d="M50 72 C44 80 38 86 38 90 C38 96 44 100 50 100 C56 100 62 96 62 90 C62 86 56 80 50 72Z"
        fill="url(#logo-grad)"
      />
    </svg>
  );
}
