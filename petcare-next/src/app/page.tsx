'use client';

import { useState } from 'react';
import { usePet } from '@/context/PetContext';
import SplashScreen from '@/components/SplashScreen';
import PinLogin from '@/components/PinLogin';
import SetupScreen from '@/components/SetupScreen';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const { loaded, screen, isAuthenticated, hasPin, createPin, verifyPin } = usePet();
  const [showSplash, setShowSplash] = useState(true);
  const [pinError, setPinError] = useState(false);

  // Show splash while loading or during splash animation
  if (!loaded || showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  // Not authenticated - show PIN login
  if (!isAuthenticated) {
    return (
      <PinLogin
        mode={hasPin ? 'verify' : 'create'}
        onSuccess={(pin) => {
          if (hasPin) {
            const success = verifyPin(pin);
            if (!success) {
              setPinError(true);
            }
          } else {
            createPin(pin);
          }
        }}
      />
    );
  }

  // Authenticated - show appropriate screen
  switch (screen) {
    case 'setup':
      return <SetupScreen />;
    case 'dashboard':
      return <Dashboard />;
    default:
      return <SetupScreen />;
  }
}
