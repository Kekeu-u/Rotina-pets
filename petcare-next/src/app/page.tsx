'use client';

import { useState } from 'react';
import { usePet } from '@/context/PetContext';
import SplashScreen from '@/components/SplashScreen';
import AuthScreen from '@/components/AuthScreen';
import SetupScreen from '@/components/SetupScreen';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const { loaded, screen, isAuthenticated, handleSignUp, handleSignIn, handleGoogleSignIn } = usePet();
  const [showSplash, setShowSplash] = useState(true);

  // Show splash while loading or during splash animation
  if (!loaded || showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  // Not authenticated - show login/signup
  if (!isAuthenticated) {
    return (
      <AuthScreen
        onSuccess={() => {}}
        onSignUp={handleSignUp}
        onSignIn={handleSignIn}
        onGoogleSignIn={handleGoogleSignIn}
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
