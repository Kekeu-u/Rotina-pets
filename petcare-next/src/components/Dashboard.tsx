'use client';

import { useState } from 'react';
import { usePet } from '@/context/PetContext';
import { HAPPINESS_LEVELS, TASKS } from '@/lib/constants';
import Header from './Header';
import TaskList from './TaskList';
import Actions from './Actions';
import Shop from './Shop';
import Timeline from './Timeline';
import Report from './Report';
import SettingsModal from './SettingsModal';
import AvatarMenu from './AvatarMenu';

type Tab = 'rotina' | 'acoes' | 'relatorio' | 'loja';

export default function Dashboard() {
  const { state } = usePet();
  const [activeTab, setActiveTab] = useState<Tab>('rotina');
  const [showSettings, setShowSettings] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);

  const happinessLevel = HAPPINESS_LEVELS.find(l => state.happiness >= l.min);

  return (
    <div className="h-dvh flex flex-col safe-area-inset">
      <Header
        onSettingsClick={() => setShowSettings(true)}
        onAvatarClick={() => setShowAvatarMenu(true)}
      />

      {/* Stats - Liquid Glass Style */}
      <div className="flex justify-around px-4 py-3 glass flex-shrink-0 relative z-10">
        <div className="flex flex-col items-center min-w-[60px]">
          <span className="text-2xl mb-0.5">{happinessLevel?.emoji || '😊'}</span>
          <span className="text-sm font-bold gradient-text">{Math.round(state.happiness)}</span>
          <span className="text-[10px] text-[var(--foreground-secondary)] uppercase tracking-wide">humor</span>
        </div>
        <div className="flex flex-col items-center min-w-[60px]">
          <span className="text-lg font-bold text-indigo-400">{state.done.length}/{TASKS.length}</span>
          <span className="text-[10px] text-[var(--foreground-secondary)] uppercase tracking-wide">tarefas</span>
        </div>
        <div className="flex flex-col items-center min-w-[60px]">
          <span className="text-lg font-bold text-indigo-400">{state.streak}</span>
          <span className="text-[10px] text-[var(--foreground-secondary)] uppercase tracking-wide">dias</span>
        </div>
        <div className="flex flex-col items-center min-w-[60px]">
          <span className="text-lg font-bold text-emerald-400">{state.points}</span>
          <span className="text-[10px] text-[var(--foreground-secondary)] uppercase tracking-wide">pontos</span>
        </div>
      </div>

      {/* Tabs - Liquid Glass Pills */}
      <nav className="flex gap-2 px-4 py-3 glass flex-shrink-0 relative z-10">
        {(['rotina', 'acoes', 'relatorio', 'loja'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 px-2 text-sm font-medium rounded-xl transition-all duration-300 ${
              activeTab === tab
                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'glass-button text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
            }`}
          >
            {tab === 'loja' ? '🛒' : tab === 'acoes' ? 'Ações' : tab === 'relatorio' ? '📊' : 'Rotina'}
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-safe">
        {activeTab === 'rotina' && <TaskList />}
        {activeTab === 'acoes' && <Actions />}
        {activeTab === 'relatorio' && <Report />}
        {activeTab === 'loja' && <Shop />}
      </div>

      {/* Modals */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showAvatarMenu && <AvatarMenu onClose={() => setShowAvatarMenu(false)} />}
    </div>
  );
}
