'use client';

import { usePet } from '@/context/PetContext';
import { useTheme } from '@/context/ThemeContext';
import { Clock } from 'lucide-react';
import { DEFAULT_PHOTO } from '@/lib/constants';
import ToggleSwitch from './ui/ToggleSwitch';

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
                <Clock className="w-6 h-6 text-[var(--foreground-secondary)]" />
              )}
            </div>
          </div>
          {aiConfigured && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-xs shadow-lg shadow-indigo-500/40">
              ✨
            </div>
          )}
          {/* Hover glow effect */}
          <div className="absolute inset-0 rounded-full bg-indigo-500/0 group-hover:bg-indigo-500/15 transition-all duration-300 blur-md -z-10"></div>
        </div>
        <div>
          <h1 className="font-bold text-lg gradient-text">{state.pet?.name || 'Pet'}</h1>
          <p className="text-sm text-[var(--foreground-secondary)]">{state.pet?.breed || 'Raça'}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Premium Theme Toggle */}
        <ToggleSwitch
          checked={isDark}
          onChange={toggleTheme}
          variant="theme"
          size="md"
        />

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
