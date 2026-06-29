// src/components/ui/Badge.jsx
// ============================================
// Badge de statut coloré
// Usage :
//   <Badge variant="success">Présent</Badge>
//   <Badge variant="danger">Absent</Badge>
//   <Badge variant="warning">En retard</Badge>
// ============================================

export default function Badge({
  children,
  variant = 'default', // default | success | danger | warning | info | dark
  size = 'md',         // sm | md
  dot = false,         // affiche un point coloré à gauche
  className = '',
}) {

  const variants = {
    default: 'bg-brand-light text-brand-gray',
    success: 'bg-green-50 text-status-present',
    danger:  'bg-red-50 text-status-absent',
    warning: 'bg-amber-50 text-status-late',
    info:    'bg-blue-50 text-status-pending',
    dark:    'bg-brand-black text-white',
    red:     'bg-brand-red text-white',
  }

  const dotColors = {
    default: 'bg-brand-gray',
    success: 'bg-status-present',
    danger:  'bg-status-absent',
    warning: 'bg-status-late',
    info:    'bg-status-pending',
    dark:    'bg-white',
    red:     'bg-white',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  }

  return (
    <span className={`
      inline-flex items-center gap-1.5 font-medium rounded-full
      ${variants[variant]}
      ${sizes[size]}
      ${className}
    `}>
      {/* Point de statut */}
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  )
}