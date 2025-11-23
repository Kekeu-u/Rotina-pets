'use client';

import { usePet } from '@/context/PetContext';
import { X } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const { reset, setScreen, aiConfigured, logout } = usePet();

  const handleEditPet = () => {
    onClose();
    setScreen('setup');
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  const handleReset = () => {
    if (confirm('Apagar todos os dados do app? Isso também apagará seu PIN.')) {
      reset();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full border border-gray-700" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Configurações</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">IA Gemini</span>
              <span className={`text-sm px-2 py-0.5 rounded ${aiConfigured ? 'bg-green-900/50 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                {aiConfigured ? '✓ Ativo' : 'Não configurado'}
              </span>
            </div>
            <p className="text-sm text-gray-400">
              {aiConfigured
                ? 'API Key configurada no servidor (.env.local)'
                : 'Configure GEMINI_API_KEY no arquivo .env.local'}
            </p>
          </div>

          <button
            onClick={handleEditPet}
            className="w-full py-3 px-4 bg-gray-800 border border-gray-700 rounded-xl hover:border-indigo-500 transition-colors flex items-center justify-center gap-2"
          >
            ✏️ Editar Pet
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-3 px-4 bg-gray-800 border border-gray-700 rounded-xl hover:border-yellow-500 transition-colors text-yellow-400 flex items-center justify-center gap-2"
          >
            🔒 Bloquear (Logout)
          </button>

          <button
            onClick={handleReset}
            className="w-full py-3 px-4 bg-red-900/30 border border-red-700/50 rounded-xl hover:border-red-500 transition-colors text-red-400 flex items-center justify-center gap-2"
          >
            🗑️ Apagar Tudo
          </button>
        </div>
      </div>
    </div>
  );
}
