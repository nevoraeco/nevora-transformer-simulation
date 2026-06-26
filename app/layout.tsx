import type { Metadata, Viewport } from "next";
import { DM_Sans, Syne, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "./providers"; // Re-connecting your global state engine
import "./globals.css";

// ---------------------------------------------------------
// 1. Residential TYPOGRAPHY OPTIMIZATION
// Pre-compiles fonts on the server to eliminate layout shifts
// ---------------------------------------------------------
const dmSans = DM_Sans({ 
  subsets: ["latin"], 
  variable: "--font-dm-sans",
  display: "swap",
});

const syne = Syne({ 
  subsets: ["latin"], 
  variable: "--font-syne",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({ 
  subsets: ["latin"], 
  variable: "--font-jetbrains-mono",
  display: "swap",
});

// ---------------------------------------------------------
// 2. VIEWPORT & PWA CONFIGURATION (Next.js 14+ Standard)
// ---------------------------------------------------------
export const viewport: Viewport = {
  // Dynamically colors the Safari/Chrome status bar to match the Obsidian/Paper theme
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#090A0F" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents layout-breaking auto-zoom when tapping inputs on iOS
};

// ... (keep your font imports, viewport block, etc.) ...

// ---------------------------------------------------------
// 3. GLOBAL METADATA & BRAND PRESENCE
// Defines SEO, dynamic favicons, and social media link unfurling
// ---------------------------------------------------------
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "Nevora FluxEngine",
  description: "Residential EV Infrastructure Simulation & Orchestration Engine",
  
  // Dynamic Browser Tabs & Static iOS Home Screen Icon
  icons: {
    icon: [
      { media: '(prefers-color-scheme: light)', url: '/light-icon.png', href: '/light-icon.png' },
      { media: '(prefers-color-scheme: dark)', url: '/dark-icon.png', href: '/dark-icon.png' },
    ],
    apple: [
      { url: '/dark-icon.png' } // iOS enforces a single static icon for the home screen
    ]
  },

  // WhatsApp, iMessage, LinkedIn, Slack Link Previews
  openGraph: {
    title: "Nevora's FluxEngine",
    description: "Residential EV Infrastructure Simulation & Orchestration Engine",
    siteName: "Nevora Ecovolt",
    images: [
      {
        url: '/link-preview-icon.png', // The ultra-wide premium banner
        width: 1200,
        height: 630,
        alt: "Nevora FluxEngine Preview",
      }
    ],
    locale: 'en_IN',
    type: 'website',
  },

  // Twitter/X specific card sizing
  twitter: {
    card: 'summary_large_image',
    title: "Nevora's FluxEngine",
    description: "Residential EV Infrastructure Simulation & Orchestration Engine",
    images: ['/link-preview-icon.png'], 
  },

  appleWebApp: {
    capable: true,
    title: "FluxEngine",
    statusBarStyle: "default", 
  },
  formatDetection: {
    telephone: false, 
  },
};

// ... (keep your RootLayout function exactly as it is) ...

// ---------------------------------------------------------
// 4. ROOT DOM ARCHITECTURE
// ---------------------------------------------------------
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning prevents mismatch errors when the ThemeProvider injects Dark Mode
    <html lang="en" suppressHydrationWarning>
      <body 
        className={`${dmSans.variable} ${syne.variable} ${jetBrainsMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        {/* Global State Engine Wrapper */}
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}