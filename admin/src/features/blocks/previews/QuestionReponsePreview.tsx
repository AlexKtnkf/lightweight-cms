export function QuestionReponsePreview() {
  return (
    <svg
      viewBox="0 0 400 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full rounded border border-gray-200"
      role="img"
      aria-label="Aperçu du bloc FAQ"
    >
      <rect width="400" height="240" rx="6" fill="#FDFAF5" />

      {/* Section title */}
      <rect x="120" y="18" width="160" height="10" rx="4" fill="#3D7370" />

      {/* FAQ item 1 (open) */}
      <rect x="40" y="44" width="320" height="70" rx="6" fill="white" stroke="#8FC4C1" strokeWidth="1" />
      {/* Question */}
      <rect x="56" y="56" width="200" height="8" rx="3" fill="#3D7370" opacity="0.8" />
      {/* Chevron down */}
      <path d="M340 58 L344 64 L348 58" stroke="#5B9B97" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Answer lines */}
      <rect x="56" y="76" width="280" height="5" rx="2.5" fill="#7A7068" opacity="0.35" />
      <rect x="56" y="86" width="240" height="5" rx="2.5" fill="#7A7068" opacity="0.25" />
      <rect x="56" y="96" width="260" height="5" rx="2.5" fill="#7A7068" opacity="0.2" />

      {/* FAQ item 2 (closed) */}
      <rect x="40" y="124" width="320" height="32" rx="6" fill="white" stroke="#E5E7EB" strokeWidth="1" />
      <rect x="56" y="136" width="180" height="8" rx="3" fill="#3D7370" opacity="0.6" />
      {/* Chevron right */}
      <path d="M342 134 L348 140 L342 146" stroke="#7A7068" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* FAQ item 3 (closed) */}
      <rect x="40" y="166" width="320" height="32" rx="6" fill="white" stroke="#E5E7EB" strokeWidth="1" />
      <rect x="56" y="178" width="220" height="8" rx="3" fill="#3D7370" opacity="0.6" />
      <path d="M342 176 L348 182 L342 188" stroke="#7A7068" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      <text x="200" y="232" textAnchor="middle" fontSize="10" fill="#7A7068" fontFamily="Inter, sans-serif">
        FAQ
      </text>
    </svg>
  );
}
