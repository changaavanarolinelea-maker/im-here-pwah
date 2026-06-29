// vite.config.js
// Configuration complète de Vite pour une PWA professionnelle

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    // ============================================
    // Configuration PWA
    // Transforme notre app React en app installable
    // sur Android et iOS comme une vraie application
    // ============================================
    VitePWA({
      registerType: 'autoUpdate', // Met à jour l'app automatiquement en arrière-plan

      // Fichiers à mettre en cache pour le mode hors-ligne
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },

      // Manifest : carte d'identité de l'app
      // C'est ce que le téléphone lit pour installer l'app
      manifest: {
        name: "I'm Here — Présence",
        short_name: "I'm Here",
        description: "Application de gestion de présence",
        theme_color: '#DC2626',        // Couleur de la barre du navigateur (notre rouge)
        background_color: '#111111',   // Couleur du splash screen (notre noir)
        display: 'standalone',         // Cache la barre d'adresse — look natif
        orientation: 'portrait',       // Forcé en mode vertical (mobile)
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
})