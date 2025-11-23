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
      <body className="font-sans transition-colors duration-300 overflow-hidden">
        <ThemeProvider>
          <PetProvider>
            <div className="w-full max-w-[430px] mx-auto h-dvh relative overflow-hidden">
              {/* Background gradient */}
              <div className="fixed inset-0 bg-gradient-to-br from-[#0a0a12] via-[#1a1a2e] to-[#0a0a12] -z-10 transition-colors duration-300" />
              {children}
            </div>
          </PetProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
