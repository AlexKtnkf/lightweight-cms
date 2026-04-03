export function NumberedCardsPreview() {
  return (
    <svg
      viewBox="0 0 400 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full rounded border border-gray-200"
      role="img"
      aria-label="Aperçu du bloc Cartes numérotées"
    >
      {/* Dark background variant */}
      <rect width="400" height="240" rx="6" fill="#2A2520" />

      {/* Section title */}
      <rect x="110" y="20" width="180" height="10" rx="4" fill="white" opacity="0.8" />

      {/* Card 1 */}
      <rect x="16" y="48" width="116" height="140" rx="8" fill="white" opacity="0.08" />
      <text x="74" y="78" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#B5838D" opacity="0.7" fontFamily="Inter, sans-serif">01</text>
      <rect x="36" y="92" width="76" height="8" rx="3" fill="white" opacity="0.6" />
      <rect x="30" y="110" width="88" height="5" rx="2.5" fill="white" opacity="0.25" />
      <rect x="34" y="120" width="80" height="5" rx="2.5" fill="white" opacity="0.2" />
      <rect x="38" y="130" width="72" height="5" rx="2.5" fill="white" opacity="0.15" />

      {/* Card 2 */}
      <rect x="142" y="48" width="116" height="140" rx="8" fill="white" opacity="0.08" />
      <text x="200" y="78" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#B5838D" opacity="0.7" fontFamily="Inter, sans-serif">02</text>
      <rect x="162" y="92" width="76" height="8" rx="3" fill="white" opacity="0.6" />
      <rect x="156" y="110" width="88" height="5" rx="2.5" fill="white" opacity="0.25" />
      <rect x="160" y="120" width="80" height="5" rx="2.5" fill="white" opacity="0.2" />
      <rect x="164" y="130" width="72" height="5" rx="2.5" fill="white" opacity="0.15" />

      {/* Card 3 */}
      <rect x="268" y="48" width="116" height="140" rx="8" fill="white" opacity="0.08" />
      <text x="326" y="78" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#B5838D" opacity="0.7" fontFamily="Inter, sans-serif">03</text>
      <rect x="288" y="92" width="76" height="8" rx="3" fill="white" opacity="0.6" />
      <rect x="282" y="110" width="88" height="5" rx="2.5" fill="white" opacity="0.25" />
      <rect x="286" y="120" width="80" height="5" rx="2.5" fill="white" opacity="0.2" />
      <rect x="290" y="130" width="72" height="5" rx="2.5" fill="white" opacity="0.15" />

      <text x="200" y="228" textAnchor="middle" fontSize="10" fill="white" opacity="0.5" fontFamily="Inter, sans-serif">
        Cartes numérotées
      </text>
    </svg>
  );
}
