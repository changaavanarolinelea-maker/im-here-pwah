// src/pages/admin/AdminSanctionsPage.jsx
// ============================================
// Vue admin des sanctions — tous les employés
// Deux onglets :
//   - Sanctions : qui doit combien
//   - Logs de présence : historique pointages
// ============================================

import { useState, useEffect, useCallback } from 'react'
import { AlertTriangle, Clock, TrendingDown } from 'lucide-react'
import sanctionsService from '../../services/sanctions.service'
import attendanceService from '../../services/attendance.service'
import usersService from '../../services/users.service'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import { getInitials, formatDate, formatTime } from '../../utils/formatters'
import toast from 'react-hot-toast'

export default function AdminSanctionsPage() {
  const [activeTab, setActiveTab] = useState('sanctions')

  return (
    <div className="flex flex-col gap-5">

      {/* Onglets */}
      <div className="flex gap-1 bg-brand-light p-1 rounded-xl w-fit">
        {[
          { value: 'sanctions', label: 'Sanctions',      icon: AlertTriangle },
          { value: 'logs',      label: 'Logs présence',  icon: Clock         },
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
              transition-all duration-200
              ${activeTab === tab.value
                ? 'bg-white text-brand-dark shadow-sm'
                : 'text-brand-gray hover:text-brand-dark'
              }
            `}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu selon l'onglet actif */}
      {activeTab === 'sanctions' ? (
        <SanctionsTab />
      ) : (
        <LogsTab />
      )}
    </div>
  )
}

// ============================================
// ONGLET SANCTIONS
// ============================================
function SanctionsTab() {
  const [sanctions, setSanctions] = useState([])
  const [users, setUsers]         = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalPenalty, setTotalPenalty] = useState(0)
  const [filters, setFilters]     = useState({
    month:  new Date().getMonth() + 1,
    year:   new Date().getFullYear(),
    userId: '',
    type:   '',
  })

  const months = [
    { value: 1, label: 'Janvier' }, { value: 2, label: 'Février' },
    { value: 3, label: 'Mars'    }, { value: 4, label: 'Avril'   },
    { value: 5, label: 'Mai'     }, { value: 6, label: 'Juin'    },
    { value: 7, label: 'Juillet' }, { value: 8, label: 'Août'    },
    { value: 9, label: 'Septembre' }, { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' }, { value: 12, label: 'Décembre' },
  ]

  const currentYear = new Date().getFullYear()
  const years = [currentYear, currentYear - 1, currentYear - 2]

  // Charge la liste des employés pour le filtre
  useEffect(() => {
    usersService.getAll().then(data => {
      setUsers(Array.isArray(data) ? data : data.users ?? [])
    }).catch(() => {})
  }, [])

 const fetchSanctions = useCallback(async () => {
  setIsLoading(true)
  try {
    const params = { ...filters }
    if (!params.userId) delete params.userId
    if (!params.type)   delete params.type
    const data = await sanctionsService.getAll(params)

    // Ton API retourne { total, totalPenalty, sanctions: [...] }
    setSanctions(data.sanctions ?? [])
    setTotalPenalty(data.totalPenalty ?? 0) // Total global depuis l'API
  } catch {
    toast.error('Impossible de charger les sanctions')
  } finally {
    setIsLoading(false)
  }
}, [filters])

  useEffect(() => { fetchSanctions() }, [fetchSanctions])

  // Total global du mois
  const totalAmount = sanctions.reduce((sum, s) => sum + (s.amount ?? s.montant ?? 0), 0)

  return (
    <div className="flex flex-col gap-4">

      {/* Filtres */}
      <Card padding="md">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

          {/* Mois */}
          <select
            value={filters.month}
            onChange={e => setFilters(f => ({ ...f, month: Number(e.target.value) }))}
            className="rounded-lg border border-brand-border px-3 py-2 text-sm text-brand-dark bg-white focus:outline-none focus:ring-2 focus:ring-brand-red"
          >
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>

          {/* Année */}
          <select
            value={filters.year}
            onChange={e => setFilters(f => ({ ...f, year: Number(e.target.value) }))}
            className="rounded-lg border border-brand-border px-3 py-2 text-sm text-brand-dark bg-white focus:outline-none focus:ring-2 focus:ring-brand-red"
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          {/* Employé */}
          <select
            value={filters.userId}
            onChange={e => setFilters(f => ({ ...f, userId: e.target.value }))}
            className="rounded-lg border border-brand-border px-3 py-2 text-sm text-brand-dark bg-white focus:outline-none focus:ring-2 focus:ring-brand-red"
          >
            <option value="">Tous les employés</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.fullName}</option>
            ))}
          </select>

          {/* Type */}
          <select
            value={filters.type}
            onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}
            className="rounded-lg border border-brand-border px-3 py-2 text-sm text-brand-dark bg-white focus:outline-none focus:ring-2 focus:ring-brand-red"
          >
            <option value="">Tous les types</option>
            <option value="late">Retard</option>
            <option value="absent">Absence</option>
          </select>
        </div>
      </Card>

      {/* Total global */}
     {!isLoading && sanctions.length > 0 && (
  <div className="rounded-xl p-4 bg-brand-black flex items-center justify-between">
    <div>
      <p className="text-white text-opacity-60 text-xs uppercase tracking-wide mb-1">
        Total pénalités — {months.find(m => m.value === filters.month)?.label} {filters.year}
      </p>
      <p className="text-white text-2xl font-bold">
        {totalPenalty.toLocaleString('fr-FR')} FCFA
      </p>
      <p className="text-white text-opacity-40 text-xs mt-0.5">
        {sanctions.length} sanction{sanctions.length > 1 ? 's' : ''}
      </p>
    </div>
    <TrendingDown size={32} className="text-white opacity-20" />
  </div>
)}
      {/* Liste */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : sanctions.length === 0 ? (
        <Card padding="lg">
          <div className="flex flex-col items-center gap-2 py-8">
            <AlertTriangle size={32} className="text-brand-border" />
            <p className="text-sm text-brand-gray">Aucune sanction trouvée</p>
          </div>
        </Card>
      ) : (
        <Card padding="none">
          <ul className="divide-y divide-brand-border">
          {sanctions.map((sanction, i) => {
  const isRetard  = sanction.type?.includes('late')
  const isAbsence = sanction.type?.includes('absent')
  const amount    = sanction.penaltyAmount ?? 0
  const hours     = sanction.penaltyHours  ?? null

  return (
    <li key={sanction._id ?? i} className="flex items-center gap-3 px-4 py-3 hover:bg-brand-light transition-colors">

      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-brand-black text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
        {getInitials(sanction.userId?.fullName ?? '?')}
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-brand-dark truncate">
          {sanction.userId?.fullName ?? 'Employé'}
        </p>
        <p className="text-xs text-brand-gray">
          {formatDate(sanction.date)}
          {hours && ` · ${hours}h de déduction`}
        </p>
      </div>

      {/* Type */}
      <Badge variant={isRetard ? 'warning' : 'danger'} size="sm">
        {isRetard ? 'Retard' : 'Absence'}
      </Badge>

      {/* Montant */}
      <p className="text-sm font-bold text-brand-red flex-shrink-0">
        -{amount.toLocaleString('fr-FR')} FCFA
      </p>
    </li>
  )
})}
          </ul>
        </Card>
      )}
    </div>
  )
}

// ============================================
// ONGLET LOGS DE PRÉSENCE
// ============================================
function LogsTab() {
  const [logs, setLogs]           = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters]     = useState({
    from: '', to: '', status: '', page: 1, limit: 20
  })

  const fetchLogs = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = { ...filters }
      if (!params.from)   delete params.from
      if (!params.to)     delete params.to
      if (!params.status) delete params.status
      const data = await attendanceService.getAdminLogs(params)
      setLogs(Array.isArray(data) ? data : data.logs ?? data.attendance ?? [])
    } catch {
      toast.error('Impossible de charger les logs')
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  return (
    <div className="flex flex-col gap-4">

      {/* Filtres */}
      <Card padding="md">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-brand-gray uppercase tracking-wide">Du</label>
            <input type="date" value={filters.from}
              onChange={e => setFilters(f => ({ ...f, from: e.target.value, page: 1 }))}
              className="rounded-lg border border-brand-border px-3 py-2 text-sm text-brand-dark bg-white focus:outline-none focus:ring-2 focus:ring-brand-red"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-brand-gray uppercase tracking-wide">Au</label>
            <input type="date" value={filters.to}
              onChange={e => setFilters(f => ({ ...f, to: e.target.value, page: 1 }))}
              className="rounded-lg border border-brand-border px-3 py-2 text-sm text-brand-dark bg-white focus:outline-none focus:ring-2 focus:ring-brand-red"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-brand-gray uppercase tracking-wide">Statut</label>
            <select value={filters.status}
              onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}
              className="rounded-lg border border-brand-border px-3 py-2 text-sm text-brand-dark bg-white focus:outline-none focus:ring-2 focus:ring-brand-red"
            >
              <option value="">Tous</option>
              <option value="present">Présent</option>
              <option value="absent">Absent</option>
              <option value="late">En retard</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Liste logs */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : logs.length === 0 ? (
        <Card padding="lg">
          <div className="flex flex-col items-center gap-2 py-8">
            <Clock size={32} className="text-brand-border" />
            <p className="text-sm text-brand-gray">Aucun log trouvé</p>
          </div>
        </Card>
      ) : (
        <Card padding="none">
          <ul className="divide-y divide-brand-border">
            {logs.map((log, i) => (
              <li key={log.id ?? i} className="flex items-center gap-3 px-4 py-3 hover:bg-brand-light transition-colors">
                <div className="w-9 h-9 rounded-full bg-brand-black text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {getInitials(log.user?.fullName ?? log.fullName ?? '?')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-brand-dark truncate">
                    {log.user?.fullName ?? log.fullName ?? 'Employé'}
                  </p>
                  <p className="text-xs text-brand-gray">
                    {formatDate(log.date ?? log.createdAt)}
                    {log.checkIn  ? ` · ↑ ${formatTime(log.checkIn)}`  : ''}
                    {log.checkOut ? ` · ↓ ${formatTime(log.checkOut)}` : ''}
                  </p>
                </div>
                <Badge
                  variant={
                    log.status === 'present' ? 'success' :
                    log.status === 'absent'  ? 'danger'  :
                    log.status === 'late'    ? 'warning' : 'default'
                  }
                  dot
                >
                  {log.status === 'present' ? 'Présent'   :
                   log.status === 'absent'  ? 'Absent'    :
                   log.status === 'late'    ? 'En retard' : '—'}
                </Badge>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between px-4 py-3 border-t border-brand-border">
            <button onClick={() => setFilters(f => ({ ...f, page: Math.max(1, f.page - 1) }))}
              disabled={filters.page === 1}
              className="text-sm text-brand-gray hover:text-brand-dark disabled:opacity-40">
              ← Précédent
            </button>
            <span className="text-sm text-brand-gray">Page {filters.page}</span>
            <button onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
              disabled={logs.length < filters.limit}
              className="text-sm text-brand-gray hover:text-brand-dark disabled:opacity-40">
              Suivant →
            </button>
          </div>
        </Card>
      )}
    </div>
  )
}