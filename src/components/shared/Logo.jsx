// src/components/shared/Logo.jsx
// Logo principal de l'application "I'M HERE"
// Utilisé dans la sidebar, le login, et le splash screen
// SVG inline = net sur tous les écrans, aucun chargement réseau

export default function Logo({ size = 'md', variant = 'full' }) {
  // --- Tailles disponibles ---
  const sizes = {
    sm: { width: 120, height: 36, font: 14, sub: 9 },
    md: { width: 160, height: 48, font: 18, sub: 11 },
    lg: { width: 220, height: 66, font: 26, sub: 14 },
    xl: { width: 280, height: 84, font: 32, sub: 17 },
  }

  const s = sizes[size]

  // variant="icon" = juste le carré rouge (pour favicon, petits espaces)
  // variant="full" = carré + texte complet
  if (variant === 'icon') {
    return (
      <svg width={s.height} height={s.height} viewBox="0 0 48 48" fill="none"
        xmlns="http://www.w3.org/2000/svg" aria-label="I'm Here">
        {/* Fond noir arrondi */}
        <rect width="48" height="48" rx="12" fill="#111111" />
        {/* Carré rouge centré */}
        <rect x="10" y="10" width="28" height="28" rx="6" fill="#DC2626" />
        {/* Lettre I blanche */}
        <text x="24" y="31" textAnchor="middle"
          fontFamily="system-ui, sans-serif"
          fontWeight="800" fontSize="20" fill="#FFFFFF">
          I
        </text>
      </svg>
    )
  }

  return (
    <svg width={s.width} height={s.height}
      viewBox={`0 0 ${s.width} ${s.height}`}
      fill="none" xmlns="http://www.w3.org/2000/svg"
      aria-label="I'm Here - Gestion de présence">

      {/* === Bloc icône gauche === */}
      {/* Fond noir */}
      <rect width={s.height} height={s.height} rx={s.height * 0.25} fill="#111111" />
      {/* Carré rouge */}
      <rect
        x={s.height * 0.2}
        y={s.height * 0.2}
        width={s.height * 0.6}
        height={s.height * 0.6}
        rx={s.height * 0.12}
        fill="#DC2626"
      />
      {/* Lettre I blanche */}
      <text
        x={s.height * 0.5}
        y={s.height * 0.68}
        textAnchor="middle"
        fontFamily="system-ui, sans-serif"
        fontWeight="800"
        fontSize={s.height * 0.42}
        fill="#FFFFFF">
        I
      </text>

      {/* === Texte droite === */}
      {/* Ligne 1 : I'M HERE */}
      <text
        x={s.height + 12}
        y={s.height * 0.52}
        fontFamily="system-ui, sans-serif"
        fontWeight="800"
        fontSize={s.font}
        letterSpacing="0.05em"
        fill="#111111">
        I'M HERE
      </text>

      {/* Ligne 2 : Gestion de présence */}
      <text
        x={s.height + 12}
        y={s.height * 0.52 + s.font * 1.3}
        fontFamily="system-ui, sans-serif"
        fontWeight="400"
        fontSize={s.sub}
        letterSpacing="0.08em"
        fill="#DC2626">
        GESTION DE PRÉSENCE
      </text>
    </svg>
  )
}