export function HeroPreview() {
  return (
    <svg
      viewBox="0 0 400 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full rounded border border-gray-200"
      role="img"
      aria-label="Aperçu du bloc Hero"
    >
      {/* Background */}
      <rect width="400" height="240" rx="6" fill="#F0FAF9" />

      {/* Decorative gradient band at top */}
      <rect width="400" height="6" fill="#5B9B97" rx="6" />
      <rect y="6" width="400" height="2" fill="#8FC4C1" opacity="0.4" />

      {/* Tagline */}
      <rect x="155" y="40" width="90" height="8" rx="4" fill="#B5838D" opacity="0.6" />

      {/* Title (large) */}
      <rect x="80" y="64" width="240" height="14" rx="4" fill="#3D7370" />
      <rect x="110" y="86" width="180" height="14" rx="4" fill="#3D7370" opacity="0.7" />

      {/* Description */}
      <rect x="70" y="116" width="260" height="6" rx="3" fill="#7A7068" opacity="0.45" />
      <rect x="95" y="128" width="210" height="6" rx="3" fill="#7A7068" opacity="0.35" />
      <rect x="120" y="140" width="160" height="6" rx="3" fill="#7A7068" opacity="0.25" />

      {/* Primary button */}
      <rect x="112" y="170" width="80" height="28" rx="14" fill="#5B9B97" />
      <rect x="128" y="181" width="48" height="6" rx="3" fill="white" />

      {/* Secondary button (outline) */}
      <rect x="208" y="170" width="80" height="28" rx="14" fill="none" stroke="#5B9B97" strokeWidth="1.5" />
      <rect x="224" y="181" width="48" height="6" rx="3" fill="#5B9B97" opacity="0.6" />

      {/* Label */}
      <text x="200" y="228" textAnchor="middle" fontSize="10" fill="#7A7068" fontFamily="Inter, sans-serif">
        Hero
      </text>
    </svg>
  );
}
