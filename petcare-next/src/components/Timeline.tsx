'use client';

import { usePet } from '@/context/PetContext';

export default function Timeline() {
  const { state } = usePet();

  if (state.history.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        Nenhuma atividade
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {[...state.history].reverse().slice(0, 10).map((item, index) => (
        <div
          key={index}
          className="flex items-center gap-3 p-3 bg-gray-800/50 border border-gray-700 rounded-xl"
        >
          <span className="text-sm text-gray-400 w-12">{item.time}</span>
          <span className="text-xl">{item.emoji}</span>
          <span className="flex-1 text-sm">{item.name}</span>
          <span className="text-sm text-green-400 font-medium">+{item.pts}</span>
        </div>
      ))}
    </div>
  );
}
