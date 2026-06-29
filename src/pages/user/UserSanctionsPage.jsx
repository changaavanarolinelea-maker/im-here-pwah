// src/pages/user/UserSanctionsPage.jsx
// ============================================
// Sanctions de l'employé connecté
// Affiche :
//   - Total des pénalités du mois sélectionné
//   - Liste détaillée de chaque sanction
// Les sanctions sont générées automatiquement
// par le backend — jamais manuellement
// ============================================

import { useState, useEffect, useCallback } from 'react'
import { AlertTriangle, TrendingDown } from 'lucide-react'
import sanctionsService from '../../services/sanctions.service'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import { formatDate } from '../../utils/formatters'
import toast from 'react-hot-toast'

export default function UserSanctionsPage() {
  const [sanctions, setSanctions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalAmount, setTotalAmount] = useState(0)
  const [filters, setFilters]     = useState({
    month: new Date().getMonth() + 1, // Mois courant (1-12)
    year:  new Date().getFullYear(),
  })

  const fetchSanctions = useCallback(async () => {
  setIsLoading(true)
  try {
    const data = await sanctionsService.getMine(filters)
    // Ton API retourne { total, totalPenalty, sanctions: [...] }
    setSanctions(data.sanctions ?? [])
    setTotalAmount(data.totalPenalty ?? 0)
  } catch {
    toast.error('Impossible de charger vos sanctions')
  } finally {
    setIsLoading(false)
  }
}, [filters])
  useEffect(() => { fetchSanctions() }, [fetchSanctions])



  // Mois disponibles pour le filtre
  const months = [
    { value: 1,  label: 'Janvier'   },
    { value: 2,  label: 'Février'   },
    { value: 3,  label: 'Mars'      },
    { value: 4,  label: 'Avril'     },
    { value: 5,  label: 'Mai'       },
    { value: 6,  label: 'Juin'      },
    { value: 7,  label: 'Juillet'   },
    { value: 8,  label: 'Août'      },
    { value: 9,  label: 'Septembre' },
    { value: 10, label: 'Octobre'   },
    { value: 11, label: 'Novembre'  },
    { value: 12, label: 'Décembre'  },
  ]

  // Années disponibles (3 dernières années)
  const currentYear = new Date().getFullYear()
  const years = [currentYear, currentYear - 1, currentYear - 2]

  return (
    <div className="flex flex-col gap-5">

      {/* ==============================
          FILTRES MOIS / ANNÉE
          ============================== */}
      <div className="flex gap-3">
        <select
          value={filters.month}
          onChange={e => setFilters(f => ({ ...f, month: Number(e.target.value) }))}
          className="
            flex-1 rounded-lg border border-brand-border
            px-3 py-2.5 text-sm text-brand-dark bg-white
            focus:outline-none focus:ring-2 focus:ring-brand-red
          "
        >
          {months.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>

        <select
          value={filters.year}
          onChange={e => setFilters(f => ({ ...f, year: Number(e.target.value) }))}
          className="
            w-28 rounded-lg border border-brand-border
            px-3 py-2.5 text-sm text-brand-dark bg-white
            focus:outline-none focus:ring-2 focus:ring-brand-red
          "
        >
          {years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* ==============================
          CARTE TOTAL DU MOIS
          ============================== */}
      <div className={`
        rounded-xl p-5
        ${totalAmount > 0 ? 'bg-brand-red' : 'bg-brand-black'}
        flex items-center justify-between
      `}>
        <div>
          <p className="text-white text-opacity-80 text-xs font-medium uppercase tracking-wide mb-1">
            Total pénalités — {months.find(m => m.value === filters.month)?.label} {filters.year}
          </p>
          <p className="text-white text-3xl font-bold">
            {totalAmount.toLocaleString('fr-FR')} FCFA
          </p>
          <p className="text-white text-opacity-60 text-xs mt-1">
            {sanctions.length} sanction{sanctions.length > 1 ? 's' : ''} ce mois
          </p>
        </div>
        <TrendingDown size={40} className="text-white opacity-30" />
      </div>

      {/* ==============================
          LISTE DES SANCTIONS
          ============================== */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : sanctions.length === 0 ? (
        <Card padding="lg">
          <div className="flex flex-col items-center gap-2 py-8">
            <AlertTriangle size={32} className="text-brand-border" />
            <p className="text-sm font-medium text-brand-dark">
              Aucune sanction ce mois
            </p>
            <p className="text-xs text-brand-gray text-center">
              Continuez comme ça !
            </p>
          </div>
        </Card>
      ) : (
        <Card padding="none">
          <div className="px-4 py-3 border-b border-brand-border">
            <h3 className="text-sm font-semibold text-brand-dark">
              Détail des sanctions
            </h3>
          </div>
          <ul className="divide-y divide-brand-border">
            {sanctions.map((sanction, i) => (
              <SanctionRow key={sanction.id ?? i} sanction={sanction} />
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}

// ============================================
// COMPOSANT : Ligne d'une sanction
// ============================================
function SanctionRow({ sanction }) {
  const isRetard  = sanction.type?.includes('late')
  const amount    = sanction.penaltyAmount ?? 0
  const hours     = sanction.penaltyHours  ?? null

  return (
    <li className="flex items-center gap-3 px-4 py-3 hover:bg-brand-light transition-colors">
      <div className={`
        w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0
        ${isRetard ? 'bg-amber-100' : 'bg-red-100'}
      `}>
        <AlertTriangle
          size={16}
          className={isRetard ? 'text-status-late' : 'text-status-absent'}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-brand-dark">
            {isRetard ? 'Retard' : 'Absence injustifiée'}
          </p>
          <Badge variant={isRetard ? 'warning' : 'danger'} size="sm">
            {isRetard ? 'Retard' : 'Absence'}
          </Badge>
        </div>
        <p className="text-xs text-brand-gray mt-0.5">
          {formatDate(sanction.date)}
          {hours && ` · ${hours}h déduites`}
        </p>
      </div>

      <p className="text-sm font-bold text-brand-red flex-shrink-0">
        -{amount.toLocaleString('fr-FR')} FCFA
      </p>
    </li>
  )
}