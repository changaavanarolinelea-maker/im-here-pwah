// src/components/shared/ErrorBoundary.jsx
// ============================================
// Capture les erreurs React et affiche
// un écran de secours au lieu de planter
// ============================================

import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-brand-light flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-[var(--shadow-modal)]">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-brand-red text-xl">!</span>
            </div>
            <h2 className="text-base font-bold text-brand-dark mb-2">
              Une erreur est survenue
            </h2>
            <p className="text-sm text-brand-gray mb-6">
              L'application a rencontré un problème inattendu.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false })
                window.location.href = '/'
              }}
              className="w-full py-2.5 bg-brand-red text-white rounded-lg text-sm font-medium"
            >
              Recharger l'application
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}