import type { Metadata, Viewport } from 'next';
import './globals.css';
import { PetProvider } from '@/context/PetContext';

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
    <html lang="pt-BR">
      <body className="font-sans bg-[#0a0a12] text-white min-h-screen">
        <PetProvider>
          <div className="max-w-md mx-auto min-h-screen">
            {children}
          </div>
        </PetProvider>
      </body>
    </html>
  );
}
