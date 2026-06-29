// src/pages/admin/AdminAbsencesPage.jsx
// ============================================
// Gestion des demandes d'absence (admin)
// Fonctionnalités :
//   - Liste filtrée par statut et employé
//   - Approuver ou rejeter avec commentaire
// ============================================

import { useState, useEffect, useCallback } from 'react'
import { CheckCircle, XCircle, Filter } from 'lucide-react'
import absencesService from '../../services/absences.service'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import Input from '../../components/ui/Input'
import { getInitials, formatDate, getAbsenceStatus } from '../../utils/formatters'
import toast from 'react-hot-toast'

export default function AdminAbsencesPage() {
  const [absences, setAbsences]   = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('pending')
  const [rejectModal, setRejectModal]   = useState(null) // absence à rejeter

  const fetchAbsences = useCallback(async () => {
    setIsLoading(true)
    try {
      const filters = {}
      if (filterStatus !== 'all') filters.status = filterStatus
      const data = await absencesService.getAll(filters)
      setAbsences(Array.isArray(data) ? data : data.absences ?? [])
    } catch {
      toast.error('Impossible de charger les absences')
    } finally {
      setIsLoading(false)
    }
  }, [filterStatus])

  useEffect(() => { fetchAbsences() }, [fetchAbsences])

  // --- Approuver directement ---
  const handleApprove = async (absence) => {
    try {
      await absencesService.decide(absence._id, 'approve')
      toast.success('Absence approuvée')
      fetchAbsences()
    } catch {
      toast.error('Erreur lors de l\'approbation')
    }
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Filtres par statut */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: 'all',      label: 'Toutes'      },
          { value: 'pending',  label: 'En attente'  },
          { value: 'approved', label: 'Approuvées'  },
          { value: 'rejected', label: 'Rejetées'    },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilterStatus(f.value)}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200
              ${filterStatus === f.value
                ? 'bg-brand-black text-white'
                : 'bg-white border border-brand-border text-brand-gray hover:bg-brand-light'
              }
            `}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Liste */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : absences.length === 0 ? (
        <Card padding="lg">
          <div className="flex flex-col items-center gap-2 py-8">
            <Filter size={32} className="text-brand-border" />
            <p className="text-sm text-brand-gray">Aucune demande trouvée</p>
          </div>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {absences.map(absence => (
            <AbsenceCard
              key={absence._id}
              absence={absence}
              onApprove={() => handleApprove(absence)}
              onReject={() => setRejectModal(absence)}
            />
          ))}
        </div>
      )}

      {/* Modal rejet */}
      {rejectModal && (
        <RejectModal
          absence={rejectModal}
          onClose={() => setRejectModal(null)}
          onSuccess={() => { setRejectModal(null); fetchAbsences() }}
        />
      )}
    </div>
  )
}

// ============================================
// COMPOSANT : Carte d'une absence
// ============================================
function AbsenceCard({ absence, onApprove, onReject }) {
  const status = getAbsenceStatus(absence.status)

  return (
    <Card padding="md">
      <div className="flex items-start gap-3">

        {/* Avatar avec initiales du vrai nom */}
        <div className="w-10 h-10 rounded-full bg-brand-black text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
          {getInitials(absence.userId?.fullName ?? '?')}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">

            {/* Nom réel de l'employé */}
            <p className="text-sm font-medium text-brand-dark truncate">
              {absence.userId?.fullName ?? 'Employé inconnu'}
            </p>

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

          {/* Email */}
          <p className="text-xs text-brand-gray truncate mb-1">
            {absence.userId?.email ?? ''}
          </p>

          {/* Dates */}
          <p className="text-xs text-brand-gray">
            Du {formatDate(absence.dateStart)} au {formatDate(absence.dateEnd)}
          </p>

          {/* Motif */}
          {absence.reason && (
            <p className="text-sm text-brand-dark mt-2 bg-brand-light rounded-lg px-3 py-2">
              {absence.reason}
            </p>
          )}

          {/* Urgent */}
          {absence.isUrgent && (
            <p className="text-xs text-brand-red font-medium mt-1">
              ⚡ Demande urgente
            </p>
          )}

          {/* Commentaire admin si rejeté */}
          {absence.adminComment && (
            <p className="text-xs text-brand-red mt-1">
              Motif de rejet : {absence.adminComment}
            </p>
          )}

          {/* Boutons action si en attente */}
          {absence.status === 'pending' && (
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={onApprove} className="gap-1.5">
                <CheckCircle size={14} />
                Approuver
              </Button>
              <Button size="sm" variant="danger" onClick={onReject} className="gap-1.5">
                <XCircle size={14} />
                Rejeter
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

// ============================================
// MODAL : Rejeter avec commentaire
// ============================================
function RejectModal({ absence, onClose, onSuccess }) {
  const [comment, setComment]     = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!comment.trim()) {
      toast.error('Un commentaire est requis pour le rejet')
      return
    }
    setIsLoading(true)
    try {
      await absencesService.decide(absence._id, 'reject', comment)
      toast.success('Absence rejetée')
      onSuccess()
    } catch {
      toast.error('Erreur lors du rejet')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl p-6 shadow-[var(--shadow-modal)] max-w-md mx-auto">

        <h3 className="text-base font-bold text-brand-dark mb-1">
          Rejeter la demande
        </h3>
        <p className="text-sm text-brand-gray mb-4">
          Demande de {absence.user?.fullName} — du {formatDate(absence.dateStart)} au {formatDate(absence.dateEnd)}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-brand-dark">
              Motif du rejet <span className="text-brand-red">*</span>
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Expliquez la raison du rejet..."
              rows={3}
              required
              className="
                w-full rounded-lg border border-brand-border
                px-4 py-2.5 text-sm text-brand-dark
                focus:outline-none focus:ring-2 focus:ring-brand-red
                resize-none
              "
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={onClose} type="button">
              Annuler
            </Button>
            <Button variant="danger" type="submit" fullWidth isLoading={isLoading}>
              Confirmer le rejet
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}