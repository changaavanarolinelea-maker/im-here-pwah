// src/pages/user/UserAbsencesPage.jsx
// ============================================
// Demandes d'absence de l'employé
// Soumettre, consulter, annuler
// ============================================

import { useState, useEffect } from 'react'
import { Plus, Umbrella } from 'lucide-react'
import absencesService from '../../services/absences.service'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import { formatDate, getAbsenceStatus } from '../../utils/formatters'
import toast from 'react-hot-toast'

export default function UserAbsencesPage() {
  const [absences, setAbsences]   = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const fetchAbsences = async () => {
    setIsLoading(true)
    try {
      const data = await absencesService.getMine()
      setAbsences(Array.isArray(data) ? data : data.absences ?? [])
    } catch {
      toast.error('Impossible de charger vos absences')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchAbsences() }, [])

  const handleCancel = async (id) => {
    if (!confirm('Annuler cette demande ?')) return
    try {
      await absencesService.cancel(id)
      toast.success('Demande annulée')
      fetchAbsences()
    } catch {
      toast.error('Impossible d\'annuler cette demande')
    }
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Bouton nouvelle demande */}
      <Button onClick={() => setShowModal(true)}>
        <Plus size={16} />
        Nouvelle demande
      </Button>

      {/* Liste */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : absences.length === 0 ? (
        <Card padding="lg">
          <div className="flex flex-col items-center gap-2 py-8">
            <Umbrella size={32} className="text-brand-border" />
            <p className="text-sm text-brand-gray">Aucune demande d'absence</p>
          </div>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {absences.map(absence => {
            const status = getAbsenceStatus(absence.status)
            return (
              <Card key={absence.id} padding="md">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={
                          absence.status === 'approved' ? 'success' :
                          absence.status === 'rejected' ? 'danger'  : 'info'
                        }
                        dot
                      >
                        {status.label}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-brand-dark">
                      Du {formatDate(absence.dateStart)} au {formatDate(absence.dateEnd)}
                    </p>
                    {absence.reason && (
                      <p className="text-xs text-brand-gray mt-1">{absence.reason}</p>
                    )}
                    {absence.comment && (
                      <p className="text-xs text-brand-red mt-1">
                        Motif de rejet : {absence.comment}
                      </p>
                    )}
                  </div>

                  {/* Annuler si en attente */}
                  {absence.status === 'pending' && (
                    <button
                      onClick={() => handleCancel(absence._id)}
                      className="text-xs text-brand-red hover:underline flex-shrink-0"
                    >
                      Annuler
                    </button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal nouvelle demande */}
      {showModal && (
        <NewAbsenceModal
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchAbsences() }}
        />
      )}
    </div>
  )
}

// ============================================
// MODAL : Nouvelle demande d'absence
// ============================================
function NewAbsenceModal({ onClose, onSuccess }) {
  const [form, setForm]           = useState({ dateStart: '', dateEnd: '', reason: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]         = useState('')

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.dateEnd < form.dateStart) {
      setError('La date de fin doit être après la date de début')
      return
    }

    setIsLoading(true)
    try {
      await absencesService.create(form)
      toast.success('Demande soumise avec succès')
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Erreur lors de la soumission')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl p-6 shadow-[var(--shadow-modal)] max-w-md mx-auto">

        <h3 className="text-base font-bold text-brand-dark mb-5">
          Nouvelle demande d'absence
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-brand-dark">
                Date début <span className="text-brand-red">*</span>
              </label>
              <input
                type="date"
                value={form.dateStart}
                onChange={update('dateStart')}
                required
                className="w-full rounded-lg border border-brand-border px-3 py-2.5 text-sm text-brand-dark bg-white focus:outline-none focus:ring-2 focus:ring-brand-red"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-brand-dark">
                Date fin <span className="text-brand-red">*</span>
              </label>
              <input
                type="date"
                value={form.dateEnd}
                onChange={update('dateEnd')}
                required
                className="w-full rounded-lg border border-brand-border px-3 py-2.5 text-sm text-brand-dark bg-white focus:outline-none focus:ring-2 focus:ring-brand-red"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-brand-dark">
              Motif <span className="text-brand-red">*</span>
            </label>
            <textarea
              value={form.reason}
              onChange={update('reason')}
              placeholder="Raison de l'absence..."
              rows={3}
              required
              className="w-full rounded-lg border border-brand-border px-4 py-2.5 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-red resize-none"
            />
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
            <Button type="submit" fullWidth isLoading={isLoading}>
              Soumettre
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}