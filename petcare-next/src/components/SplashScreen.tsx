'use client';

import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHiding(true);
      setTimeout(onComplete, 500);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 bg-gradient-to-br from-[#0a0a12] via-[#1a1a2e] to-[#0a0a12] flex items-center justify-center z-50 transition-opacity duration-500 ${hiding ? 'opacity-0' : 'opacity-100'}`}>
      <div className="text-center animate-fadeInUp">
        <div className="text-6xl mb-4 animate-bounce">🐕</div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
          PetCare
        </h1>
        <p className="text-gray-400 mb-8">Rotina do seu pet</p>
        <div className="w-10 h-10 mx-auto border-3 border-gray-700 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    </div>
  );
}
