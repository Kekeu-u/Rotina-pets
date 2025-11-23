'use client';

import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface AuthScreenProps {
  onSuccess: () => void;
  onSignUp: (email: string, password: string) => Promise<{ error: any }>;
  onSignIn: (email: string, password: string) => Promise<{ error: any }>;
  onGoogleSignIn?: () => Promise<{ error: any }>;
}

export default function AuthScreen({ onSuccess, onSignUp, onSignIn, onGoogleSignIn }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleGoogleSignIn = async () => {
    if (!onGoogleSignIn) return;
    setError('');
    setGoogleLoading(true);
    try {
      const { error } = await onGoogleSignIn();
      if (error) {
        setError(error.message || 'Erro ao entrar com Google');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao entrar com Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Preencha todos os campos');
      return;
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setError('Senha deve ter pelo menos 6 caracteres');
        return;
      }
      if (password !== confirmPassword) {
        setError('Senhas não conferem');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await onSignUp(email, password);
        if (error) {
          if (error.message.includes('already registered')) {
            setError('Email já cadastrado');
          } else {
            setError(error.message);
          }
        } else {
          setSuccess('Conta criada! Verifique seu email para confirmar.');
          setMode('login');
        }
      } else {
        const { error } = await onSignIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login')) {
            setError('Email ou senha incorretos');
          } else {
            setError(error.message);
          }
        } else {
          onSuccess();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-dvh flex flex-col items-center justify-center p-6 safe-area-inset overflow-auto">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🐕</div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
          PetCare
        </h1>
        <p className="text-gray-400">
          {mode === 'login' ? 'Entre na sua conta' : 'Crie sua conta'}
        </p>
      </div>

      {/* Google Sign In Button */}
      {onGoogleSignIn && (
        <div className="w-full max-w-sm mb-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full py-3 bg-white hover:bg-gray-100 border border-gray-300 rounded-xl text-gray-700 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {googleLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                <span>Conectando...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continuar com Google</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-700"></div>
            <span className="text-gray-500 text-sm">ou</span>
            <div className="flex-1 h-px bg-gray-700"></div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4" autoComplete="on">
        {/* Email */}
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="email"
            name="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            autoComplete="email"
            autoFocus
          />
        </div>

        {/* Password */}
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            className="w-full pl-10 pr-10 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {/* Confirm Password (signup only) */}
        {mode === 'signup' && (
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmar senha"
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
              autoComplete="new-password"
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded-lg">
            {error}
          </p>
        )}

        {/* Success */}
        {success && (
          <p className="text-green-400 text-sm text-center bg-green-900/20 p-2 rounded-lg">
            {success}
          </p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Carregando...</span>
            </>
          ) : mode === 'login' ? (
            'Entrar'
          ) : (
            'Criar Conta'
          )}
        </button>

        {/* Toggle Mode */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError('');
              setSuccess('');
            }}
            className="text-indigo-400 hover:text-indigo-300 text-sm"
          >
            {mode === 'login' ? 'Não tem conta? Criar agora' : 'Já tem conta? Entrar'}
          </button>
        </div>
      </form>

      <p className="text-xs text-gray-500 mt-8 text-center">
        Seus dados ficam salvos na nuvem<br />
        e sincronizam entre dispositivos
      </p>
    </div>
  );
}
