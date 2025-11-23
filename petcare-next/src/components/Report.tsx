'use client';

import { useState, useEffect } from 'react';
import { usePet } from '@/context/PetContext';
import { TASKS, HAPPINESS_LEVELS } from '@/lib/constants';
import { Sparkles, TrendingUp, Calendar, FileText, RefreshCw, AlertCircle } from 'lucide-react';

export default function Report() {
  const { state, aiConfigured } = usePet();
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completedTasks = state.done.length;
  const totalTasks = TASKS.length;
  const completionRate = Math.round((completedTasks / totalTasks) * 100);
  const happinessLevel = HAPPINESS_LEVELS.find(l => state.happiness >= l.min);

  // Get notes for today
  const todayNotes = Object.values(state.taskNotes).filter(note => {
    const noteDate = new Date(note.timestamp).toDateString();
    const today = new Date().toDateString();
    return noteDate === today;
  });

  const generateReport = async () => {
    if (!aiConfigured || !state.pet) return;

    setLoading(true);
    setError(null);

    try {
      // Build context for AI
      const completedTaskNames = state.done.map(id => {
        const task = TASKS.find(t => t.id === id);
        return task?.name || id;
      });

      const pendingTaskNames = TASKS.filter(t => !state.done.includes(t.id)).map(t => t.name);

      const notesContext = todayNotes.map(n => {
        const task = TASKS.find(t => t.id === n.taskId);
        return `${task?.name || 'Tarefa'}: ${n.note}`;
      }).join('; ');

      const res = await fetch('/api/ai/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petName: state.pet.name,
          petBreed: state.pet.breed,
          happiness: state.happiness,
          completedTasks: completedTaskNames,
          pendingTasks: pendingTaskNames,
          streak: state.streak,
          points: state.points,
          notes: notesContext,
        }),
      });

      const data = await res.json();
      if (data.report) {
        setReport(data.report);
      } else {
        setError(data.error || 'Não foi possível gerar o relatório');
      }
    } catch (err) {
      setError('Erro ao gerar relatório. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass-card p-4 animate-fadeInUp relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/8 via-transparent to-indigo-400/5 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">Relatório do Dia</h3>
              <p className="text-xs text-[var(--foreground-secondary)]">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span className="text-xs text-[var(--foreground-secondary)]">Progresso</span>
          </div>
          <div className="text-2xl font-bold gradient-text">{completionRate}%</div>
          <div className="text-xs text-[var(--foreground-secondary)]">{completedTasks}/{totalTasks} tarefas</div>
        </div>

        <div className="glass-card p-4 animate-fadeInUp" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{happinessLevel?.emoji}</span>
            <span className="text-xs text-[var(--foreground-secondary)]">Humor</span>
          </div>
          <div className="text-2xl font-bold gradient-text">{Math.round(state.happiness)}</div>
          <div className="text-xs text-[var(--foreground-secondary)]">
            {state.happiness >= 80 ? 'Excelente!' : state.happiness >= 50 ? 'Bom' : 'Precisa atenção'}
          </div>
        </div>
      </div>

      {/* Notes Summary */}
      {todayNotes.length > 0 && (
        <div className="glass-card p-4 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium">Anotações de hoje</span>
            <span className="ml-auto text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full">
              {todayNotes.length}
            </span>
          </div>
          <div className="space-y-2">
            {todayNotes.slice(0, 3).map((note, index) => {
              const task = TASKS.find(t => t.id === note.taskId);
              return (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <span>{task?.emoji || '📝'}</span>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium">{task?.name}: </span>
                    <span className="text-[var(--foreground-secondary)]">{note.note}</span>
                  </div>
                </div>
              );
            })}
            {todayNotes.length > 3 && (
              <p className="text-xs text-[var(--foreground-secondary)]">
                +{todayNotes.length - 3} mais anotações
              </p>
            )}
          </div>
        </div>
      )}

      {/* AI Report Section */}
      {aiConfigured ? (
        <div className="glass-card p-4 animate-fadeInUp" style={{ animationDelay: '250ms' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-medium gradient-text">Análise da IA</span>
            </div>
            <button
              onClick={generateReport}
              disabled={loading}
              className="text-xs px-3 py-1.5 glass-button rounded-lg flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  <span>Gerando...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3 h-3" />
                  <span>{report ? 'Atualizar' : 'Gerar'}</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-400 mb-3">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {report ? (
            <div className="prose prose-sm prose-invert max-w-none">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{report}</p>
            </div>
          ) : !loading && (
            <p className="text-sm text-[var(--foreground-secondary)] text-center py-4">
              Clique em "Gerar" para receber uma análise personalizada sobre o dia de {state.pet?.name}
            </p>
          )}
        </div>
      ) : (
        <div className="glass-card p-4 animate-fadeInUp text-center" style={{ animationDelay: '250ms' }}>
          <Sparkles className="w-8 h-8 text-[var(--foreground-secondary)] mx-auto mb-2" />
          <p className="text-sm text-[var(--foreground-secondary)]">
            Configure a IA nas configurações para receber análises personalizadas
          </p>
        </div>
      )}

      {/* Tips */}
      <div className="glass-card p-4 animate-fadeInUp" style={{ animationDelay: '300ms' }}>
        <h4 className="text-sm font-medium mb-3">Dicas rápidas</h4>
        <ul className="space-y-2 text-sm text-[var(--foreground-secondary)]">
          {completionRate < 50 && (
            <li className="flex items-start gap-2">
              <span>💡</span>
              <span>Complete mais tarefas para manter {state.pet?.name} feliz!</span>
            </li>
          )}
          {state.happiness < 50 && (
            <li className="flex items-start gap-2">
              <span>❤️</span>
              <span>O humor está baixo. Que tal um carinho ou brincadeira?</span>
            </li>
          )}
          {state.streak > 0 && (
            <li className="flex items-start gap-2">
              <span>🔥</span>
              <span>Você está em uma sequência de {state.streak} dias! Continue assim!</span>
            </li>
          )}
          {todayNotes.length === 0 && (
            <li className="flex items-start gap-2">
              <span>📝</span>
              <span>Adicione anotações às tarefas para um relatório mais completo</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
