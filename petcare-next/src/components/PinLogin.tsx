'use client';

import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface PinLoginProps {
  mode: 'create' | 'verify';
  onSuccess: (pin: string) => void;
}

export default function PinLogin({ mode, onSuccess }: PinLoginProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');

  const handlePinChange = (value: string, isConfirm = false) => {
    // Only allow numbers, max 6 digits
    const cleaned = value.replace(/\D/g, '').slice(0, 6);
    if (isConfirm) {
      setConfirmPin(cleaned);
    } else {
      setPin(cleaned);
    }
    setError('');
  };

  const handleSubmit = () => {
    if (pin.length < 4) {
      setError('PIN deve ter pelo menos 4 dígitos');
      return;
    }

    if (mode === 'create') {
      if (step === 'enter') {
        setStep('confirm');
        return;
      }

      if (pin !== confirmPin) {
        setError('PINs não conferem');
        setConfirmPin('');
        return;
      }
    }

    onSuccess(pin);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
          <Lock className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
          PetCare
        </h1>
        <p className="text-gray-400">
          {mode === 'create'
            ? (step === 'enter' ? 'Crie um PIN para proteger seus dados' : 'Confirme seu PIN')
            : 'Digite seu PIN para acessar'
          }
        </p>
      </div>

      <div className="w-full max-w-xs space-y-4">
        <div className="relative">
          <input
            type={showPin ? 'text' : 'password'}
            value={step === 'confirm' ? confirmPin : pin}
            onChange={(e) => handlePinChange(e.target.value, step === 'confirm')}
            onKeyPress={handleKeyPress}
            placeholder={step === 'confirm' ? 'Confirme o PIN' : 'Digite o PIN'}
            className="w-full px-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-center text-2xl tracking-widest placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            maxLength={6}
            inputMode="numeric"
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShowPin(!showPin)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {/* PIN dots indicator */}
        <div className="flex justify-center gap-2">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-colors ${
                (step === 'confirm' ? confirmPin : pin).length > i
                  ? 'bg-indigo-500'
                  : 'bg-gray-700'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={(step === 'confirm' ? confirmPin : pin).length < 4}
          className="w-full px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-white font-semibold text-lg hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mode === 'create'
            ? (step === 'enter' ? 'Continuar' : 'Criar PIN')
            : 'Entrar'
          }
        </button>

        {mode === 'create' && step === 'confirm' && (
          <button
            onClick={() => {
              setStep('enter');
              setConfirmPin('');
            }}
            className="w-full py-2 text-gray-400 hover:text-white transition-colors"
          >
            Voltar
          </button>
        )}

        <p className="text-center text-xs text-gray-500 mt-6">
          {mode === 'create'
            ? 'Seu PIN será usado para proteger seus dados neste dispositivo'
            : 'Seus dados ficam salvos apenas neste dispositivo'
          }
        </p>
      </div>
    </div>
  );
}
