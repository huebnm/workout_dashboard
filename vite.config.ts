import { VitePWA } from 'vite-plugin-pwa'

// inside plugins: [ react(), ... ]
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'THE BOARD',
    short_name: 'THE BOARD',
    description: 'Strength, conditioning and CrossFit workout generator',
    theme_color: '#1b1c1e',
    background_color: '#1b1c1e',
    display: 'standalone',
    start_url: '/',
    icons: [
      { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
      { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  },
})