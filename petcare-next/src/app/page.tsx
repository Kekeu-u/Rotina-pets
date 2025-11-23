'use client';

import { useState } from 'react';
import { usePet } from '@/context/PetContext';
import SplashScreen from '@/components/SplashScreen';
import LoginScreen from '@/components/LoginScreen';
import SetupScreen from '@/components/SetupScreen';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const { screen } = usePet();
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  switch (screen) {
    case 'login':
      return <LoginScreen />;
    case 'setup':
      return <SetupScreen />;
    case 'dashboard':
      return <Dashboard />;
    default:
      return <LoginScreen />;
  }
}
