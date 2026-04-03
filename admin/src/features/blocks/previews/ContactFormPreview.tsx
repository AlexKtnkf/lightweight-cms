export function ContactFormPreview() {
  return (
    <svg
      viewBox="0 0 400 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full rounded border border-gray-200"
      role="img"
      aria-label="Aperçu du bloc Formulaire de contact"
    >
      <rect width="400" height="240" rx="6" fill="#FDFAF5" />

      {/* Title */}
      <rect x="130" y="16" width="140" height="10" rx="4" fill="#3D7370" />

      {/* Description */}
      <rect x="110" y="34" width="180" height="6" rx="3" fill="#7A7068" opacity="0.35" />

      {/* Two-column fields row */}
      {/* Field 1: Name */}
      <rect x="30" y="56" width="165" height="10" rx="0" fill="none" />
      <rect x="30" y="56" width="50" height="6" rx="2" fill="#7A7068" opacity="0.5" />
      <rect x="30" y="68" width="165" height="26" rx="4" fill="white" stroke="#E5E7EB" strokeWidth="1" />
      <rect x="40" y="78" width="70" height="6" rx="3" fill="#7A7068" opacity="0.15" />

      {/* Field 2: Email */}
      <rect x="205" y="56" width="165" height="6" rx="2" fill="none" />
      <rect x="205" y="56" width="40" height="6" rx="2" fill="#7A7068" opacity="0.5" />
      <rect x="205" y="68" width="165" height="26" rx="4" fill="white" stroke="#E5E7EB" strokeWidth="1" />
      <rect x="215" y="78" width="80" height="6" rx="3" fill="#7A7068" opacity="0.15" />

      {/* Select dropdown (full width) */}
      <rect x="30" y="106" width="50" height="6" rx="2" fill="#7A7068" opacity="0.5" />
      <rect x="30" y="118" width="340" height="26" rx="4" fill="white" stroke="#E5E7EB" strokeWidth="1" />
      <rect x="40" y="128" width="60" height="6" rx="3" fill="#7A7068" opacity="0.15" />
      {/* Dropdown chevron */}
      <path d="M354 128 L358 134 L362 128" stroke="#7A7068" strokeWidth="1" fill="none" strokeLinecap="round" />

      {/* Textarea (full width) */}
      <rect x="30" y="156" width="55" height="6" rx="2" fill="#7A7068" opacity="0.5" />
      <rect x="30" y="168" width="340" height="40" rx="4" fill="white" stroke="#E5E7EB" strokeWidth="1" />
      <rect x="40" y="178" width="120" height="5" rx="2.5" fill="#7A7068" opacity="0.12" />
      <rect x="40" y="188" width="90" height="5" rx="2.5" fill="#7A7068" opacity="0.1" />

      {/* Submit button */}
      <rect x="150" y="216" width="100" height="20" rx="10" fill="#5B9B97" />
      <rect x="172" y="223" width="56" height="6" rx="3" fill="white" />
    </svg>
  );
}
