export function EncartPrincipalPreview() {
  return (
    <svg
      viewBox="0 0 400 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full rounded border border-gray-200"
      role="img"
      aria-label="Aperçu du bloc Encart principal"
    >
      <rect width="400" height="240" rx="6" fill="#FDFAF5" />

      {/* Image placeholder (left side) */}
      <rect x="24" y="30" width="160" height="180" rx="8" fill="#EEF5F1" stroke="#8FC4C1" strokeWidth="1" />
      <rect x="80" y="100" width="48" height="48" rx="24" fill="#8FC4C1" opacity="0.5" />
      {/* Mountain icon inside image */}
      <path d="M88 128 L104 108 L120 128" stroke="#5B9B97" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* Text card (right side) */}
      <rect x="200" y="42" width="176" height="156" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="1" />

      {/* Title */}
      <rect x="216" y="62" width="120" height="10" rx="4" fill="#3D7370" />

      {/* Text lines */}
      <rect x="216" y="86" width="144" height="6" rx="3" fill="#7A7068" opacity="0.45" />
      <rect x="216" y="98" width="130" height="6" rx="3" fill="#7A7068" opacity="0.35" />
      <rect x="216" y="110" width="140" height="6" rx="3" fill="#7A7068" opacity="0.3" />

      {/* Link button */}
      <rect x="216" y="138" width="80" height="24" rx="12" fill="none" stroke="#5B9B97" strokeWidth="1.5" />
      <rect x="232" y="147" width="48" height="6" rx="3" fill="#5B9B97" opacity="0.6" />

      <text x="200" y="232" textAnchor="middle" fontSize="10" fill="#7A7068" fontFamily="Inter, sans-serif">
        Encart principal
      </text>
    </svg>
  );
}
