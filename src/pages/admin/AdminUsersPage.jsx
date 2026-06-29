// src/pages/admin/AdminUsersPage.jsx
// ============================================
// Gestion complète des employés (admin)
// Fonctionnalités :
//   - Liste avec recherche et filtres
//   - Créer un employé
//   - Modifier, désactiver, supprimer
//   - Réinitialiser mot de passe
//   - Révoquer appareil
// ============================================

import { useState, useEffect, useCallback } from 'react'
import {
  UserPlus, Search, MoreVertical, Mail,
  KeyRound, Smartphone, Trash2, UserX, RefreshCw, Edit
} from 'lucide-react'
import usersService from '../../services/users.service'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import Spinner from '../../components/ui/Spinner'
import { getInitials, formatRole, formatDate } from '../../utils/formatters'
import toast from 'react-hot-toast'

export default function AdminUsersPage() {
  const [users, setUsers]         = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch]       = useState('')
  const [filterActive, setFilterActive] = useState('all') // all | true | false
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeMenu, setActiveMenu] = useState(null) // id de l'employé dont le menu est ouvert
  const [editUser, setEditUser] = useState(null)

  // --- Chargement des employés ---
  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const filters = {}
      if (search) filters.search = search
      if (filterActive !== 'all') filters.isActive = filterActive
      const data = await usersService.getAll(filters)
      setUsers(Array.isArray(data) ? data : data.users ?? [])
    } catch {
      toast.error('Impossible de charger les employés')
    } finally {
      setIsLoading(false)
    }
  }, [search, filterActive])

  useEffect(() => {
    // Délai pour éviter trop de requêtes pendant la frappe
    const timer = setTimeout(fetchUsers, 300)
    return () => clearTimeout(timer)
  }, [fetchUsers])

  // --- Actions sur un employé ---
  const handleResetPassword = async (user) => {
    if (!confirm(`Réinitialiser le mot de passe de ${user.fullName} ?`)) return
    try {
      await usersService.resetPassword(user._id)
      toast.success('Mot de passe réinitialisé — un email a été envoyé')
    } catch {
      toast.error('Erreur lors de la réinitialisation')
    }
    setActiveMenu(null)
  }

  const handleRevokeDevice = async (user) => {
    if (!confirm(`Révoquer l'appareil de ${user.fullName} ?`)) return
    try {
      await usersService.revokeDevice(user._id)
      toast.success('Appareil révoqué')
    } catch {
      toast.error('Erreur lors de la révocation')
    }
    setActiveMenu(null)
  }

  const handleDeactivate = async (user) => {
    if (!confirm(`Désactiver le compte de ${user.fullName} ?`)) return
    try {
      await usersService.deactivate(user._id)
      toast.success('Compte désactivé')
      fetchUsers()
    } catch {
      toast.error('Erreur lors de la désactivation')
    }
    setActiveMenu(null)
  }

  const handleDelete = async (user) => {
    if (!confirm(`⚠️ Supprimer définitivement ${user.fullName} ? Cette action est irréversible.`)) return
    try {
      await usersService.deletePermanent(user._id)
      toast.success('Employé supprimé définitivement')
      fetchUsers()
    } catch {
      toast.error('Erreur lors de la suppression')
    }
    setActiveMenu(null)
  }

  return (
    <div className="flex flex-col gap-5">

      {/* ==============================
          BARRE D'ACTIONS
          ============================== */}
      <div className="flex flex-col sm:flex-row gap-3">

        {/* Recherche */}
        <div className="flex-1">
          <Input
            placeholder="Rechercher un employé..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            icon={<Search size={16} />}
          />
        </div>

        {/* Bouton créer */}
        <Button
          onClick={() => setShowCreateModal(true)}
          className="shrink-0"
        >
          <UserPlus size={16} />
          Nouvel employé
        </Button>
      </div>

      {/* Filtres statut */}
      <div className="flex gap-2">
        {[
          { value: 'all',   label: 'Tous'      },
          { value: 'true',  label: 'Actifs'    },
          { value: 'false', label: 'Inactifs'  },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilterActive(f.value)}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200
              ${filterActive === f.value
                ? 'bg-brand-black text-white'
                : 'bg-white border border-brand-border text-brand-gray hover:bg-brand-light'
              }
            `}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ==============================
          LISTE DES EMPLOYÉS
          ============================== */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : users.length === 0 ? (
        <Card padding="lg">
          <div className="flex flex-col items-center gap-2 py-8">
            <Search size={32} className="text-brand-border" />
            <p className="text-sm text-brand-gray">Aucun employé trouvé</p>
          </div>
        </Card>
      ) : (
        <Card padding="none">
          <ul className="divide-y divide-brand-border">
            {users.map(user => (
              <UserRow
                key={user._id}
                user={user}
                isMenuOpen={activeMenu === user._id}
                onMenuToggle={() => setActiveMenu(activeMenu === user._id ? null : user._id)}
                onEdit={() => { setEditUser(user); setActiveMenu(null) }}
                onResetPassword={() => handleResetPassword(user)}
                onRevokeDevice={() => handleRevokeDevice(user)}
                onDeactivate={() => handleDeactivate(user)}
                onDelete={() => handleDelete(user)}
              />
            ))}
          </ul>
        </Card>
      )}

      {/* Modal création */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => { setShowCreateModal(false); fetchUsers() }}
        />
      )}

     {/* Modal édition */}
       {editUser && (
       <EditUserModal
       user={editUser}
       onClose={() => setEditUser(null)}
       onSuccess={() => { setEditUser(null); fetchUsers() }}
      />
     )}

      {/* Ferme le menu si on clique ailleurs */}
      {activeMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setActiveMenu(null)}
        />
      )}
    </div>
  )
}

// ============================================
// COMPOSANT : Ligne d'un employé
// ============================================
function UserRow({ user, isMenuOpen, onMenuToggle, onResetPassword, onRevokeDevice, onDeactivate, onDelete , onEdit,}) {
  return (
    <li className="flex items-center gap-3 px-4 py-3 hover:bg-brand-light transition-colors duration-150">

      {/* Avatar */}
      <div className={`
        w-10 h-10 rounded-full text-white text-sm font-bold
        flex items-center justify-center flex-shrink-0
        ${user.isActive ? 'bg-brand-black' : 'bg-brand-gray'}
      `}>
        {getInitials(user.fullName)}
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-brand-dark truncate">
            {user.fullName}
          </p>
          {!user.isActive && (
            <Badge variant="default" size="sm">Inactif</Badge>
          )}
        </div>
        <p className="text-xs text-brand-gray truncate">{user.email}</p>
      </div>

      {/* Rôle */}
      <div className="hidden sm:block flex-shrink-0">
        <Badge variant={user.role === 'admin' ? 'dark' : 'default'}>
          {formatRole(user.role)}
        </Badge>
      </div>

      {/* Menu actions */}
      <div className="relative flex-shrink-0">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg text-brand-gray hover:bg-brand-border transition-colors duration-200"
        >
          <MoreVertical size={16} />
        </button>

        {/* Dropdown menu */}
        {isMenuOpen && (
          <div className="
            absolute right-0 top-10 z-20
            bg-white border border-brand-border rounded-xl
            shadow-[var(--shadow-modal)] py-1
            min-w-[200px]
          ">
            <MenuAction icon={<Edit size={14} />}          label="Modifier"                   onClick={onEdit}          />
            <MenuAction icon={<KeyRound size={14} />}    label="Réinitialiser mot de passe" onClick={onResetPassword} />
            <MenuAction icon={<Smartphone size={14} />}  label="Révoquer l'appareil"        onClick={onRevokeDevice}  />
            <MenuAction icon={<UserX size={14} />}       label="Désactiver le compte"       onClick={onDeactivate}    />
            <div className="border-t border-brand-border my-1" />
            <MenuAction icon={<Trash2 size={14} />}      label="Supprimer définitivement"   onClick={onDelete} danger />
          </div>
        )}
      </div>
    </li>
  )
}

// Ligne du menu dropdown
function MenuAction({ icon, label, onClick, danger = false }) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-4 py-2.5 text-sm
        transition-colors duration-150
        ${danger
          ? 'text-brand-red hover:bg-red-50'
          : 'text-brand-dark hover:bg-brand-light'
        }
      `}
    >
      {icon}
      {label}
    </button>
  )
}

// ============================================
// MODAL : Créer un employé
// ============================================
// ============================================
// MODAL : Créer un employé
// Le scheduleId est récupéré automatiquement
// depuis les employés existants — tous partagent
// le même planning défini par l'admin
// ============================================
function CreateUserModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    fullName: '',
    email:    '',
    role:     'user',
  })
  const [scheduleId, setScheduleId]   = useState(null)
  const [scheduleName, setScheduleName] = useState(null)
  const [isLoading, setIsLoading]     = useState(false)
  const [isFetching, setIsFetching]   = useState(true)
  const [error, setError]             = useState('')

  const update = (field) => (e) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  // --- Récupère le scheduleId depuis les employés existants ---
  // Tous les employés partagent le même planning configuré par l'admin
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const data = await usersService.getAll()
        const users = Array.isArray(data) ? data : data.users ?? []

        // Cherche le premier employé qui a un scheduleId
        const userWithSchedule = users.find(u => u.scheduleId?._id)

        if (userWithSchedule) {
          setScheduleId(userWithSchedule.scheduleId._id)
          setScheduleName(
            `${userWithSchedule.scheduleId.name} · ${userWithSchedule.scheduleId.arrivalTime} → ${userWithSchedule.scheduleId.departureTime}`
          )
        }
      } catch {
        // Si pas de planning trouvé on continue sans
      } finally {
        setIsFetching(false)
      }
    }
    fetchSchedule()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!scheduleId) {
      setError('Aucun planning trouvé. Configurez d\'abord un planning dans les paramètres.')
      return
    }

    setIsLoading(true)
    try {
      const payload = {
        fullName:   form.fullName,
        email:      form.email,
        role:       form.role,
        scheduleId: scheduleId, // ID du planning récupéré automatiquement
      }
      await usersService.create(payload)
      toast.success(`${form.fullName} a été créé — un email de bienvenue a été envoyé`)
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Erreur lors de la création')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
    {/* Fond sombre — stopPropagation évite le crash DOM */}
<div
  className="fixed inset-0 bg-black bg-opacity-50 z-40"
  onMouseDown={(e) => {
    if (e.target === e.currentTarget) onClose()
  }}
/>

      {/* Modal */}
      <div className="
        fixed inset-x-4 top-1/2 -translate-y-1/2 z-50
        bg-white rounded-2xl p-6
        shadow-[var(--shadow-modal)]
        max-w-md mx-auto
      ">
        <h3 className="text-base font-bold text-brand-dark mb-5">
          Nouvel employé
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <Input
            label="Nom complet"
            value={form.fullName}
            onChange={update('fullName')}
            placeholder="Jean Dupont"
            required
          />

          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={update('email')}
            placeholder="jean@exemple.com"
            required
          />

          {/* Rôle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-brand-dark">Rôle</label>
            <select
              value={form.role}
              onChange={update('role')}
              className="
                w-full rounded-lg border border-brand-border
                px-4 py-2.5 text-sm text-brand-dark bg-white
                focus:outline-none focus:ring-2 focus:ring-brand-red
              "
            >
              <option value="user">Employé</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>

          {/* Planning assigné automatiquement */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-brand-dark">
              Planning de travail
            </label>
            <div className="
              w-full rounded-lg border border-brand-border
              px-4 py-2.5 text-sm bg-brand-light
              flex items-center justify-between
            ">
              {isFetching ? (
                <span className="text-brand-gray">Chargement...</span>
              ) : scheduleName ? (
                <>
                  <span className="text-brand-dark">{scheduleName}</span>
                  <span className="text-xs text-status-present font-medium">
                    ✓ Auto
                  </span>
                </>
              ) : (
                <span className="text-brand-red text-xs">
                  ⚠ Aucun planning trouvé — configurez les paramètres d'abord
                </span>
              )}
            </div>
            <p className="text-xs text-brand-gray">
              Planning assigné automatiquement depuis la configuration
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-sm text-brand-red">{error}</p>
            </div>
          )}

          <div className="flex gap-3 mt-2">
            <Button variant="outline" fullWidth onClick={onClose} type="button">
              Annuler
            </Button>
            <Button
              type="submit"
              fullWidth
              isLoading={isLoading || isFetching}
              disabled={!scheduleId}
            >
              Créer l'employé
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}

// ============================================
// MODAL : Modifier un employé
// ============================================
function EditUserModal({ user, onClose, onSuccess }) {
  const [form, setForm] = useState({
    fullName:   user.fullName   ?? '',
    email:      user.email      ?? '',
    scheduleId: user.scheduleId ?? '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]         = useState('')

  const update = (field) => (e) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      await usersService.update(user._id, form)
      toast.success(`${form.fullName} a été mis à jour`)
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Erreur lors de la modification')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Fond sombre */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
      />

      {/* Modal */}
      <div className="
        fixed inset-x-4 top-1/2 -translate-y-1/2 z-50
        bg-white rounded-2xl p-6
        shadow-[var(--shadow-modal)]
        max-w-md mx-auto
      ">
        <h3 className="text-base font-bold text-brand-dark mb-1">
          Modifier l'employé
        </h3>
        <p className="text-sm text-brand-gray mb-5">
          {user.email}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Nom complet"
            value={form.fullName}
            onChange={update('fullName')}
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={update('email')}
            required
          />
          <Input
            label="ID Planning"
            value={form.scheduleId}
            onChange={update('scheduleId')}
            hint="Identifiant du planning de travail"
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-sm text-brand-red">{error}</p>
            </div>
          )}

          <div className="flex gap-3 mt-2">
            <Button variant="outline" fullWidth onClick={onClose} type="button">
              Annuler
            </Button>
            <Button type="submit" fullWidth isLoading={isLoading}>
              Enregistrer
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}