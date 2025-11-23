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
    <div className={`fixed inset-0 bg-[var(--background)] flex items-center justify-center z-50 transition-opacity duration-500 ${hiding ? 'opacity-0' : 'opacity-100'}`}>
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '500ms' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1000ms' }}></div>
      </div>

      <div className="text-center animate-fadeInUp relative z-10">
        {/* Logo with liquid glass effect */}
        <div className="relative inline-block mb-6">
          <div className="liquid-avatar-ring">
            <div className="w-24 h-24 rounded-full bg-[var(--background)] flex items-center justify-center">
              <span className="text-5xl">🐕</span>
            </div>
          </div>
        </div>

        <h1 className="text-4xl font-bold gradient-text mb-2">
          PetCare
        </h1>
        <p className="text-gray-400 mb-8">Rotina do seu pet</p>

        {/* Liquid glass spinner */}
        <div className="relative w-12 h-12 mx-auto">
          <div className="absolute inset-0 rounded-full border-3 border-gray-700/50"></div>
          <div className="absolute inset-0 rounded-full border-3 border-transparent border-t-indigo-500 border-r-purple-500 animate-spin"></div>
        </div>
      </div>
    </div>
  );
}
