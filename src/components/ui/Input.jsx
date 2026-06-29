// src/components/ui/Input.jsx
// ============================================
// Champ de saisie réutilisable
// Usage :
//   <Input label="Email" type="email" value={email} onChange={...} />
//   <Input label="Mot de passe" type="password" error="Champ requis" />
// ============================================

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function Input({
  label,           // Texte au-dessus du champ
  type = 'text',
  value,
  onChange,
  placeholder,
  error,           // Message d'erreur affiché en rouge dessous
  hint,            // Message d'aide affiché en gris dessous
  disabled = false,
  required = false,
  icon,            // Icône à gauche (composant Lucide)
  className = '',
  ...props         // Toutes les autres props HTML (name, id, autoComplete...)
}) {
  // Pour le champ mot de passe : toggle afficher/cacher
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>

      {/* Label */}
      {label && (
        <label className="text-sm font-medium text-brand-dark">
          {label}
          {required && <span className="text-brand-red ml-1">*</span>}
        </label>
      )}

      {/* Conteneur du champ */}
      <div className="relative">

        {/* Icône gauche */}
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray">
            {icon}
          </div>
        )}

        {/* Champ input */}
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`
            w-full rounded-lg border px-4 py-2.5 text-sm
            bg-white text-brand-dark placeholder:text-brand-gray
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent
            disabled:bg-brand-light disabled:cursor-not-allowed
            ${error
              ? 'border-brand-red bg-red-50'
              : 'border-brand-border hover:border-brand-gray'
            }
            ${icon ? 'pl-10' : ''}
            ${isPassword ? 'pr-10' : ''}
          `}
          {...props}
        />

        {/* Bouton afficher/cacher mot de passe */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray hover:text-brand-dark"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>

      {/* Message d'erreur */}
      {error && (
        <p className="text-xs text-brand-red flex items-center gap-1">
          {error}
        </p>
      )}

      {/* Message d'aide */}
      {hint && !error && (
        <p className="text-xs text-brand-gray">{hint}</p>
      )}
    </div>
  )
}