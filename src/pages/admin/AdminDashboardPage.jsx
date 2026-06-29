// src/pages/admin/AdminDashboardPage.jsx
// ============================================
// Dashboard principal de l'administrateur
// Affiche en temps réel :
//   - Les statistiques de présence du jour
//   - La liste des employés avec leur statut
// Données fraîches toutes les 60 secondes
// ============================================

import { useState, useEffect, useCallback } from 'react'
import { Users, UserCheck, UserX, Clock, RefreshCw } from 'lucide-react'
import usersService from '../../services/users.service'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import { getInitials, formatTime, formatRole } from '../../utils/formatters'

export default function AdminDashboardPage() {
  // --- État des données ---
  const [stats, setStats]       = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError]       = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)

  // ============================================
  // Chargement des statistiques
  // useCallback évite de recréer la fonction à chaque render
  // ============================================
  const fetchStats = useCallback(async (isManual = false) => {
    // Si c'est un refresh manuel → petit spinner discret
    // Si c'est le premier chargement → grand spinner
    if (isManual) {
      setIsRefreshing(true)
    }

    try {
      const data = await usersService.getStats()
      setStats(data)
      setLastUpdate(new Date())
      setError(null)
    } catch (err) {
      setError('Impossible de charger les statistiques')
      console.error('Dashboard stats error:', err)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  // Chargement initial + rafraîchissement toutes les 60 secondes
  useEffect(() => {
    fetchStats()
    const interval = setInterval(() => fetchStats(), 60000)
    return () => clearInterval(interval) // Nettoyage quand on quitte la page
  }, [fetchStats])

  // ============================================
  // ÉTATS D'AFFICHAGE
  // ============================================

  // Premier chargement
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  // Erreur
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-brand-gray">{error}</p>
        <button
          onClick={() => fetchStats(true)}
          className="text-sm text-brand-red underline"
        >
          Réessayer
        </button>
      </div>
    )
  }

  // ============================================
  // DONNÉES CALCULÉES
  // On adapte selon la structure réelle de ton API
  // ============================================
const totalEmployees = stats?.totalEmployes ?? 0
const present        = stats?.presents      ?? 0
const absent         = stats?.absents       ?? 0
const late           = stats?.enRetard      ?? 0
const logs           = stats?.logs          ?? []

  return (
    <div className="flex flex-col gap-6">

      {/* ==============================
          EN-TÊTE avec date + refresh
          ============================== */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-brand-dark">
            {new Date().toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </h2>
          {lastUpdate && (
            <p className="text-xs text-brand-gray mt-0.5">
              Mis à jour à {lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>

        {/* Bouton refresh manuel */}
        <button
          onClick={() => fetchStats(true)}
          disabled={isRefreshing}
          className="
            flex items-center gap-2 px-3 py-2
            text-sm text-brand-gray
            border border-brand-border rounded-lg
            hover:bg-brand-light transition-colors duration-200
            disabled:opacity-50
          "
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {/* ==============================
          CARTES DE STATISTIQUES
          Grille 2x2 sur mobile, 4 colonnes sur desktop
          ============================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Total employés"
          value={totalEmployees}
          icon={<Users size={18} />}
          variant="default"
        />
        <StatCard
          title="Présents"
          value={present}
          total={totalEmployees}
          icon={<UserCheck size={18} />}
          variant="success"
        />
        <StatCard
          title="Absents"
          value={absent}
          total={totalEmployees}
          icon={<UserX size={18} />}
          variant="danger"
        />
        <StatCard
          title="En retard"
          value={late}
          total={totalEmployees}
          icon={<Clock size={18} />}
          variant="warning"
        />
      </div>

      {/* ==============================
          BARRE DE PROGRESSION
          Visualisation rapide du taux de présence
          ============================== */}
      {totalEmployees > 0 && (
        <Card padding="md">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-brand-dark">
              Taux de présence
            </p>
            <p className="text-sm font-bold text-brand-dark">
              {Math.round((present / totalEmployees) * 100)}%
            </p>
          </div>
          <div className="w-full bg-brand-light rounded-full h-2.5">
            <div
              className="bg-brand-red h-2.5 rounded-full transition-all duration-700"
              style={{ width: `${(present / totalEmployees) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-xs text-brand-gray">{present} présents</span>
            <span className="text-xs text-brand-gray">{totalEmployees} total</span>
          </div>
        </Card>
      )}

      {/* ==============================
          LISTE DES PRÉSENCES DU JOUR
          ============================== */}
      <Card padding="none">

        {/* En-tête de la liste */}
        <div className="px-4 py-3 border-b border-brand-border">
          <h3 className="text-sm font-semibold text-brand-dark">
            Présences du jour
          </h3>
        </div>

        {/* Liste vide */}
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Users size={32} className="text-brand-border" />
            <p className="text-sm text-brand-gray">
              Aucune présence enregistrée aujourd'hui
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-brand-border">
            {logs.map((log, index) => (
              <EmployeeRow key={log.id ?? index} log={log} />
            ))}
          </ul>
        )}
      </Card>

    </div>
  )
}

// ============================================
// COMPOSANT INTERNE : Ligne d'un employé
// Séparé pour garder le code lisible
// ============================================
function EmployeeRow({ log }) {

  // Détermine le badge de statut
  const getStatusBadge = () => {
    if (log.status === 'present')  return <Badge variant="success" dot>Présent</Badge>
    if (log.status === 'absent')   return <Badge variant="danger"  dot>Absent</Badge>
    if (log.status === 'late')     return <Badge variant="warning" dot>En retard</Badge>
    if (log.checkIn && !log.checkOut) return <Badge variant="success" dot>En cours</Badge>
    if (log.checkOut)              return <Badge variant="default" dot>Parti</Badge>
    return <Badge variant="default">—</Badge>
  }

  return (
    <li className="flex items-center gap-3 px-4 py-3 hover:bg-brand-light transition-colors duration-150">

      {/* Avatar avec initiales */}
      <div className="
        w-9 h-9 rounded-full
        bg-brand-black text-white
        text-xs font-bold
        flex items-center justify-center
        flex-shrink-0
      ">
        {getInitials(log.user?.fullName ?? log.fullName ?? '?')}
      </div>

      {/* Nom + rôle */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-brand-dark truncate">
          {log.user?.fullName ?? log.fullName ?? 'Employé inconnu'}
        </p>
        <p className="text-xs text-brand-gray">
          {formatRole(log.user?.role ?? log.role ?? 'user')}
        </p>
      </div>

      {/* Heures d'arrivée et départ */}
      <div className="text-right flex-shrink-0">
        {log.checkIn && (
          <p className="text-xs text-brand-dark font-medium">
            ↑ {formatTime(log.checkIn)}
          </p>
        )}
        {log.checkOut && (
          <p className="text-xs text-brand-gray">
            ↓ {formatTime(log.checkOut)}
          </p>
        )}
      </div>

      {/* Badge statut */}
      <div className="flex-shrink-0">
        {getStatusBadge()}
      </div>

    </li>
  )
}