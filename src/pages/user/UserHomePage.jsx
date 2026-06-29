// src/pages/user/UserHomePage.jsx
// ============================================
// Accueil de l'employé
// Affiche le statut du jour + historique récent
// ============================================

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, CheckCircle, XCircle, AlertCircle, Camera  } from 'lucide-react'
import attendanceService from '../../services/attendance.service'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import { useAuth } from '../../context/AuthContext'
import { formatTime, formatDate, formatTimeAgo } from '../../utils/formatters'
import toast from 'react-hot-toast'

export default function UserHomePage() {
  const { user }                  = useAuth()
  const [logs, setLogs]           = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [todayLog, setTodayLog]   = useState(null)
  const navigate                  = useNavigate()

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const data = await attendanceService.getMyAttendance({ limit: 10 })
        const list = Array.isArray(data) ? data : data.logs ?? data.attendance ?? []
        setLogs(list)

        // Cherche le log d'aujourd'hui
        const today = new Date().toISOString().split('T')[0]
        const todayEntry = list.find(l => {
          const logDate = (l.date ?? l.createdAt ?? '').split('T')[0]
          return logDate === today
        })
        setTodayLog(todayEntry ?? null)
      } catch {
        toast.error('Impossible de charger vos présences')
      } finally {
        setIsLoading(false)
      }
    }
    fetchAttendance()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Bonjour */}
      <div>
        <h2 className="text-lg font-bold text-brand-dark">
          Bonjour, {user?.fullName?.split(' ')[0]} 👋
        </h2>
        <p className="text-sm text-brand-gray">
          {new Date().toLocaleDateString('fr-FR', {
            weekday: 'long', day: 'numeric', month: 'long'
          })}
        </p>
      </div>

      <button
          onClick={() => navigate('/scan')}
           className="
           w-full flex items-center justify-center gap-3
           py-4 rounded-2xl
           bg-brand-red text-white
           font-semibold text-base
          active:scale-95 transition-all duration-200
           "
      >

        <Camera size={22} />
        Scanner le QR Code
      </button>

      {/* ==============================
          STATUT DU JOUR
          ============================== */}
      <Card padding="md">
        <h3 className="text-sm font-semibold text-brand-dark mb-3">
          Votre statut aujourd'hui
        </h3>

        {todayLog ? (
          <div className="flex flex-col gap-3">

            {/* Badge statut */}
            <div className="flex items-center gap-3">
              {todayLog.status === 'present' && <CheckCircle size={32} className="text-status-present" />}
              {todayLog.status === 'late'    && <AlertCircle size={32} className="text-status-late"    />}
              {todayLog.status === 'absent'  && <XCircle     size={32} className="text-status-absent"  />}
              {!todayLog.status              && <Clock       size={32} className="text-brand-gray"     />}

              <div>
                <Badge
                  variant={
                    todayLog.status === 'present' ? 'success' :
                    todayLog.status === 'late'    ? 'warning' :
                    todayLog.status === 'absent'  ? 'danger'  : 'default'
                  }
                  dot
                >
                  {todayLog.status === 'present' ? 'Présent'   :
                   todayLog.status === 'late'    ? 'En retard' :
                   todayLog.status === 'absent'  ? 'Absent'    : 'En cours'}
                </Badge>
                <p className="text-xs text-brand-gray mt-0.5">
                  Mis à jour {formatTimeAgo(todayLog.updatedAt ?? todayLog.createdAt)}
                </p>
              </div>
            </div>

            {/* Heures */}
            <div className="grid grid-cols-2 gap-3 mt-1">
              <div className="bg-brand-light rounded-lg px-3 py-2.5">
                <p className="text-xs text-brand-gray mb-0.5">Arrivée</p>
                <p className="text-sm font-bold text-brand-dark">
                  {todayLog.checkIn ? formatTime(todayLog.checkIn) : '—'}
                </p>
              </div>
              <div className="bg-brand-light rounded-lg px-3 py-2.5">
                <p className="text-xs text-brand-gray mb-0.5">Départ</p>
                <p className="text-sm font-bold text-brand-dark">
                  {todayLog.checkOut ? formatTime(todayLog.checkOut) : '—'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 py-2">
            <Clock size={28} className="text-brand-gray" />
            <div>
              <p className="text-sm font-medium text-brand-dark">
                Pas encore pointé
              </p>
              <p className="text-xs text-brand-gray">
                Scannez le QR code pour enregistrer votre arrivée
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* ==============================
          HISTORIQUE RÉCENT
          ============================== */}
      <Card padding="none">
        <div className="px-4 py-3 border-b border-brand-border">
          <h3 className="text-sm font-semibold text-brand-dark">
            Historique récent
          </h3>
        </div>

        {logs.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10">
            <Clock size={28} className="text-brand-border" />
            <p className="text-sm text-brand-gray">Aucun pointage enregistré</p>
          </div>
        ) : (
          <ul className="divide-y divide-brand-border">
            {logs.slice(0, 7).map((log, i) => (
              <li key={log.id ?? i} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-brand-dark">
                    {formatDate(log.date ?? log.createdAt)}
                  </p>
                  <p className="text-xs text-brand-gray">
                    {log.checkIn ? `↑ ${formatTime(log.checkIn)}` : ''}
                    {log.checkOut ? `  ↓ ${formatTime(log.checkOut)}` : ''}
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
        )}
      </Card>
    </div>
  )
}