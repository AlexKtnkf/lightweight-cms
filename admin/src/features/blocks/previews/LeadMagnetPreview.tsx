export function LeadMagnetPreview() {
  return (
    <svg
      viewBox="0 0 400 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full rounded border border-gray-200"
      role="img"
      aria-label="Aperçu du bloc Lead Magnet"
    >
      <rect width="400" height="240" rx="6" fill="#EEF5F1" />

      {/* Card container */}
      <rect x="60" y="24" width="280" height="192" rx="12" fill="white" stroke="#8FC4C1" strokeWidth="1" />

      {/* Icon circle */}
      <circle cx="200" cy="56" r="16" fill="#5B9B97" opacity="0.15" />
      {/* Seedling icon */}
      <path d="M196 60 C196 52, 204 52, 204 60" stroke="#5B9B97" strokeWidth="1.5" fill="none" />
      <line x1="200" y1="60" x2="200" y2="66" stroke="#5B9B97" strokeWidth="1.5" />

      {/* Title */}
      <rect x="130" y="82" width="140" height="10" rx="4" fill="#3D7370" />

      {/* Description */}
      <rect x="100" y="104" width="200" height="6" rx="3" fill="#7A7068" opacity="0.4" />
      <rect x="115" y="116" width="170" height="6" rx="3" fill="#7A7068" opacity="0.3" />

      {/* Email input */}
      <rect x="90" y="140" width="160" height="28" rx="6" fill="#F9FAFB" stroke="#E5E7EB" strokeWidth="1" />
      <rect x="102" y="151" width="80" height="6" rx="3" fill="#7A7068" opacity="0.2" />

      {/* Subscribe button */}
      <rect x="258" y="140" width="70" height="28" rx="6" fill="#5B9B97" />
      <rect x="272" y="151" width="42" height="6" rx="3" fill="white" />

      <text x="200" y="232" textAnchor="middle" fontSize="10" fill="#7A7068" fontFamily="Inter, sans-serif">
        Lead Magnet
      </text>
    </svg>
  );
}
