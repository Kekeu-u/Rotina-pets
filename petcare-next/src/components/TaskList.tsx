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
    <div className="space-y-2 relative">
      {/* AI Reaction Toast */}
      {reaction && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 glass-card px-4 py-3 shadow-lg animate-fadeIn max-w-[90%] border-indigo-500/50">
          <p className="text-sm text-center">
            <span className="text-xl mr-2">{reaction.emoji}</span>
            {reaction.message}
          </p>
        </div>
      )}

      {TASKS.map((task) => {
        const done = state.done.includes(task.id);
        const c = currMins();
        const late = !done && (task.time === '00:00' ? c < 60 : c > toMins(task.time) + 30);

        return (
          <div
            key={task.id}
            onClick={() => !done && handleTaskClick(task.id)}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
              done
                ? 'glass border-green-500/30 opacity-60'
                : late
                ? 'glass border-red-500/30 cursor-pointer hover:border-red-500/60'
                : 'glass-card cursor-pointer hover:border-indigo-500/50'
            }`}
          >
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs ${
              done ? 'border-green-500 bg-green-500 text-white' : 'border-gray-500'
            }`}>
              {done && '✓'}
            </div>

            <div className="flex-1">
              <div className="font-medium">
                {task.emoji} {task.name}
              </div>
              <div className="text-sm text-gray-400">{task.time}</div>
            </div>

            <div className={`text-sm font-medium ${done ? 'text-green-400' : 'text-indigo-400'}`}>
              +{task.pts}
            </div>
          </div>
        );
      })}
    </div>
  );
}
