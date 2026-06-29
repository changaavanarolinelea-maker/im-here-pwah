// src/components/ui/Button.jsx
// ============================================
// Bouton réutilisable — toutes les variantes
// Usage :
//   <Button>Enregistrer</Button>
//   <Button variant="outline" size="sm">Annuler</Button>
//   <Button variant="danger" isLoading>Supprimer</Button>
// ============================================

import { Loader2 } from 'lucide-react'

export default function Button({
  children,
  variant = 'primary', // primary | secondary | outline | danger | ghost
  size = 'md',         // sm | md | lg
  isLoading = false,   // affiche un spinner et désactive le bouton
  disabled = false,
  fullWidth = false,
  type = 'button',
  onClick,
  className = '',
}) {

  // --- Styles de base (communs à toutes les variantes) ---
  const base = `
    inline-flex items-center justify-center gap-2
    font-medium rounded-lg transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-95
  `

  // --- Variantes de couleur ---
  const variants = {
    primary:   'bg-brand-red text-white hover:bg-brand-red-dark focus:ring-brand-red',
    secondary: 'bg-brand-black text-white hover:bg-brand-dark focus:ring-brand-black',
    outline:   'border border-brand-border text-brand-dark hover:bg-brand-light focus:ring-brand-gray',
    danger:    'bg-red-100 text-brand-red hover:bg-red-200 focus:ring-brand-red',
    ghost:     'text-brand-gray hover:bg-brand-light hover:text-brand-dark focus:ring-brand-gray',
  }

  // --- Tailles ---
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        ${base}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {/* Spinner de chargement */}
      {isLoading && (
        <Loader2 size={16} className="animate-spin" />
      )}
      {children}
    </button>
  )
}