// src/components/ui/Spinner.jsx
// ============================================
// Indicateur de chargement
// Usage :
//   <Spinner />
//   <Spinner size="lg" />
//   <Spinner fullScreen /> ← couvre toute la page
// ============================================

import { Loader2 } from 'lucide-react'

export default function Spinner({ size = 'md', fullScreen = false }) {

  const sizes = {
    sm: 16,
    md: 24,
    lg: 40,
  }

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={40} className="animate-spin text-brand-red" />
          <p className="text-sm text-brand-gray">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <Loader2
      size={sizes[size]}
      className="animate-spin text-brand-red"
    />
  )
}