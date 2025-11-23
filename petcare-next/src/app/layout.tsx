import type { Metadata, Viewport } from 'next';
import './globals.css';
import { PetProvider } from '@/context/PetContext';
import { ThemeProvider } from '@/context/ThemeContext';

export const metadata: Metadata = {
  title: 'PetCare',
  description: 'Cuidado gamificado para seu pet',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PetCare',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#6366f1',
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="font-sans transition-colors duration-300">
        <ThemeProvider>
          <PetProvider>
            {/* Animated gradient background */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
              {/* Base gradient */}
              <div className="absolute inset-0 bg-[var(--background)] transition-colors duration-300" />

              {/* Animated gradient orbs */}
              <div className="absolute top-0 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] animate-float-slow" />
              <div className="absolute bottom-0 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-float-slow-reverse" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-500/5 rounded-full blur-[150px] animate-pulse-slow" />
            </div>

            {/* Main container */}
            <div className="w-full max-w-[430px] mx-auto min-h-dvh relative">
              {children}
            </div>
          </PetProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
