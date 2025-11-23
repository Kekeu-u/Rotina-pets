'use client';

import { usePet } from '@/context/PetContext';
import { TASKS } from '@/lib/constants';

export default function TaskList() {
  const { state, completeTask, aiConfigured } = usePet();

  const toMins = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const currMins = () => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  };

  const handleTaskClick = async (taskId: string) => {
    const task = TASKS.find(t => t.id === taskId);
    if (!task || state.done.includes(taskId)) return;

    completeTask(taskId);

    // Show AI reaction if configured
    if (aiConfigured && state.pet) {
      try {
        const res = await fetch('/api/ai/pet-reaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            petName: state.pet.name,
            petBreed: state.pet.breed,
            taskName: task.name,
            happiness: state.happiness,
          }),
        });
        const data = await res.json();
        if (data.message) {
          // Show reaction modal - you can implement this
          alert(`${task.emoji} ${data.message}`);
        }
      } catch (error) {
        console.error('Failed to get pet reaction:', error);
      }
    }
  };

  return (
    <div className="space-y-2">
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
                ? 'bg-green-900/20 border-green-700/30 opacity-60'
                : late
                ? 'bg-red-900/20 border-red-700/30 cursor-pointer hover:border-red-600'
                : 'bg-gray-800/50 border-gray-700 cursor-pointer hover:border-indigo-500'
            }`}
          >
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs ${
              done ? 'border-green-500 bg-green-500 text-white' : 'border-gray-600'
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
