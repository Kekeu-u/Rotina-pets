'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppState, Pet, HistoryItem, Screen } from '@/types';
import { STORAGE_KEY, TASKS, DEFAULT_PHOTO } from '@/lib/constants';

const PIN_KEY = 'petcare_pin';

interface PetContextType {
  state: AppState;
  screen: Screen;
  aiConfigured: boolean;
  isAuthenticated: boolean;
  hasPin: boolean;
  setScreen: (screen: Screen) => void;
  setPet: (pet: Pet) => void;
  completeTask: (taskId: string) => void;
  doAction: (action: string, pts: number, emoji: string, name: string) => void;
  updateHappiness: (delta: number) => void;
  saveProductPreview: (productId: string, imageData: string) => void;
  createPin: (pin: string) => void;
  verifyPin: (pin: string) => boolean;
  logout: () => void;
  reset: () => void;
}

const defaultState: AppState = {
  pet: null,
  happiness: 50,
  done: [],
  history: [],
  streak: 0,
  points: 0,
  lastDate: null,
  productPreviews: {},
};

const PetContext = createContext<PetContextType | undefined>(undefined);

// Simple hash function for PIN (not cryptographically secure, but ok for this use case)
function hashPin(pin: string): string {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

export function PetProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [screen, setScreen] = useState<Screen>('login');
  const [aiConfigured, setAiConfigured] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasPin, setHasPin] = useState(false);

  // Load state from localStorage
  useEffect(() => {
    // Check if PIN exists
    const storedPin = localStorage.getItem(PIN_KEY);
    setHasPin(!!storedPin);

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setState({ ...defaultState, ...parsed });

      // Check if new day
      const today = new Date().toISOString().split('T')[0];
      if (parsed.lastDate !== today) {
        // New day logic
        const newStreak = parsed.done.length === TASKS.length && parsed.lastDate ? parsed.streak + 1 : parsed.lastDate ? 0 : parsed.streak;
        setState(prev => ({
          ...prev,
          done: [],
          history: [],
          streak: newStreak,
          lastDate: today,
        }));
      }
    }
    setLoaded(true);
  }, []);

  // Check AI configuration
  useEffect(() => {
    fetch('/api/ai/status')
      .then(res => res.json())
      .then(data => setAiConfigured(data.configured))
      .catch(() => setAiConfigured(false));
  }, []);

  // Save state to localStorage
  useEffect(() => {
    if (loaded && isAuthenticated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, loaded, isAuthenticated]);

  // Happiness decay
  useEffect(() => {
    const interval = setInterval(() => {
      if (state.pet && state.happiness > 0 && isAuthenticated) {
        setState(prev => ({
          ...prev,
          happiness: Math.max(0, prev.happiness - 1),
        }));
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [state.pet, state.happiness, isAuthenticated]);

  const createPin = useCallback((pin: string) => {
    const hashed = hashPin(pin);
    localStorage.setItem(PIN_KEY, hashed);
    setHasPin(true);
    setIsAuthenticated(true);

    // If no pet, go to setup, else dashboard
    if (state.pet) {
      setScreen('dashboard');
    } else {
      setScreen('setup');
    }
  }, [state.pet]);

  const verifyPin = useCallback((pin: string): boolean => {
    const storedHash = localStorage.getItem(PIN_KEY);
    const inputHash = hashPin(pin);

    if (storedHash === inputHash) {
      setIsAuthenticated(true);

      // Navigate to appropriate screen
      if (state.pet) {
        setScreen('dashboard');
      } else {
        setScreen('setup');
      }
      return true;
    }
    return false;
  }, [state.pet]);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setScreen('login');
  }, []);

  const setPet = useCallback((pet: Pet) => {
    const today = new Date().toISOString().split('T')[0];
    setState(prev => ({
      ...prev,
      pet,
      lastDate: today,
      happiness: 50,
    }));
    setScreen('dashboard');
  }, []);

  const completeTask = useCallback((taskId: string) => {
    const task = TASKS.find(t => t.id === taskId);
    if (!task || state.done.includes(taskId)) return;

    const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    setState(prev => ({
      ...prev,
      done: [...prev.done, taskId],
      points: prev.points + task.pts,
      happiness: Math.min(100, prev.happiness + task.pts * 0.5),
      history: [...prev.history, { name: task.name, emoji: task.emoji, pts: task.pts, time: now }],
    }));
  }, [state.done]);

  const doAction = useCallback((action: string, pts: number, emoji: string, name: string) => {
    const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    setState(prev => ({
      ...prev,
      points: prev.points + pts,
      happiness: Math.min(100, prev.happiness + pts * 0.5),
      history: [...prev.history, { name, emoji, pts, time: now }],
    }));
  }, []);

  const updateHappiness = useCallback((delta: number) => {
    setState(prev => ({
      ...prev,
      happiness: Math.max(0, Math.min(100, prev.happiness + delta)),
    }));
  }, []);

  const saveProductPreview = useCallback((productId: string, imageData: string) => {
    setState(prev => ({
      ...prev,
      productPreviews: {
        ...prev.productPreviews,
        [productId]: imageData,
      },
    }));
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PIN_KEY);
    setState(defaultState);
    setIsAuthenticated(false);
    setHasPin(false);
    setScreen('login');
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <PetContext.Provider value={{
      state,
      screen,
      aiConfigured,
      isAuthenticated,
      hasPin,
      setScreen,
      setPet,
      completeTask,
      doAction,
      updateHappiness,
      saveProductPreview,
      createPin,
      verifyPin,
      logout,
      reset,
    }}>
      {children}
    </PetContext.Provider>
  );
}

export function usePet() {
  const context = useContext(PetContext);
  if (!context) {
    throw new Error('usePet must be used within a PetProvider');
  }
  return context;
}
