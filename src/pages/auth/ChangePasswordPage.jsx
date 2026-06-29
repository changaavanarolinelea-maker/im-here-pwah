// src/pages/auth/ChangePasswordPage.jsx
// Forcer le changement de mot de passe à la première connexion

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import authService from '../../services/auth.service'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Logo from '../../components/shared/Logo'
import { Lock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ChangePasswordPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (next !== confirm) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (next.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setIsLoading(true)
    try {
      await authService.changePassword(current, next)
      toast.success('Mot de passe mis à jour !')
      navigate(user?.role === 'admin' ? '/admin/dashboard' : '/home', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message ?? 'Erreur lors du changement de mot de passe')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-2xl p-8 shadow-[var(--shadow-modal)]">

        <div className="flex justify-center mb-8">
          <Logo size="md" variant="full" />
        </div>

        <h2 className="text-xl font-bold text-brand-dark mb-1">
          Changer votre mot de passe
        </h2>
        <p className="text-sm text-brand-gray mb-6">
          Pour votre sécurité, vous devez définir un nouveau mot de passe.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <Input
            label="Mot de passe temporaire"
            type="password"
            value={current}
            onChange={e => setCurrent(e.target.value)}
            icon={<Lock size={16} />}
            required
          />

          <Input
            label="Nouveau mot de passe"
            type="password"
            value={next}
            onChange={e => setNext(e.target.value)}
            icon={<Lock size={16} />}
            hint="Minimum 6 caractères"
            required
          />

          <Input
            label="Confirmer le mot de passe"
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            icon={<Lock size={16} />}
            required
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-sm text-brand-red">{error}</p>
            </div>
          )}

          <Button type="submit" fullWidth isLoading={isLoading} size="lg" className="mt-2">
            Confirmer
          </Button>

        </form>
      </div>
    </div>
  )
}