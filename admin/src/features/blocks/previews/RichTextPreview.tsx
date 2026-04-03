export function RichTextPreview() {
  return (
    <svg
      viewBox="0 0 400 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full rounded border border-gray-200"
      role="img"
      aria-label="Aperçu du bloc Texte enrichi"
    >
      <rect width="400" height="240" rx="6" fill="#FDFAF5" />

      {/* Heading */}
      <rect x="40" y="30" width="180" height="12" rx="4" fill="#3D7370" />

      {/* Paragraph lines */}
      <rect x="40" y="58" width="320" height="6" rx="3" fill="#7A7068" opacity="0.45" />
      <rect x="40" y="72" width="300" height="6" rx="3" fill="#7A7068" opacity="0.4" />
      <rect x="40" y="86" width="310" height="6" rx="3" fill="#7A7068" opacity="0.35" />
      <rect x="40" y="100" width="260" height="6" rx="3" fill="#7A7068" opacity="0.3" />

      {/* Subheading */}
      <rect x="40" y="126" width="140" height="10" rx="4" fill="#3D7370" opacity="0.8" />

      {/* More paragraph lines */}
      <rect x="40" y="150" width="320" height="6" rx="3" fill="#7A7068" opacity="0.45" />
      <rect x="40" y="164" width="280" height="6" rx="3" fill="#7A7068" opacity="0.4" />
      <rect x="40" y="178" width="300" height="6" rx="3" fill="#7A7068" opacity="0.35" />

      {/* Bold word indicator */}
      <rect x="40" y="204" width="50" height="6" rx="3" fill="#3D7370" opacity="0.6" />
      <rect x="96" y="204" width="200" height="6" rx="3" fill="#7A7068" opacity="0.35" />

      <text x="200" y="232" textAnchor="middle" fontSize="10" fill="#7A7068" fontFamily="Inter, sans-serif">
        Texte enrichi
      </text>
    </svg>
  );
}
