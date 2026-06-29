// src/components/ui/StatCard.jsx
// ============================================
// Carte de statistique — dashboard admin
// Affiche un chiffre clé avec icône et tendance
// Usage :
//   <StatCard
//     title="Employés présents"
//     value={24}
//     total={30}
//     icon={<Users size={20} />}
//     variant="success"
//   />
// ============================================

export default function StatCard({
  title,
  value,
  total,       // Si défini, affiche "value / total"
  icon,
  variant = 'default', // default | success | danger | warning | info
  className = '',
}) {

  const variants = {
    default: { bg: 'bg-brand-light',    icon: 'bg-brand-black text-white',          text: 'text-brand-dark'  },
    success: { bg: 'bg-green-50',       icon: 'bg-status-present text-white',       text: 'text-status-present' },
    danger:  { bg: 'bg-red-50',         icon: 'bg-status-absent text-white',        text: 'text-status-absent'  },
    warning: { bg: 'bg-amber-50',       icon: 'bg-status-late text-white',          text: 'text-status-late'    },
    info:    { bg: 'bg-blue-50',        icon: 'bg-status-pending text-white',       text: 'text-status-pending' },
    red:     { bg: 'bg-brand-red-light',icon: 'bg-brand-red text-white',            text: 'text-brand-red'      },
  }

  const v = variants[variant]

  return (
    <div className={`
      rounded-xl p-4 ${v.bg} border border-transparent
      ${className}
    `}>
      <div className="flex items-start justify-between">

        {/* Texte */}
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-brand-gray uppercase tracking-wide">
            {title}
          </p>
          <p className={`text-2xl font-bold ${v.text}`}>
            {value}
            {total !== undefined && (
              <span className="text-sm font-normal text-brand-gray ml-1">
                / {total}
              </span>
            )}
          </p>
        </div>

        {/* Icône */}
        {icon && (
          <div className={`p-2 rounded-lg ${v.icon}`}>
            {icon}
          </div>
        )}

      </div>
    </div>
  )
}