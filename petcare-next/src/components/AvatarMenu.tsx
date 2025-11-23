'use client';

import { useState, useRef } from 'react';
import { usePet } from '@/context/PetContext';
import { DEFAULT_PHOTO } from '@/lib/constants';
import { Dog, Camera, Trash2, Sparkles, Send } from 'lucide-react';

interface AvatarMenuProps {
  onClose: () => void;
}

export default function AvatarMenu({ onClose }: AvatarMenuProps) {
  const { state, aiConfigured } = usePet();
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasPhoto = state.pet?.photo && state.pet.photo !== DEFAULT_PHOTO;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Process photo - simplified for now
      const reader = new FileReader();
      reader.onload = () => {
        // Update pet photo in state
        // You can add photo processing here
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePromptSubmit = async () => {
    if (!prompt.trim() || !state.pet) return;

    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch('/api/ai/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petName: state.pet.name,
          petBreed: state.pet.breed,
          userPrompt: prompt,
        }),
      });

      const data = await res.json();
      setResponse(data.response || 'Desculpe, não consegui processar.');
      setPrompt('');
    } catch (error) {
      setResponse('Erro ao processar. Tente novamente.');
    } finally {
      setLoading(false);
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
        {/* Avatar Preview with Liquid Ring */}
        <div className="flex flex-col items-center mb-6 relative z-10">
          <div className="liquid-avatar-ring mb-3">
            <div className="w-24 h-24 rounded-full bg-[var(--background)] overflow-hidden flex items-center justify-center">
              {hasPhoto ? (
                <img src={state.pet?.photo || ''} alt={state.pet?.name} className="w-full h-full object-cover" />
              ) : (
                <Dog className="w-12 h-12 text-gray-400" />
              )}
            </div>
          </div>
          <h3 className="font-bold text-xl gradient-text">{state.pet?.name}</h3>
        </div>

        {/* Options */}
        <div className="flex gap-3 mb-6 relative z-10">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 glass-button flex items-center justify-center gap-2 py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Camera className="w-5 h-5 text-indigo-400" />
            <span className="text-sm">Enviar Foto</span>
          </button>
          {hasPhoto && (
            <button
              className="flex-1 glass-button flex items-center justify-center gap-2 py-3 rounded-xl transition-all text-red-400 hover:bg-red-500/10 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Trash2 className="w-5 h-5" />
              <span className="text-sm">Remover</span>
            </button>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handlePhotoUpload}
          accept="image/*"
          className="hidden"
        />

        {/* AI Prompt Section */}
        {aiConfigured && (
          <div className="border-t border-white/10 pt-4 relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm gradient-text font-medium">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Pergunte à IA</span>
              </div>
            </div>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handlePromptSubmit()}
                placeholder="Ex: Dicas de cuidado, brincadeiras..."
                className="flex-1 px-4 py-3 glass-input rounded-xl text-sm"
                maxLength={200}
              />
              <button
                onClick={handlePromptSubmit}
                disabled={loading || !prompt.trim()}
                className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl hover:from-indigo-400 hover:to-purple-400 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            {loading && (
              <div className="glass-task p-4">
                <div className="relative z-10 flex items-center gap-3 text-sm text-gray-400">
                  <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                  Pensando...
                </div>
              </div>
            )}

            {response && (
              <div className="glass-task p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 pointer-events-none"></div>
                <p className="relative z-10 text-sm">{response}</p>
              </div>
            )}
          </div>
        )}

        <p className="text-center text-xs text-gray-500 mt-4 relative z-10">
          Toque fora para fechar
        </p>
      </div>
    </div>
  );
}
