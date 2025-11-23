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
      {/* AI Reaction Toast - Liquid Glass */}
      {reaction && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 glass-card px-5 py-4 animate-fadeInUp max-w-[90%] shadow-2xl shadow-indigo-500/20">
          <div className="relative z-10 flex items-center gap-3">
            <span className="text-2xl">{reaction.emoji}</span>
            <p className="text-sm">{reaction.message}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {Object.entries(ACTIONS).map(([key, action], index) => (
          <button
            key={key}
            onClick={() => handleAction(key)}
            style={{ animationDelay: `${index * 75}ms` }}
            className="glass-action flex flex-col items-center gap-2 p-4 animate-fadeInUp group"
          >
            <span className="text-3xl relative z-10 group-hover:scale-110 transition-transform duration-300">
              {action.emoji}
            </span>
            <div className="relative z-10 text-center">
              <span className="text-xs text-gray-300 block">{action.name}</span>
              <span className="text-xs font-bold text-emerald-400">+{action.pts}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
