// src/pages/user/UserAttendancePage.jsx
// ============================================
// Historique complet des présences de l'employé
// Filtres par date + pagination
// ============================================

import { useState, useEffect, useCallback } from 'react'
import { Clock, Filter } from 'lucide-react'
import attendanceService from '../../services/attendance.service'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import { formatDate, formatTime } from '../../utils/formatters'
import toast from 'react-hot-toast'

export default function UserAttendancePage() {
  const [logs, setLogs]           = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters]     = useState({
    from: '', to: '', page: 1, limit: 15
  })

  const fetchLogs = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = { ...filters }
      if (!params.from) delete params.from
      if (!params.to)   delete params.to
      const data = await attendanceService.getMyAttendance(params)
      setLogs(Array.isArray(data) ? data : data.logs ?? data.attendance ?? [])
    } catch {
      toast.error('Impossible de charger les présences')
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const updateFilter = (key) => (e) =>
    setFilters(f => ({ ...f, [key]: e.target.value, page: 1 }))

  return (
    <div className="flex flex-col gap-5">

      {/* Filtres dates */}
      <Card padding="md">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-brand-gray uppercase tracking-wide">Du</label>
            <input
              type="date"
              value={filters.from}
              onChange={updateFilter('from')}
              className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm text-brand-dark bg-white focus:outline-none focus:ring-2 focus:ring-brand-red"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-brand-gray uppercase tracking-wide">Au</label>
            <input
              type="date"
              value={filters.to}
              onChange={updateFilter('to')}
              className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm text-brand-dark bg-white focus:outline-none focus:ring-2 focus:ring-brand-red"
            />
          </div>
        </div>
      </Card>

      {/* Liste */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : logs.length === 0 ? (
        <Card padding="lg">
          <div className="flex flex-col items-center gap-2 py-8">
            <Clock size={32} className="text-brand-border" />
            <p className="text-sm text-brand-gray">Aucun pointage trouvé</p>
          </div>
        </Card>
      ) : (
        <Card padding="none">
          <ul className="divide-y divide-brand-border">
            {logs.map((log, i) => (
              <li key={log.id ?? i} className="flex items-center gap-3 px-4 py-3 hover:bg-brand-light transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-brand-dark">
                    {formatDate(log.date ?? log.createdAt)}
                  </p>
                  <p className="text-xs text-brand-gray mt-0.5">
                    {log.checkIn  ? `Arrivée : ${formatTime(log.checkIn)}`  : 'Pas de pointage arrivée'}
                    {log.checkOut ? ` · Départ : ${formatTime(log.checkOut)}` : ''}
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

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-brand-border">
            <button
              onClick={() => setFilters(f => ({ ...f, page: Math.max(1, f.page - 1) }))}
              disabled={filters.page === 1}
              className="text-sm text-brand-gray hover:text-brand-dark disabled:opacity-40"
            >
              ← Précédent
            </button>
            <span className="text-sm text-brand-gray">Page {filters.page}</span>
            <button
              onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
              disabled={logs.length < filters.limit}
              className="text-sm text-brand-gray hover:text-brand-dark disabled:opacity-40"
            >
              Suivant →
            </button>
          </div>
        </Card>
      )}
    </div>
  )
}