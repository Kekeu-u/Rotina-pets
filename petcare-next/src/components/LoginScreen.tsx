'use client';

import { usePet } from '@/context/PetContext';

export default function LoginScreen() {
  const { setScreen } = usePet();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center">
        <div className="text-6xl mb-4">🐕</div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
          PetCare
        </h1>
        <p className="text-gray-400 mb-8">Cuidado gamificado para seu pet</p>

        <button
          onClick={() => setScreen('setup')}
          className="w-full max-w-xs px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-white font-semibold text-lg hover:from-indigo-500 hover:to-purple-500 transition-all transform hover:scale-105"
        >
          Começar
        </button>

        <p className="text-gray-500 text-sm mt-6">
          Seus dados ficam salvos no seu dispositivo
        </p>
      </div>
    </div>
  );
}
