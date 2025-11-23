'use client';

import { useState } from 'react';
import { usePet } from '@/context/PetContext';
import { HAPPINESS_LEVELS, TASKS } from '@/lib/constants';
import Header from './Header';
import TaskList from './TaskList';
import Actions from './Actions';
import Shop from './Shop';
import Timeline from './Timeline';
import SettingsModal from './SettingsModal';
import AvatarMenu from './AvatarMenu';

type Tab = 'rotina' | 'acoes' | 'loja' | 'historico';

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

      {/* Stats */}
      <div className="flex justify-around px-4 py-2 glass border-b border-white/10 flex-shrink-0">
        <div className="text-center">
          <span className="text-xl">{happinessLevel?.emoji || '😊'}</span>
          <span className="ml-1 text-base font-bold">{Math.round(state.happiness)}</span>
        </div>
        <div className="text-center">
          <span className="text-base font-bold">{state.done.length}/{TASKS.length}</span>
          <span className="text-xs text-gray-400 ml-1">tasks</span>
        </div>
        <div className="text-center">
          <span className="text-base font-bold">{state.streak}</span>
          <span className="text-xs text-gray-400 ml-1">dias</span>
        </div>
        <div className="text-center">
          <span className="text-base font-bold">{state.points}</span>
          <span className="text-xs text-gray-400 ml-1">pts</span>
        </div>
      </div>

      {/* Tabs */}
      <nav className="flex glass border-b border-white/10 flex-shrink-0">
        {(['rotina', 'acoes', 'loja', 'historico'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-sm font-medium transition-all ${
              activeTab === tab
                ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/10'
                : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            {tab === 'loja' ? '🛒 Loja' : tab === 'acoes' ? 'Ações' : tab === 'historico' ? 'Histórico' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-safe">
        {activeTab === 'rotina' && <TaskList />}
        {activeTab === 'acoes' && <Actions />}
        {activeTab === 'loja' && <Shop />}
        {activeTab === 'historico' && <Timeline />}
      </div>

      {/* Modals */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showAvatarMenu && <AvatarMenu onClose={() => setShowAvatarMenu(false)} />}
    </div>
  );
}
