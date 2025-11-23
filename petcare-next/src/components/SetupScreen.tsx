'use client';

import { useState, useRef } from 'react';
import { usePet } from '@/context/PetContext';
import { DEFAULT_PHOTO } from '@/lib/constants';
import { Check, Loader2, Camera } from 'lucide-react';

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
  const [uploadSuccess, setUploadSuccess] = useState(false);
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
    setUploadSuccess(false);
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
      await sleep(600);
      const optimizedData = await optimizeImage(originalData);
      updateStep('optimize', 'done');

      // Step 2: Analyze (if AI configured and we have name/breed)
      updateStep('analyze', 'active');
      await sleep(500);
      if (aiConfigured && name && breed) {
        const analysis = await analyzePhotoWithAI(name, breed);
        if (analysis) {
          setAnalysisResult(analysis);
        }
      }
      updateStep('analyze', 'done');

      // Step 3: Save
      updateStep('save', 'active');
      await sleep(400);
      setPhoto(optimizedData);
      updateStep('save', 'done');

      // Show success
      setUploadSuccess(true);
      await sleep(1000);

    } catch (error) {
      console.error('Error processing photo:', error);
      alert('Erro ao processar foto. Tente novamente.');
    } finally {
      setIsProcessing(false);
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
      {/* Logo with gradient */}
      <h1 className="text-4xl font-bold gradient-text mb-2 animate-fadeInUp">
        PetCare
      </h1>
      <p className="text-gray-400 mb-8 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
        Configure seu companheiro
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
        {/* Avatar Upload with Liquid Ring */}
        <div className="relative w-32 h-32 mx-auto animate-fadeInUp" style={{ animationDelay: '200ms' }}>
          <div
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            className={`liquid-avatar-ring cursor-pointer transition-all hover:scale-105 active:scale-95 ${
              isProcessing ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            <div className={`w-full h-full rounded-full bg-[var(--background)] flex flex-col items-center justify-center overflow-hidden ${
              !photo ? 'border-2 border-dashed border-gray-600' : ''
            }`}>
              {photo ? (
                <img src={photo} alt="Pet" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Camera className="w-8 h-8 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-400">Adicionar foto</span>
                </>
              )}
            </div>
          </div>

          {/* Success indicator with glow */}
          {photo && !isProcessing && (
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/50">
              <Check className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        {/* Analysis result */}
        {analysisResult && (
          <div className="glass-card p-3 text-center animate-fadeInUp">
            <p className="text-sm gradient-text relative z-10">
              ✨ {analysisResult}
            </p>
          </div>
        )}

        {/* Upload success message */}
        {uploadSuccess && !analysisResult && (
          <p className="text-center text-sm text-emerald-400 animate-fadeInUp">
            ✓ Foto carregada com sucesso!
          </p>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handlePhotoChange}
          accept="image/*"
          capture="environment"
          className="hidden"
        />

        {/* Inputs with Liquid Glass */}
        <div className="animate-fadeInUp" style={{ animationDelay: '300ms' }}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do pet"
            className="w-full px-5 py-4 glass-input text-lg placeholder-gray-500 text-center"
            required
          />
        </div>

        <div className="animate-fadeInUp" style={{ animationDelay: '400ms' }}>
          <input
            type="text"
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
            placeholder="Raça"
            className="w-full px-5 py-3.5 glass-input placeholder-gray-500 text-center"
            required
          />
        </div>

        {/* Submit button with gradient and glow */}
        <button
          type="submit"
          disabled={!name.trim() || !breed.trim()}
          className="w-full px-8 py-4 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl text-white font-semibold text-lg hover:from-indigo-400 hover:to-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] animate-fadeInUp"
          style={{ animationDelay: '500ms' }}
        >
          Começar
        </button>
      </form>

      {/* Processing Modal - Liquid Glass */}
      {isProcessing && (
        <div className="fixed inset-0 glass-backdrop flex items-center justify-center z-[100]">
          <div className="glass-card p-6 max-w-xs w-full mx-4 animate-fadeInUp">
            <h3 className="text-lg font-semibold text-center mb-6 gradient-text relative z-10">Processando foto...</h3>

            <div className="space-y-4 relative z-10">
              {processingSteps.map((step, index) => (
                <div
                  key={step.id}
                  className="flex items-center gap-3"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    step.status === 'done'
                      ? 'bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30'
                      : step.status === 'active'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/30'
                        : 'bg-gray-700/50'
                  }`}>
                    {step.status === 'done' ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : step.status === 'active' ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <div className="w-2 h-2 bg-gray-500 rounded-full" />
                    )}
                  </div>
                  <span className={`text-sm font-medium transition-colors ${
                    step.status === 'done'
                      ? 'text-emerald-400'
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
