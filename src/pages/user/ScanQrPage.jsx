// src/pages/user/ScanQrPage.jsx
// ============================================
// Page de scan QR code pour l'employé
// Utilise la caméra du téléphone pour scanner
// le QR code affiché à l'entrée du bureau
// Gère check-in et check-out automatiquement
// ============================================

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import { Camera, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import attendanceService from '../../services/attendance.service'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

// deviceId unique pour cet appareil
// Stocké dans localStorage pour persister entre sessions
const getDeviceId = () => {
  let id = localStorage.getItem('deviceId')
  if (!id) {
    id = 'device_' + Math.random().toString(36).slice(2, 11)
    localStorage.setItem('deviceId', id)
  }
  return id
}

export default function ScanQrPage() {
  const navigate              = useNavigate()
  const scannerRef            = useRef(null)
  const [isScanning, setIsScanning]   = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult]           = useState(null) // 'checkin' | 'checkout' | 'error'
  const [errorMsg, setErrorMsg]       = useState('')
  const [scanMode, setScanMode]       = useState('checkin') // checkin | checkout

  // --- Démarre le scanner ---
  const startScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode('qr-reader')
      scannerRef.current = html5QrCode

      await html5QrCode.start(
        { facingMode: 'environment' }, // Caméra arrière du téléphone
        {
          fps: 10,          // Images par seconde analysées
          qrbox: { width: 250, height: 250 }, // Zone de scan visible
        },
        onScanSuccess,
        () => {}            // Erreurs de scan ignorées (frame par frame)
      )
      setIsScanning(true)
    } catch (err) {
      toast.error('Impossible d\'accéder à la caméra')
      console.error('Scanner error:', err)
    }
  }

  // --- Arrête le scanner ---
  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        scannerRef.current = null
      } catch {}
    }
    setIsScanning(false)
  }

  // --- QR Code détecté ---
  const onScanSuccess = async (decodedText) => {
    if (isProcessing) return // Évite les doubles scans

    setIsProcessing(true)
    await stopScanner()

    try {
      const deviceId = getDeviceId()

      if (scanMode === 'checkin') {
        await attendanceService.checkIn(decodedText, deviceId)
        setResult('checkin')
        toast.success('Arrivée enregistrée !')
      } else {
        await attendanceService.checkOut(decodedText, deviceId)
        setResult('checkout')
        toast.success('Départ enregistré !')
      }
    } catch (err) {
      setResult('error')
      setErrorMsg(
        err.response?.data?.message ?? 'Erreur lors du pointage'
      )
    } finally {
      setIsProcessing(false)
    }
  }

  // Nettoyage quand on quitte la page
  useEffect(() => {
    return () => { stopScanner() }
  }, [])

  // --- Réinitialiser pour scanner à nouveau ---
  const handleReset = () => {
    setResult(null)
    setErrorMsg('')
  }

  return (
    <div className="min-h-screen bg-brand-black flex flex-col">

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4">
        <button
          onClick={() => { stopScanner(); navigate('/home') }}
          className="p-2 rounded-lg text-white hover:bg-white hover:bg-opacity-10 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-white font-semibold">
          Pointage
        </h1>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">

        {/* ==============================
            RÉSULTAT : Succès check-in
            ============================== */}
        {result === 'checkin' && (
          <ResultScreen
            icon={<CheckCircle size={64} className="text-status-present" />}
            title="Arrivée enregistrée !"
            subtitle={`Bonne journée — ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
            onReset={handleReset}
            onHome={() => navigate('/home')}
            color="green"
          />
        )}

        {/* ==============================
            RÉSULTAT : Succès check-out
            ============================== */}
        {result === 'checkout' && (
          <ResultScreen
            icon={<CheckCircle size={64} className="text-status-present" />}
            title="Départ enregistré !"
            subtitle={`À demain — ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
            onReset={handleReset}
            onHome={() => navigate('/home')}
            color="green"
          />
        )}

        {/* ==============================
            RÉSULTAT : Erreur
            ============================== */}
        {result === 'error' && (
          <ResultScreen
            icon={<XCircle size={64} className="text-status-absent" />}
            title="Échec du pointage"
            subtitle={errorMsg}
            onReset={handleReset}
            onHome={() => navigate('/home')}
            color="red"
          />
        )}

        {/* ==============================
            SCANNER ACTIF ou EN ATTENTE
            ============================== */}
        {!result && (
          <>
            {/* Sélecteur check-in / check-out */}
            <div className="flex gap-1 bg-white bg-opacity-10 p-1 rounded-xl w-full max-w-xs">
              {[
                { value: 'checkin',  label: 'Arrivée' },
                { value: 'checkout', label: 'Départ'  },
              ].map(mode => (
                <button
                  key={mode.value}
                  onClick={() => setScanMode(mode.value)}
                  className={`
                    flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${scanMode === mode.value
                      ? 'bg-brand-red text-white'
                      : 'text-white text-opacity-60 hover:text-opacity-100'
                    }
                  `}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Zone de scan */}
            <div className="w-full max-w-xs">
              {/* Conteneur du scanner — html5-qrcode s'y attache */}
              <div
                id="qr-reader"
                className={`
                  w-full rounded-2xl overflow-hidden
                  border-2 transition-colors duration-300
                  ${isScanning ? 'border-brand-red' : 'border-white border-opacity-20'}
                `}
                style={{ minHeight: '300px' }}
              />
            </div>

            {/* Instructions */}
            <p className="text-white text-opacity-60 text-sm text-center max-w-xs">
              {isScanning
                ? 'Pointez votre caméra vers le QR code affiché à l\'entrée'
                : 'Appuyez sur le bouton pour démarrer le scan'
              }
            </p>

            {/* Bouton démarrer / arrêter */}
            {!isScanning ? (
              <button
                onClick={startScanner}
                className="
                  flex items-center gap-3 px-8 py-4
                  bg-brand-red text-white rounded-2xl
                  font-semibold text-base
                  hover:bg-brand-red-dark transition-colors duration-200
                  active:scale-95
                "
              >
                <Camera size={22} />
                Démarrer le scan
              </button>
            ) : (
              <button
                onClick={stopScanner}
                className="
                  px-6 py-3 rounded-xl
                  border border-white border-opacity-20
                  text-white text-opacity-60 text-sm
                  hover:bg-white hover:bg-opacity-10
                  transition-colors duration-200
                "
              >
                Annuler
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ============================================
// COMPOSANT : Écran de résultat
// ============================================
function ResultScreen({ icon, title, subtitle, onReset, onHome, color }) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      {icon}
      <div>
        <h2 className="text-white text-xl font-bold">{title}</h2>
        <p className="text-white text-opacity-60 text-sm mt-1">{subtitle}</p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={onHome}
          className="
            w-full py-3 rounded-xl
            bg-white text-brand-black
            font-semibold text-sm
            hover:bg-opacity-90 transition-colors
          "
        >
          Retour à l'accueil
        </button>
        <button
          onClick={onReset}
          className="
            w-full py-3 rounded-xl
            border border-white border-opacity-20
            text-white text-opacity-60 text-sm
            hover:bg-white hover:bg-opacity-10
            transition-colors
          "
        >
          Scanner à nouveau
        </button>
      </div>
    </div>
  )
}