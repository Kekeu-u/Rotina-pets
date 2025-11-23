'use client';

import { usePet } from '@/context/PetContext';
import { Dog } from 'lucide-react';
import { DEFAULT_PHOTO } from '@/lib/constants';

interface HeaderProps {
  onSettingsClick: () => void;
  onAvatarClick: () => void;
}

export default function Header({ onSettingsClick, onAvatarClick }: HeaderProps) {
  const { state, aiConfigured } = usePet();

  const hasPhoto = state.pet?.photo && state.pet.photo !== DEFAULT_PHOTO;

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-gray-900/80 backdrop-blur border-b border-gray-800">
      <div className="flex items-center gap-3">
        <div
          onClick={onAvatarClick}
          className="relative cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-gray-800 border-2 border-indigo-500 overflow-hidden flex items-center justify-center">
            {hasPhoto ? (
              <img src={state.pet?.photo || ''} alt={state.pet?.name} className="w-full h-full object-cover" />
            ) : (
              <Dog className="w-6 h-6 text-gray-400" />
            )}
          </div>
          {aiConfigured && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-xs animate-pulse">
              ✨
            </div>
          )}
        </div>
        <div>
          <h1 className="font-bold text-lg">{state.pet?.name || 'Pet'}</h1>
          <p className="text-sm text-gray-400">{state.pet?.breed || 'Raça'}</p>
        </div>
      </div>

      <button
        onClick={onSettingsClick}
        className="p-2 text-2xl hover:opacity-80 transition-opacity"
      >
        ⚙️
      </button>
    </header>
  );
}
