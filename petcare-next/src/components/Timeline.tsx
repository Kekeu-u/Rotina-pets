'use client';

import { usePet } from '@/context/PetContext';

export default function Timeline() {
  const { state } = usePet();

  if (state.history.length === 0) {
    return (
      <div className="glass-card p-8 text-center animate-fadeInUp">
        <div className="text-4xl mb-3">📋</div>
        <p className="text-gray-400">Nenhuma atividade ainda</p>
        <p className="text-sm text-gray-500 mt-1">Complete tarefas para ver o histórico</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {[...state.history].reverse().slice(0, 10).map((item, index) => (
        <div
          key={index}
          style={{ animationDelay: `${index * 50}ms` }}
          className="glass-task flex items-center gap-3 p-4 animate-fadeInUp"
        >
          {/* Time badge */}
          <span className="text-xs text-gray-400 font-mono px-2 py-1 rounded-full bg-white/5 relative z-10">
            {item.time}
          </span>
          {/* Emoji with glow */}
          <span className="text-2xl relative z-10">{item.emoji}</span>
          {/* Activity name */}
          <span className="flex-1 text-sm relative z-10">{item.name}</span>
          {/* Points badge */}
          <span className="text-sm font-bold text-emerald-400 px-2 py-1 rounded-full bg-emerald-500/10 relative z-10">
            +{item.pts}
          </span>
        </div>
      ))}
    </div>
  );
}
