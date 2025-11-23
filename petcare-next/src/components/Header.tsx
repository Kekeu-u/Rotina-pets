'use client';

import { usePet } from '@/context/PetContext';
import { useTheme } from '@/context/ThemeContext';
import { Dog, Sun, Moon } from 'lucide-react';
import { DEFAULT_PHOTO } from '@/lib/constants';

interface HeaderProps {
  onSettingsClick: () => void;
  onAvatarClick: () => void;
}

export default function Header({ onSettingsClick, onAvatarClick }: HeaderProps) {
  const { state, aiConfigured } = usePet();
  const { isDark, toggleTheme } = useTheme();

  const hasPhoto = state.pet?.photo && state.pet.photo !== DEFAULT_PHOTO;

  return (
    <header className="flex items-center justify-between px-4 py-3 glass relative z-20">
      <div className="flex items-center gap-3">
        {/* Avatar with Liquid Ring */}
        <div
          onClick={onAvatarClick}
          className="relative cursor-pointer group"
        >
          <div className="liquid-avatar-ring">
            <div className="w-12 h-12 rounded-full bg-[var(--background)] overflow-hidden flex items-center justify-center">
              {hasPhoto ? (
                <img src={state.pet?.photo || ''} alt={state.pet?.name} className="w-full h-full object-cover" />
              ) : (
                <Dog className="w-6 h-6 text-gray-400" />
              )}
            </div>
          </div>
          {aiConfigured && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs shadow-lg shadow-purple-500/50">
              ✨
            </div>
          )}
          {/* Hover glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-indigo-500/20 group-hover:via-purple-500/20 group-hover:to-pink-500/20 transition-all duration-300 blur-md -z-10"></div>
        </div>
        <div>
          <h1 className="font-bold text-lg gradient-text">{state.pet?.name || 'Pet'}</h1>
          <p className="text-sm text-gray-400">{state.pet?.breed || 'Raça'}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme Toggle - Liquid Glass */}
        <button
          onClick={toggleTheme}
          className="p-2.5 glass-button rounded-xl hover:scale-105 active:scale-95 transition-all duration-300"
          aria-label={isDark ? 'Modo claro' : 'Modo escuro'}
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
          )}
        </button>

        {/* Settings - Liquid Glass */}
        <button
          onClick={onSettingsClick}
          className="p-2.5 glass-button rounded-xl hover:scale-105 active:scale-95 transition-all duration-300 text-lg"
        >
          ⚙️
        </button>
      </div>
    </header>
  );
}
