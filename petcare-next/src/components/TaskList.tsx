'use client';

import { useState } from 'react';
import { usePet } from '@/context/PetContext';
import { TASKS } from '@/lib/constants';

export default function TaskList() {
  const { state, completeTask, aiConfigured } = usePet();
  const [reaction, setReaction] = useState<{ emoji: string; message: string } | null>(null);

  const toMins = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const currMins = () => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  };

  const handleTaskClick = (taskId: string) => {
    const task = TASKS.find(t => t.id === taskId);
    if (!task || state.done.includes(taskId)) return;

    // Complete task immediately (não bloqueia)
    completeTask(taskId);

    // Get AI reaction in background (opcional)
    if (aiConfigured && state.pet) {
      fetch('/api/ai/pet-reaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petName: state.pet.name,
          petBreed: state.pet.breed,
          taskName: task.name,
          happiness: state.happiness,
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.message) {
            setReaction({ emoji: task.emoji, message: data.message });
            setTimeout(() => setReaction(null), 3000);
          }
        })
        .catch(err => console.error('AI reaction failed:', err));
    }
  };

  return (
    <div className="space-y-3 relative">
      {/* AI Reaction Toast - Liquid Glass */}
      {reaction && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 glass-card px-5 py-4 animate-fadeInUp max-w-[90%] shadow-2xl shadow-indigo-500/20">
          <div className="relative z-10 flex items-center gap-3">
            <span className="text-2xl">{reaction.emoji}</span>
            <p className="text-sm">{reaction.message}</p>
          </div>
        </div>
      )}

      {TASKS.map((task, index) => {
        const done = state.done.includes(task.id);
        const c = currMins();
        const late = !done && (task.time === '00:00' ? c < 60 : c > toMins(task.time) + 30);

        return (
          <div
            key={task.id}
            onClick={() => !done && handleTaskClick(task.id)}
            style={{ animationDelay: `${index * 50}ms` }}
            className={`glass-task flex items-center gap-3 p-4 transition-all animate-fadeInUp ${
              done
                ? 'opacity-60'
                : late
                ? 'cursor-pointer'
                : 'cursor-pointer'
            }`}
          >
            {/* Status indicator line */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${
              done ? 'bg-gradient-to-b from-emerald-400 to-emerald-600' :
              late ? 'bg-gradient-to-b from-red-400 to-red-600' :
              'bg-gradient-to-b from-indigo-400 to-purple-500'
            }`}></div>

            {/* Checkbox */}
            <div className={`relative w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              done
                ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                : 'border-2 border-gray-500/50 group-hover:border-indigo-500'
            }`}>
              {done && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>

            {/* Task info */}
            <div className="flex-1 min-w-0">
              <div className={`font-medium flex items-center gap-2 ${done ? 'line-through opacity-70' : ''}`}>
                <span className="text-xl">{task.emoji}</span>
                <span className="truncate">{task.name}</span>
              </div>
              <div className={`text-sm ${late ? 'text-red-400' : 'text-gray-400'}`}>
                {task.time}
                {late && <span className="ml-2 text-xs">• Atrasado</span>}
              </div>
            </div>

            {/* Points badge */}
            <div className={`px-3 py-1 rounded-full text-sm font-bold ${
              done
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-indigo-500/20 text-indigo-400'
            }`}>
              +{task.pts}
            </div>
          </div>
        );
      })}
    </div>
  );
}
