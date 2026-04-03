export function PinGridPreview() {
  return (
    <svg
      viewBox="0 0 400 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full rounded border border-gray-200"
      role="img"
      aria-label="Aperçu du bloc Pin Grid"
    >
      <rect width="400" height="240" rx="6" fill="#FDFAF5" />

      {/* Section title */}
      <rect x="120" y="20" width="160" height="10" rx="4" fill="#3D7370" />

      {/* Pin 1 */}
      <rect x="24" y="48" width="108" height="130" rx="8" fill="#EEF5F1" stroke="#8FC4C1" strokeWidth="1" />
      <rect x="36" y="56" width="84" height="80" rx="4" fill="#8FC4C1" opacity="0.3" />
      <rect x="44" y="148" width="68" height="6" rx="3" fill="#7A7068" opacity="0.5" />
      <rect x="52" y="160" width="52" height="5" rx="2.5" fill="#7A7068" opacity="0.3" />

      {/* Pin 2 */}
      <rect x="146" y="48" width="108" height="130" rx="8" fill="#EEF5F1" stroke="#8FC4C1" strokeWidth="1" />
      <rect x="158" y="56" width="84" height="80" rx="4" fill="#B5838D" opacity="0.25" />
      <rect x="166" y="148" width="68" height="6" rx="3" fill="#7A7068" opacity="0.5" />
      <rect x="174" y="160" width="52" height="5" rx="2.5" fill="#7A7068" opacity="0.3" />

      {/* Pin 3 */}
      <rect x="268" y="48" width="108" height="130" rx="8" fill="#EEF5F1" stroke="#8FC4C1" strokeWidth="1" />
      <rect x="280" y="56" width="84" height="80" rx="4" fill="#9AAA88" opacity="0.3" />
      <rect x="288" y="148" width="68" height="6" rx="3" fill="#7A7068" opacity="0.5" />
      <rect x="296" y="160" width="52" height="5" rx="2.5" fill="#7A7068" opacity="0.3" />

      {/* Dots indicating more */}
      <circle cx="186" cy="200" r="3" fill="#7A7068" opacity="0.3" />
      <circle cx="200" cy="200" r="3" fill="#7A7068" opacity="0.3" />
      <circle cx="214" cy="200" r="3" fill="#7A7068" opacity="0.3" />

      <text x="200" y="232" textAnchor="middle" fontSize="10" fill="#7A7068" fontFamily="Inter, sans-serif">
        Pin Grid
      </text>
    </svg>
  );
}
