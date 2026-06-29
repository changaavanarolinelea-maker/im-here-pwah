// src/pages/admin/AdminConfigPage.jsx
// ============================================
// Configuration système (admin)
// Permet de modifier les paramètres globaux :
//   - Horaires de travail
//   - Tolérance de retard
//   - Taux de déduction
//   - Plage IP autorisée
// ============================================

import { useState, useEffect } from 'react'
import { Save, Settings } from 'lucide-react'
import api from '../../services/api'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Spinner from '../../components/ui/Spinner'
import toast from 'react-hot-toast'

export default function AdminConfigPage() {
  const [config, setConfig]       = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving]   = useState(false)

  // --- Chargement de la config actuelle ---
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data } = await api.get('/config')
        setConfig(data)
      } catch {
        toast.error('Impossible de charger la configuration')
      } finally {
        setIsLoading(false)
      }
    }
    fetchConfig()
  }, [])

  // --- Mise à jour d'un champ ---
  const update = (field) => (e) =>
    setConfig(c => ({ ...c, [field]: e.target.value }))

  // --- Sauvegarde ---
  const handleSave = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await api.put('/config', config)
      toast.success('Configuration sauvegardée')
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-5 max-w-lg">

      {/* ==============================
          HORAIRES DE TRAVAIL
          ============================== */}
      <Card padding="md">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-brand-black rounded-lg">
            <Settings size={15} className="text-white" />
          </div>
          <h3 className="text-sm font-semibold text-brand-dark">
            Horaires de travail
          </h3>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-brand-dark">
                Heure d'arrivée
              </label>
              <input
                type="time"
                value={config?.arrivalTime ?? ''}
                onChange={update('arrivalTime')}
                className="
                  w-full rounded-lg border border-brand-border
                  px-3 py-2.5 text-sm text-brand-dark bg-white
                  focus:outline-none focus:ring-2 focus:ring-brand-red
                "
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-brand-dark">
                Heure de départ
              </label>
              <input
                type="time"
                value={config?.departureTime ?? ''}
                onChange={update('departureTime')}
                className="
                  w-full rounded-lg border border-brand-border
                  px-3 py-2.5 text-sm text-brand-dark bg-white
                  focus:outline-none focus:ring-2 focus:ring-brand-red
                "
              />
            </div>
          </div>

          <Input
            label="Durée de pause (minutes)"
            type="number"
            value={config?.breakDuration ?? ''}
            onChange={update('breakDuration')}
            placeholder="60"
            hint="Durée de la pause déjeuner en minutes"
          />
        </div>
      </Card>

      {/* ==============================
          PARAMÈTRES DE TOLÉRANCE
          ============================== */}
      <Card padding="md">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-brand-red rounded-lg">
            <Settings size={15} className="text-white" />
          </div>
          <h3 className="text-sm font-semibold text-brand-dark">
            Tolérance & sanctions
          </h3>
        </div>

        <div className="flex flex-col gap-4">
          <Input
            label="Marge de tolérance (minutes)"
            type="number"
            value={config?.toleranceMargin ?? ''}
            onChange={update('toleranceMargin')}
            placeholder="15"
            hint="Délai avant qu'un retard soit sanctionné"
          />

          <Input
            label="Taux de déduction horaire"
            type="number"
            value={config?.hourlyDeductionRate ?? ''}
            onChange={update('hourlyDeductionRate')}
            placeholder="0.5"
            hint="Montant déduit par heure d'absence"
          />

          <Input
            label="Jour d'envoi du rapport mensuel"
            type="number"
            value={config?.monthlyReportDay ?? ''}
            onChange={update('monthlyReportDay')}
            placeholder="1"
            hint="Jour du mois où le rapport est envoyé (1-28)"
          />
        </div>
      </Card>

      {/* ==============================
          SÉCURITÉ RÉSEAU
          ============================== */}
      <Card padding="md">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-brand-black rounded-lg">
            <Settings size={15} className="text-white" />
          </div>
          <h3 className="text-sm font-semibold text-brand-dark">
            Sécurité réseau
          </h3>
        </div>

        <Input
          label="Plage IP autorisée"
          value={config?.allowedIpRange ?? ''}
          onChange={update('allowedIpRange')}
          placeholder="192.168.1.0/24"
          hint="Laissez vide pour autoriser toutes les IPs"
        />
      </Card>

      {/* Bouton sauvegarder */}
      <Button
        type="submit"
        size="lg"
        fullWidth
        isLoading={isSaving}
      >
        <Save size={16} />
        Sauvegarder la configuration
      </Button>

    </form>
  )
}