// src/components/ui/Card.jsx
// ============================================
// Carte conteneur — structure de base des blocs UI
// Usage :
//   <Card>contenu</Card>
//   <Card padding="lg" className="mt-4">contenu</Card>
// ============================================

export default function Card({
  children,
  padding = 'md',   // none | sm | md | lg
  className = '',
  onClick,          // Si défini, la carte devient cliquable
}) {

  const paddings = {
    none: '',
    sm:   'p-3',
    md:   'p-4',
    lg:   'p-6',
  }

  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-xl border border-brand-border
        shadow-[var(--shadow-card)]
        ${paddings[padding]}
        ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow duration-200' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}