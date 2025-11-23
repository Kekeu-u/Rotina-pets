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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full border border-gray-700" onClick={(e) => e.stopPropagation()}>
        {/* Avatar Preview */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gray-800 border-2 border-indigo-500 overflow-hidden flex items-center justify-center mb-3">
            {hasPhoto ? (
              <img src={state.pet?.photo || ''} alt={state.pet?.name} className="w-full h-full object-cover" />
            ) : (
              <Dog className="w-12 h-12 text-gray-400" />
            )}
          </div>
          <h3 className="font-bold text-lg">{state.pet?.name}</h3>
        </div>

        {/* Options */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-800 border border-gray-700 rounded-xl hover:border-indigo-500 transition-colors"
          >
            <Camera className="w-5 h-5" />
            <span className="text-sm">Enviar Foto</span>
          </button>
          {hasPhoto && (
            <button
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-800 border border-gray-700 rounded-xl hover:border-red-500 transition-colors text-red-400"
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
          <div className="border-t border-gray-700 pt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm text-purple-400">
                <Sparkles className="w-4 h-4" />
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
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                maxLength={200}
              />
              <button
                onClick={handlePromptSubmit}
                disabled={loading || !prompt.trim()}
                className="p-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            {loading && (
              <div className="p-3 bg-gray-800 rounded-lg text-sm text-gray-400">
                Pensando...
              </div>
            )}

            {response && (
              <div className="p-3 bg-indigo-900/30 border border-indigo-700/30 rounded-lg text-sm">
                {response}
              </div>
            )}
          </div>
        )}

        <p className="text-center text-xs text-gray-500 mt-4">
          Toque fora para fechar
        </p>
      </div>
    </div>
  );
}
