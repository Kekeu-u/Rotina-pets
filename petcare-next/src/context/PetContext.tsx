'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { AppState, Pet, Screen } from '@/types';
import { STORAGE_KEY, TASKS } from '@/lib/constants';
import { supabase, savePetData, getPetData, signUp, signIn, signOut } from '@/lib/supabase';

interface PetContextType {
  loaded: boolean;
  state: AppState;
  screen: Screen;
  aiConfigured: boolean;
  isAuthenticated: boolean;
  user: User | null;
  setScreen: (screen: Screen) => void;
  setPet: (pet: Pet) => void;
  completeTask: (taskId: string) => void;
  doAction: (action: string, pts: number, emoji: string, name: string) => void;
  updateHappiness: (delta: number) => void;
  saveProductPreview: (productId: string, imageData: string) => void;
  handleSignUp: (email: string, password: string) => Promise<{ error: any }>;
  handleSignIn: (email: string, password: string) => Promise<{ error: any }>;
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

export function PetProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [screen, setScreen] = useState<Screen>('login');
  const [aiConfigured, setAiConfigured] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Listen to auth state changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
        loadUserData(session.user.id);
      } else {
        setLoaded(true);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);
      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
        await loadUserData(session.user.id);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setState(defaultState);
        setScreen('login');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load user data from Supabase
  const loadUserData = async (userId: string) => {
    try {
      const { data, error } = await getPetData(userId);

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading pet data:', error);
      }

      if (data) {
        const today = new Date().toISOString().split('T')[0];
        let loadedState = { ...defaultState, ...data };

        // Check if new day - reset daily tasks
        if (loadedState.lastDate !== today) {
          const newStreak = loadedState.done.length === TASKS.length && loadedState.lastDate
            ? loadedState.streak + 1
            : loadedState.lastDate ? 0 : loadedState.streak;

          loadedState = {
            ...loadedState,
            done: [],
            history: [],
            streak: newStreak,
            lastDate: today,
          };
        }

        setState(loadedState);
        setScreen(loadedState.pet ? 'dashboard' : 'setup');
      } else {
        // New user, no data yet
        setState(defaultState);
        setScreen('setup');
      }
    } catch (err) {
      console.error('Failed to load user data:', err);
      setState(defaultState);
      setScreen('setup');
    } finally {
      setLoaded(true);
    }
  };

  // Save state to Supabase when it changes
  useEffect(() => {
    if (loaded && isAuthenticated && user) {
      // Debounce saves to avoid too many requests
      const timeout = setTimeout(() => {
        savePetData(user.id, state).catch(err => {
          console.error('Failed to save pet data:', err);
        });
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [state, loaded, isAuthenticated, user]);

  // Check AI configuration
  useEffect(() => {
    fetch('/api/ai/status')
      .then(res => res.json())
      .then(data => setAiConfigured(data.configured))
      .catch(() => setAiConfigured(false));
  }, []);

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

  const handleSignUp = useCallback(async (email: string, password: string) => {
    const { data, error } = await signUp(email, password);

    if (!error && data.user) {
      // Auto-login after signup if email confirmation is disabled
      if (data.session) {
        setUser(data.user);
        setIsAuthenticated(true);
        setScreen('setup');
      }
    }

    return { error };
  }, []);

  const handleSignIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await signIn(email, password);

    if (!error && data.user) {
      setUser(data.user);
      setIsAuthenticated(true);
      await loadUserData(data.user.id);
    }

    return { error };
  }, []);

  const logout = useCallback(async () => {
    await signOut();
    setUser(null);
    setIsAuthenticated(false);
    setState(defaultState);
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

  const reset = useCallback(async () => {
    if (user) {
      await savePetData(user.id, defaultState);
    }
    setState(defaultState);
    setScreen('setup');
  }, [user]);

  return (
    <PetContext.Provider value={{
      loaded,
      state,
      screen,
      aiConfigured,
      isAuthenticated,
      user,
      setScreen,
      setPet,
      completeTask,
      doAction,
      updateHappiness,
      saveProductPreview,
      handleSignUp,
      handleSignIn,
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
