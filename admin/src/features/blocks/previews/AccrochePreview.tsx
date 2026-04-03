export function AccrochePreview() {
  return (
    <svg
      viewBox="0 0 400 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full rounded border border-gray-200"
      role="img"
      aria-label="Aperçu du bloc Accroche"
    >
      <rect width="400" height="240" rx="6" fill="#FDFAF5" />

      {/* Optional image (small, centered above) */}
      <rect x="168" y="24" width="64" height="48" rx="6" fill="#EEF5F1" stroke="#8FC4C1" strokeWidth="1" />
      <circle cx="200" cy="48" r="12" fill="#8FC4C1" opacity="0.5" />

      {/* Title centered */}
      <rect x="110" y="88" width="180" height="12" rx="4" fill="#3D7370" />

      {/* Content lines (centered text block) */}
      <rect x="60" y="116" width="280" height="6" rx="3" fill="#7A7068" opacity="0.45" />
      <rect x="80" y="130" width="240" height="6" rx="3" fill="#7A7068" opacity="0.4" />
      <rect x="70" y="144" width="260" height="6" rx="3" fill="#7A7068" opacity="0.35" />
      <rect x="100" y="158" width="200" height="6" rx="3" fill="#7A7068" opacity="0.3" />
      <rect x="90" y="172" width="220" height="6" rx="3" fill="#7A7068" opacity="0.25" />

      <text x="200" y="232" textAnchor="middle" fontSize="10" fill="#7A7068" fontFamily="Inter, sans-serif">
        Accroche
      </text>
    </svg>
  );
}
