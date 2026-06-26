import { MetadataRoute } from 'next'

/**
 * Enterprise Web App Manifest
 * Instructs Android and Chromium devices on how to install, name, 
 * and theme the application on the device home screen.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nevora's FluxEngine",
    short_name: 'FluxEngine',
    description: 'Residential EV Infrastructure Simulation & Orchestration Engine',
    start_url: '/',
    display: 'standalone',
    background_color: '#090A0F', // Obsidian theme background
    theme_color: '#10B981',      // Emerald brand accent
    icons: [
      {
        src: '/light-icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/dark-icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable', // Ensures perfect cropping on Android Adaptive Icons
      },
    ],
  }
}