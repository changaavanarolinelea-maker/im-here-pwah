// src/App.jsx
// ============================================
// Composant racine — branche le routeur
// et les notifications toast globales
// ============================================

import { Toaster } from 'react-hot-toast'
import AppRouter from './routes/AppRouter'

export default function App() {
  return (
    <>
      {/* Routeur principal */}
      <AppRouter />

      {/* Notifications toast globales
          Positionnées en haut sur mobile */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '10px',
            background: '#111111',
            color: '#ffffff',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#16A34A',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#DC2626',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </>
  )
}