'use client';

import { usePet } from '@/context/PetContext';
import { ACTIONS } from '@/lib/constants';

export default function Actions() {
  const { doAction, aiConfigured, state } = usePet();

  const handleAction = async (key: string) => {
    const action = ACTIONS[key];
    doAction(key, action.pts, action.emoji, action.name);

    // Show AI reaction if configured
    if (aiConfigured && state.pet) {
      try {
        const res = await fetch('/api/ai/pet-reaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            petName: state.pet.name,
            petBreed: state.pet.breed,
            taskName: action.name,
            happiness: state.happiness,
          }),
        });
        const data = await res.json();
        if (data.message) {
          alert(`${action.emoji} ${data.message}`);
        }
      } catch (error) {
        console.error('Failed to get pet reaction:', error);
      }
    }
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      {Object.entries(ACTIONS).map(([key, action]) => (
        <button
          key={key}
          onClick={() => handleAction(key)}
          className="flex flex-col items-center gap-2 p-4 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-indigo-500 hover:bg-indigo-900/20 transition-all active:scale-95"
        >
          <span className="text-3xl">{action.emoji}</span>
          <span className="text-xs text-gray-400">{action.name} +{action.pts}</span>
        </button>
      ))}
    </div>
  );
}
