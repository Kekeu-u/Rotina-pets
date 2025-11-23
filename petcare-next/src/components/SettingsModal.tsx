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
    <div
      className="fixed inset-0 glass-backdrop flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="glass-card p-6 max-w-sm w-full animate-fadeInUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6 relative z-10">
          <h2 className="text-xl font-bold gradient-text">Configurações</h2>
          <button onClick={onClose} className="p-2 glass-button rounded-xl hover:scale-105 active:scale-95 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 relative z-10">
          {/* AI Status Card */}
          <div className="glass-task p-4">
            <div className="flex items-center justify-between mb-2 relative z-10">
              <span className="font-medium flex items-center gap-2">
                <span className="text-lg">✨</span>
                IA Gemini
              </span>
              <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                aiConfigured
                  ? 'bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/20'
                  : 'bg-gray-700/50 text-gray-400'
              }`}>
                {aiConfigured ? '✓ Ativo' : 'Não configurado'}
              </span>
            </div>
            <p className="text-sm text-gray-400 relative z-10">
              {aiConfigured
                ? 'API Key configurada no servidor (.env.local)'
                : 'Configure GEMINI_API_KEY no arquivo .env.local'}
            </p>
          </div>

          <button
            onClick={handleEditPet}
            className="w-full py-3.5 px-4 glass-button rounded-xl transition-all flex items-center justify-center gap-2 font-medium hover:scale-[1.02] active:scale-[0.98]"
          >
            ✏️ Editar Pet
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-3.5 px-4 glass-button rounded-xl transition-all flex items-center justify-center gap-2 font-medium text-yellow-400 hover:scale-[1.02] active:scale-[0.98]"
          >
            🔒 Bloquear (Logout)
          </button>

          <button
            onClick={handleReset}
            className="w-full py-3.5 px-4 glass-button rounded-xl transition-all flex items-center justify-center gap-2 font-medium text-red-400 hover:bg-red-500/10 hover:scale-[1.02] active:scale-[0.98]"
          >
            🗑️ Apagar Tudo
          </button>
        </div>
      </div>
    </div>
  );
}
