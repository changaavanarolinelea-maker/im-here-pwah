// src/pages/user/ProfilePage.jsx
// ============================================
// Page profil — accessible aux deux rôles
// Fonctionnalités :
//   - Infos utilisateur connecté
//   - Changer mot de passe
//   - Switch de rôle (admin uniquement)
//     Permet à l'admin de tester l'app
//     comme un employé sans compte séparé
// ============================================

import { useState } from 'react'
import { User, Mail, Shield, KeyRound, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import authService from '../../services/auth.service'
import api from '../../services/api'
import { clearAuthTokens } from '../../services/api'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import { getInitials, formatRole } from '../../utils/formatters'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, logout }              = useAuth()
  const navigate                      = useNavigate()
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)
  const [form, setForm]               = useState({
    currentPassword: '',
    newPassword:     '',
    confirmPassword: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]         = useState('')

  const update = (field) => (e) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  // --- Changer mot de passe ---
  const handleChangePassword = async (e) => {
    e.preventDefault()
    setError('')

    if (form.newPassword !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    if (form.newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setIsLoading(true)
    try {
      await authService.changePassword(form.currentPassword, form.newPassword)
      toast.success('Mot de passe mis à jour')
      setShowChangePassword(false)
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setError(err.response?.data?.message ?? 'Erreur lors du changement')
    } finally {
      setIsLoading(false)
    }
  }

  // --- Switch de rôle (admin uniquement) ---
  // Génère un nouveau token avec le rôle cible
  // Redirige vers login pour recharger proprement
  const handleSwitch = async (targetRole) => {
    if (!confirm(
      targetRole === 'user'
        ? 'Passer en mode Employé ? Vous serez redirigé vers l\'interface employé.'
        : 'Repasser en mode Admin ? Vous serez redirigé vers le login.'
    )) return

    setIsSwitching(true)
    try {
      await api.post('/auth/switch', { targetRole })
      toast.success(
        targetRole === 'user'
          ? 'Mode employé activé'
          : 'Retour en mode admin'
      )
      // Déconnexion propre → le nouvel token sera
      // demandé à la prochaine connexion
      await logout()
      navigate('/login', { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Erreur lors du switch')
    } finally {
      setIsSwitching(false)
    }
  }

  const isAdmin = user?.role === 'admin'

  return (
    <div className="flex flex-col gap-5 max-w-md">

      {/* ==============================
          CARTE PROFIL
          ============================== */}
      <Card padding="lg">
        <div className="flex flex-col items-center gap-4">

          {/* Avatar */}
          <div className="
            w-20 h-20 rounded-full
            bg-brand-black text-white
            text-2xl font-bold
            flex items-center justify-center
          ">
            {getInitials(user?.fullName)}
          </div>

          {/* Nom + rôle */}
          <div className="text-center">
            <h2 className="text-lg font-bold text-brand-dark">
              {user?.fullName}
            </h2>
            <Badge
              variant={isAdmin ? 'dark' : 'default'}
              className="mt-1"
            >
              {formatRole(user?.role)}
            </Badge>
          </div>
        </div>

        {/* Infos détaillées */}
        <div className="flex flex-col gap-3 mt-6">
          <div className="flex items-center gap-3 px-4 py-3 bg-brand-light rounded-lg">
            <Mail size={16} className="text-brand-gray flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-brand-gray">Email</p>
              <p className="text-sm font-medium text-brand-dark truncate">
                {user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-3 bg-brand-light rounded-lg">
            <Shield size={16} className="text-brand-gray flex-shrink-0" />
            <div>
              <p className="text-xs text-brand-gray">Rôle</p>
              <p className="text-sm font-medium text-brand-dark">
                {formatRole(user?.role)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-3 bg-brand-light rounded-lg">
            <User size={16} className="text-brand-gray flex-shrink-0" />
            <div>
              <p className="text-xs text-brand-gray">Identifiant</p>
              <p className="text-sm font-medium text-brand-dark font-mono text-xs">
                {user?.id}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* ==============================
          CHANGER MOT DE PASSE
          ============================== */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <KeyRound size={16} className="text-brand-gray" />
            <h3 className="text-sm font-semibold text-brand-dark">
              Mot de passe
            </h3>
          </div>
          <button
            onClick={() => setShowChangePassword(!showChangePassword)}
            className="text-sm text-brand-red hover:underline font-medium"
          >
            {showChangePassword ? 'Annuler' : 'Modifier'}
          </button>
        </div>

        {showChangePassword ? (
          <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
            <Input
              label="Mot de passe actuel"
              type="password"
              value={form.currentPassword}
              onChange={update('currentPassword')}
              required
            />
            <Input
              label="Nouveau mot de passe"
              type="password"
              value={form.newPassword}
              onChange={update('newPassword')}
              hint="Minimum 6 caractères"
              required
            />
            <Input
              label="Confirmer"
              type="password"
              value={form.confirmPassword}
              onChange={update('confirmPassword')}
              required
            />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <p className="text-sm text-brand-red">{error}</p>
              </div>
            )}

            <Button type="submit" fullWidth isLoading={isLoading}>
              Mettre à jour
            </Button>
          </form>
        ) : (
          <p className="text-sm text-brand-gray">••••••••••••</p>
        )}
      </Card>

      {/* ==============================
          SWITCH DE RÔLE (admin seulement)
          ============================== */}
      {isAdmin && (
        <Card padding="md">
          <div className="flex items-center gap-2 mb-3">
            <RefreshCw size={16} className="text-brand-gray" />
            <h3 className="text-sm font-semibold text-brand-dark">
              Switcher de rôle
            </h3>
          </div>
          <p className="text-xs text-brand-gray mb-4">
            Testez l'application comme un employé sans créer de compte séparé.
          </p>
          <Button
            variant="outline"
            fullWidth
            isLoading={isSwitching}
            onClick={() => handleSwitch('user')}
          >
            <RefreshCw size={15} />
            Passer en mode Employé
          </Button>
        </Card>
      )}

      {/* ==============================
          DÉCONNEXION
          ============================== */}
      <Button
        variant="danger"
        fullWidth
        onClick={async () => {
          await logout()
          navigate('/login', { replace: true })
        }}
      >
        Se déconnecter
      </Button>

    </div>
  )
}