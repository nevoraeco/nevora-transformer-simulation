import { MetadataRoute } from 'next'
 
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
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: "any",
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: "any",
      },
    ],
  }
}