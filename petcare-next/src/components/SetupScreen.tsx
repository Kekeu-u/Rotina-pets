'use client';

import { useState, useRef } from 'react';
import { usePet } from '@/context/PetContext';
import { DEFAULT_PHOTO } from '@/lib/constants';
import { Check, Loader2 } from 'lucide-react';

interface ProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'done';
}

export default function SetupScreen() {
  const { setPet, aiConfigured } = usePet();
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([
    { id: 'optimize', label: 'Otimizando imagem', status: 'pending' },
    { id: 'analyze', label: 'Analisando pet', status: 'pending' },
    { id: 'save', label: 'Preparando', status: 'pending' },
  ]);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const optimizeImage = (dataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Max size 400px for avatars
        const maxSize = 400;
        let { width, height } = img;

        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        // Compress to JPEG 80% quality
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = dataUrl;
    });
  };

  const analyzePhotoWithAI = async (petName: string, petBreed: string): Promise<string | null> => {
    if (!aiConfigured) return null;

    try {
      const res = await fetch('/api/ai/analyze-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petName, petBreed }),
      });
      const data = await res.json();
      return data.message || null;
    } catch {
      return null;
    }
  };

  const updateStep = (stepId: string, status: 'pending' | 'active' | 'done') => {
    setProcessingSteps(prev => prev.map(s =>
      s.id === stepId ? { ...s, status } : s
    ));
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setAnalysisResult(null);
    setProcessingSteps([
      { id: 'optimize', label: 'Otimizando imagem', status: 'pending' },
      { id: 'analyze', label: 'Analisando pet', status: 'pending' },
      { id: 'save', label: 'Preparando', status: 'pending' },
    ]);

    try {
      // Read file
      const reader = new FileReader();
      const originalData = await new Promise<string>((resolve, reject) => {
        reader.onload = (ev) => resolve(ev.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Step 1: Optimize
      updateStep('optimize', 'active');
      await sleep(500);
      const optimizedData = await optimizeImage(originalData);
      updateStep('optimize', 'done');

      // Step 2: Analyze (if AI configured and we have name/breed)
      updateStep('analyze', 'active');
      await sleep(400);
      if (aiConfigured && name && breed) {
        const analysis = await analyzePhotoWithAI(name, breed);
        if (analysis) {
          setAnalysisResult(analysis);
        }
      }
      updateStep('analyze', 'done');

      // Step 3: Save
      updateStep('save', 'active');
      await sleep(300);
      setPhoto(optimizedData);
      updateStep('save', 'done');

      // Close modal after a moment
      await sleep(800);
    } catch (error) {
      console.error('Error processing photo:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !breed.trim()) return;

    setPet({
      name: name.trim(),
      breed: breed.trim(),
      photo: photo || DEFAULT_PHOTO,
    });
  };

  return (
    <div className="h-dvh flex flex-col items-center justify-center p-6 safe-area-inset overflow-auto">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-8">
        PetCare
      </h1>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-32 h-32 mx-auto rounded-full bg-gray-800 border-2 border-dashed border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors overflow-hidden"
        >
          {photo ? (
            <img src={photo} alt="Pet" className="w-full h-full object-cover" />
          ) : (
            <>
              <span className="text-4xl">🐕</span>
              <span className="text-xs text-gray-400 mt-1">Adicionar foto</span>
            </>
          )}
        </div>

        {analysisResult && (
          <p className="text-center text-sm text-indigo-400 animate-fadeIn">
            ✨ {analysisResult}
          </p>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handlePhotoChange}
          accept="image/*"
          className="hidden"
        />

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do pet"
          className="w-full px-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-lg placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
          required
        />

        <input
          type="text"
          value={breed}
          onChange={(e) => setBreed(e.target.value)}
          placeholder="Raça"
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
          required
        />

        <button
          type="submit"
          className="w-full px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-white font-semibold text-lg hover:from-indigo-500 hover:to-purple-500 transition-all"
        >
          Começar
        </button>
      </form>

      {/* Processing Modal */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-xs w-full mx-4">
            <h3 className="text-lg font-semibold text-center mb-6">Processando foto...</h3>

            <div className="space-y-4">
              {processingSteps.map((step) => (
                <div key={step.id} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    step.status === 'done'
                      ? 'bg-green-500'
                      : step.status === 'active'
                        ? 'bg-indigo-500'
                        : 'bg-gray-700'
                  }`}>
                    {step.status === 'done' ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : step.status === 'active' ? (
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : (
                      <div className="w-2 h-2 bg-gray-500 rounded-full" />
                    )}
                  </div>
                  <span className={`text-sm ${
                    step.status === 'done'
                      ? 'text-green-400'
                      : step.status === 'active'
                        ? 'text-white'
                        : 'text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
