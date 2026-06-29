// src/pages/admin/AdminQrCodePage.jsx
// ============================================
// Affichage du QR Code de pointage
// Le token se rafraîchit automatiquement
// toutes les 30 secondes pour la sécurité
// ============================================

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Maximize2, Shield } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import attendanceService from '../../services/attendance.service'
import Card from '../../components/ui/Card'
import Spinner from '../../components/ui/Spinner'
import { QR_REFRESH_INTERVAL } from '../../utils/constants'
import toast from 'react-hot-toast'

export default function AdminQrCodePage() {
  const [qrToken, setQrToken]     = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [countdown, setCountdown] = useState(QR_REFRESH_INTERVAL)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // --- Charge le token QR ---
  const fetchQrCode = useCallback(async () => {
    try {
      const data = await attendanceService.getCurrentQrCode()
      // Adapte selon la structure de ta réponse API
      setQrToken(data.token ?? data.qrToken ?? data.value ?? JSON.stringify(data))
      setCountdown(QR_REFRESH_INTERVAL)
    } catch {
      toast.error('Impossible de charger le QR code')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Chargement initial + rafraîchissement automatique
  useEffect(() => {
    fetchQrCode()
    const refreshInterval = setInterval(fetchQrCode, QR_REFRESH_INTERVAL * 1000)
    return () => clearInterval(refreshInterval)
  }, [fetchQrCode])

  // Compte à rebours visuel
  useEffect(() => {
    if (!qrToken) return
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) return QR_REFRESH_INTERVAL
        return c - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [qrToken])

  // Pourcentage restant pour la barre de progression
  const progressPercent = (countdown / QR_REFRESH_INTERVAL) * 100

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6 max-w-sm mx-auto">

      {/* ==============================
          CARTE QR CODE
          ============================== */}
      <Card padding="lg" className="w-full">
        <div className="flex flex-col items-center gap-6">

          {/* Titre */}
          <div className="text-center">
            <h2 className="text-base font-bold text-brand-dark">
              QR Code de pointage
            </h2>
            <p className="text-xs text-brand-gray mt-1">
              Les employés scannent ce code pour pointer
            </p>
          </div>

          {/* QR Code */}
          <div className={`
            p-4 bg-white rounded-2xl border-2 border-brand-border
            ${countdown <= 5 ? 'border-brand-red animate-pulse' : ''}
          `}>
            {qrToken ? (
              <QRCodeSVG
                value={qrToken}
                size={220}
                bgColor="#FFFFFF"
                fgColor="#111111"
                level="H"       // Niveau de correction d'erreur élevé
                includeMargin={false}
              />
            ) : (
              <div className="w-[220px] h-[220px] flex items-center justify-center">
                <p className="text-sm text-brand-gray">Token indisponible</p>
              </div>
            )}
          </div>

          {/* Barre de compte à rebours */}
          <div className="w-full flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-brand-gray flex items-center gap-1">
                <Shield size={12} />
                Expire dans
              </span>
              <span className={`
                text-xs font-bold
                ${countdown <= 5 ? 'text-brand-red' : 'text-brand-dark'}
              `}>
                {countdown}s
              </span>
            </div>

            {/* Barre de progression */}
            <div className="w-full bg-brand-light rounded-full h-1.5">
              <div
                className={`
                  h-1.5 rounded-full transition-all duration-1000
                  ${countdown <= 5 ? 'bg-brand-red' : 'bg-brand-black'}
                `}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Boutons actions */}
          <div className="flex gap-3 w-full">

            {/* Rafraîchir manuellement */}
            <button
              onClick={fetchQrCode}
              className="
                flex-1 flex items-center justify-center gap-2
                px-4 py-2.5 rounded-lg text-sm font-medium
                border border-brand-border text-brand-gray
                hover:bg-brand-light transition-colors duration-200
              "
            >
              <RefreshCw size={15} />
              Rafraîchir
            </button>

            {/* Plein écran */}
            <button
              onClick={() => setIsFullscreen(true)}
              className="
                flex-1 flex items-center justify-center gap-2
                px-4 py-2.5 rounded-lg text-sm font-medium
                bg-brand-black text-white
                hover:bg-brand-dark transition-colors duration-200
              "
            >
              <Maximize2 size={15} />
              Plein écran
            </button>
          </div>
        </div>
      </Card>

      {/* Info sécurité */}
      <div className="bg-brand-red-light border border-red-200 rounded-xl px-4 py-3 w-full">
        <p className="text-xs text-brand-red text-center">
          🔒 Ce QR code change toutes les {QR_REFRESH_INTERVAL} secondes pour éviter les fraudes
        </p>
      </div>

      {/* ==============================
          MODE PLEIN ÉCRAN
          Idéal pour afficher sur un écran TV
          dans la salle de pointage
          ============================== */}
      {isFullscreen && (
        <div
          className="fixed inset-0 bg-brand-black z-50 flex flex-col items-center justify-center gap-8 cursor-pointer"
          onClick={() => setIsFullscreen(false)}
        >
          {/* Logo en haut */}
          <div className="text-center">
            <p className="text-white text-2xl font-bold tracking-wider">
              I'M HERE
            </p>
            <p className="text-brand-gray text-sm mt-1">
              Scannez pour pointer votre présence
            </p>
          </div>

          {/* QR Code grand format */}
          <div className="p-6 bg-white rounded-3xl">
            {qrToken && (
              <QRCodeSVG
                value={qrToken}
                size={280}
                bgColor="#FFFFFF"
                fgColor="#111111"
                level="H"
              />
            )}
          </div>

          {/* Compte à rebours */}
          <div className="flex flex-col items-center gap-2 w-64">
            <div className="w-full bg-white bg-opacity-20 rounded-full h-1.5">
              <div
                className={`
                  h-1.5 rounded-full transition-all duration-1000
                  ${countdown <= 5 ? 'bg-brand-red' : 'bg-white'}
                `}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className={`text-sm ${countdown <= 5 ? 'text-brand-red' : 'text-brand-gray'}`}>
              Nouveau code dans {countdown}s
            </p>
          </div>

          {/* Instruction fermeture */}
          <p className="text-brand-gray text-xs absolute bottom-6">
            Appuyez n'importe où pour fermer
          </p>
        </div>
      )}
    </div>
  )
}