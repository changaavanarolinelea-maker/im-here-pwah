// src/main.jsx
// ============================================
// Point d'entrée de l'application
// Ordre important :
// 1. StrictMode → détecte les erreurs en dev
// 2. AuthProvider → contexte auth disponible partout
// 3. App → le reste de l'application
// ============================================

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import ErrorBoundary from './components/shared/ErrorBoundary'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>
)