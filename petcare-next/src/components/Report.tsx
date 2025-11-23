'use client';

import { useState } from 'react';
import { usePet } from '@/context/PetContext';
import { TASKS, HAPPINESS_LEVELS } from '@/lib/constants';
import { Sparkles, TrendingUp, Calendar, FileText, RefreshCw, AlertCircle, Target, Lightbulb, Activity, Heart } from 'lucide-react';

interface AnalysisData {
  summary: string;
  insights: string[];
  recommendations: string[];
  healthScore: number;
  mood: string;
}

interface ReportResponse {
  report: string;
  analysis?: AnalysisData;
  provider: 'groq' | 'pollinations';
}

export default function Report() {
  const { state, aiConfigured } = usePet();
  const [report, setReport] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
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

      // Incluir histórico de atividades para análise mais completa
      const historyData = state.history.map(h => ({
        name: h.name,
        pts: h.pts,
        time: h.time,
        note: h.note,
      }));

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
          history: historyData,
        }),
      });

      const data: ReportResponse = await res.json();

      if (data.report) {
        setReport(data.report);
        setAnalysis(data.analysis || null);
        setProvider(data.provider || null);
      } else {
        setError((data as any).error || 'Não foi possível gerar o relatório');
      }
    } catch (err) {
      setError('Erro ao gerar relatório. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getHealthScoreBg = (score: number) => {
    if (score >= 80) return 'from-green-500/20 to-green-600/10';
    if (score >= 60) return 'from-yellow-500/20 to-yellow-600/10';
    if (score >= 40) return 'from-orange-500/20 to-orange-600/10';
    return 'from-red-500/20 to-red-600/10';
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
              {provider && (
                <span className="text-[10px] px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full">
                  {provider === 'groq' ? 'Llama 3.3' : 'Pollinations'}
                </span>
              )}
            </div>
            <button
              onClick={generateReport}
              disabled={loading}
              className="text-xs px-3 py-1.5 glass-button rounded-lg flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  <span>Analisando...</span>
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

          {/* Structured Analysis (when available from Groq) */}
          {analysis ? (
            <div className="space-y-4">
              {/* Health Score Card */}
              <div className={`rounded-xl p-4 bg-gradient-to-br ${getHealthScoreBg(analysis.healthScore)}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-400" />
                    <span className="font-medium">Bem-estar</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{analysis.mood}</span>
                    <span className={`text-2xl font-bold ${getHealthScoreColor(analysis.healthScore)}`}>
                      {analysis.healthScore}
                    </span>
                    <span className="text-sm text-[var(--foreground-secondary)]">/100</span>
                  </div>
                </div>
                <p className="text-sm leading-relaxed">{analysis.summary}</p>
              </div>

              {/* Insights */}
              {analysis.insights.length > 0 && (
                <div className="rounded-xl p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/5">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-blue-400" />
                    <span className="font-medium text-sm">Insights</span>
                  </div>
                  <ul className="space-y-2">
                    {analysis.insights.map((insight, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-blue-400 mt-0.5">•</span>
                        <span className="text-[var(--foreground-secondary)]">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {analysis.recommendations.length > 0 && (
                <div className="rounded-xl p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/5">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <span className="font-medium text-sm">Recomendações</span>
                  </div>
                  <ul className="space-y-2">
                    {analysis.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-amber-400 mt-0.5">•</span>
                        <span className="text-[var(--foreground-secondary)]">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : report ? (
            /* Simple text report (Pollinations fallback) */
            <div className="prose prose-sm prose-invert max-w-none">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{report}</p>
            </div>
          ) : !loading && (
            <div className="text-center py-6">
              <Heart className="w-12 h-12 text-indigo-400/30 mx-auto mb-3" />
              <p className="text-sm text-[var(--foreground-secondary)]">
                Clique em "Gerar" para receber uma análise personalizada
              </p>
              <p className="text-xs text-[var(--foreground-secondary)] mt-1">
                Análise de {state.pet?.name} com IA
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-card p-4 animate-fadeInUp text-center" style={{ animationDelay: '250ms' }}>
          <Sparkles className="w-8 h-8 text-[var(--foreground-secondary)] mx-auto mb-2" />
          <p className="text-sm text-[var(--foreground-secondary)]">
            A IA está sempre disponível para gerar análises personalizadas
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
