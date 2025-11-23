'use client';

import { useState } from 'react';
import { usePet } from '@/context/PetContext';
import { ACTIONS } from '@/lib/constants';

export default function Actions() {
  const { doAction, aiConfigured, state } = usePet();
  const [reaction, setReaction] = useState<{ emoji: string; message: string } | null>(null);

  const handleAction = (key: string) => {
    const action = ACTIONS[key];
    doAction(key, action.pts, action.emoji, action.name);

    // Get AI reaction in background (não bloqueia)
    if (aiConfigured && state.pet) {
      fetch('/api/ai/pet-reaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petName: state.pet.name,
          petBreed: state.pet.breed,
          taskName: action.name,
          happiness: state.happiness,
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.message) {
            setReaction({ emoji: action.emoji, message: data.message });
            setTimeout(() => setReaction(null), 3000);
          }
        })
        .catch(err => console.error('AI reaction failed:', err));
    }
  };

  return (
    <div className="relative">
      {/* AI Reaction Toast */}
      {reaction && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 glass-card px-4 py-3 shadow-lg animate-fadeIn max-w-[90%] border-indigo-500/50">
          <p className="text-sm text-center">
            <span className="text-xl mr-2">{reaction.emoji}</span>
            {reaction.message}
          </p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {Object.entries(ACTIONS).map(([key, action]) => (
          <button
            key={key}
            onClick={() => handleAction(key)}
            className="flex flex-col items-center gap-2 p-4 glass-card hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all active:scale-95"
          >
            <span className="text-3xl">{action.emoji}</span>
            <span className="text-xs text-gray-400">{action.name} +{action.pts}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
