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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="font-sans min-h-screen transition-colors duration-300">
        <ThemeProvider>
          <PetProvider>
            <div className="max-w-md mx-auto min-h-screen relative">
              {/* Background gradient */}
              <div className="fixed inset-0 bg-gradient-to-br from-[#0a0a12] via-[#1a1a2e] to-[#0a0a12] dark:from-[#0a0a12] dark:via-[#1a1a2e] dark:to-[#0a0a12] -z-10 transition-colors duration-300" />
              {children}
            </div>
          </PetProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
