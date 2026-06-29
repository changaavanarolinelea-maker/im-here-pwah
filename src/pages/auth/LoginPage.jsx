// src/pages/auth/LoginPage.jsx
// Page de connexion — sera complétée à l'étape suivante
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Logo from '../../components/shared/Logo'
import { Mail, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const { mustChangePassword, user } = await login(email, password)

      if (mustChangePassword) {
        navigate('/change-password', { replace: true })
        return
      }

      // Redirige selon le rôle
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/home', { replace: true })
      toast.success(`Bienvenue, ${user.fullName.split(' ')[0]} !`)

    } catch (err) {
      setError(err.response?.data?.message ?? 'Email ou mot de passe incorrect')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center p-6">

      {/* Carte de connexion */}
      <div className="w-full max-w-sm bg-white rounded-2xl p-8 shadow-[var(--shadow-modal)]">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo size="md" variant="full" />
        </div>

        <h2 className="text-xl font-bold text-brand-dark mb-1">
          Connexion
        </h2>
        <p className="text-sm text-brand-gray mb-6">
          Entrez vos identifiants pour accéder à votre espace.
        </p>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="vous@exemple.com"
            icon={<Mail size={16} />}
            required
            autoComplete="email"
          />

          <Input
            label="Mot de passe"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            icon={<Lock size={16} />}
            required
            autoComplete="current-password"
          />

          {/* Message d'erreur global */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-sm text-brand-red">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            size="lg"
            className="mt-2"
          >
            Se connecter
          </Button>

        </form>
      </div>

      {/* Mention bas de page */}
      <p className="mt-6 text-xs text-brand-gray text-center">
        I'M HERE — Gestion de présence
      </p>
    </div>
  )
}