'use client';

import { useState, useEffect } from 'react';
import { usePet } from '@/context/PetContext';
import { Task } from '@/types';
import { X, RotateCcw, Check, FileText } from 'lucide-react';

interface TaskModalProps {
  task: Task;
  onClose: () => void;
}

export default function TaskModal({ task, onClose }: TaskModalProps) {
  const { state, completeTask, uncompleteTask, addTaskNote } = usePet();
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const isDone = state.done.includes(task.id);
  const existingNote = state.taskNotes[task.id]?.note || '';

  useEffect(() => {
    setNote(existingNote);
  }, [existingNote]);

  const handleComplete = async () => {
    if (isDone) return;

    setIsSaving(true);
    completeTask(task.id, note || undefined);

    setTimeout(() => {
      setIsSaving(false);
      onClose();
    }, 300);
  };

  const handleUndo = () => {
    uncompleteTask(task.id);
  };

  const handleSaveNote = () => {
    if (note.trim()) {
      addTaskNote(task.id, note.trim());
    }
  };

  return (
    <div
      className="fixed inset-0 glass-backdrop flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="glass-card p-6 max-w-sm w-full animate-fadeInUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{task.emoji}</span>
            <div>
              <h3 className="font-bold text-lg">{task.name}</h3>
              <p className="text-sm text-[var(--foreground-secondary)]">{task.time}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 glass-button rounded-xl hover:scale-105 active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status */}
        <div className={`mb-5 p-3 rounded-xl relative z-10 ${
          isDone
            ? 'bg-emerald-500/15 border border-emerald-500/25'
            : 'bg-indigo-500/15 border border-indigo-500/25'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              isDone ? 'bg-emerald-500' : 'bg-indigo-500/30'
            }`}>
              {isDone && <Check className="w-4 h-4 text-white" />}
            </div>
            <span className={`text-sm font-medium ${isDone ? 'text-emerald-400' : 'text-indigo-400'}`}>
              {isDone ? 'Concluída' : 'Pendente'}
            </span>
            <span className="ml-auto text-sm font-bold text-[var(--foreground-secondary)]">
              +{task.pts} pts
            </span>
          </div>
        </div>

        {/* Note section */}
        <div className="mb-5 relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-[var(--foreground-secondary)]">Anotação</span>
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Adicione uma observação sobre essa tarefa..."
            className="w-full px-4 py-3 glass-input rounded-xl text-sm resize-none h-24"
            maxLength={500}
          />
          {note !== existingNote && note.trim() && (
            <button
              onClick={handleSaveNote}
              className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Salvar anotação
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 relative z-10">
          {isDone ? (
            <>
              <button
                onClick={handleUndo}
                className="flex-1 py-3 glass-button rounded-xl hover:bg-orange-500/10 transition-all flex items-center justify-center gap-2 text-orange-400"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="font-medium">Desfazer</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl hover:from-emerald-400 hover:to-emerald-500 transition-all font-medium shadow-lg shadow-emerald-500/25"
              >
                OK
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="flex-1 py-3 glass-button rounded-xl hover:bg-white/10 transition-all font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleComplete}
                disabled={isSaving}
                className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl hover:from-indigo-400 hover:to-indigo-500 transition-all flex items-center justify-center gap-2 font-medium shadow-lg shadow-indigo-500/25 disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Concluir</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>

        <p className="text-center text-xs text-[var(--foreground-secondary)] mt-4 relative z-10">
          Toque fora para fechar
        </p>
      </div>
    </div>
  );
}
