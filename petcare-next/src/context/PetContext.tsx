'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { AppState, Pet, Screen } from '@/types';
import { TASKS } from '@/lib/constants';
import {
  supabase,
  signUp,
  signIn,
  signOut,
  getDevice,
  updateDevice,
  getOrCreateDevice,
  getTodayStats,
  upsertTodayStats,
  getYesterdayStats
} from '@/lib/supabase';

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
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
        loadUserData(session.user.email || session.user.id);
      } else {
        setLoaded(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);
      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
        await loadUserData(session.user.email || session.user.id);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setState(defaultState);
        setScreen('login');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load user data from Supabase (devices + device_stats)
  const loadUserData = async (deviceId: string) => {
    try {
      // Get or create device
      await getOrCreateDevice(deviceId);

      // Get device info (pet data)
      const { data: deviceData } = await getDevice(deviceId);

      // Get today's stats
      const { data: todayStats } = await getTodayStats(deviceId);

      // Get yesterday's stats for streak calculation
      const { data: yesterdayStats } = await getYesterdayStats(deviceId);

      let loadedState = { ...defaultState };

      // Load pet from device
      if (deviceData && deviceData.name) {
        loadedState.pet = {
          name: deviceData.name,
          breed: deviceData.breed || '',
          photo: deviceData.photo_data || '',
        };
      }

      // Load today's stats
      if (todayStats) {
        loadedState.happiness = todayStats.happiness || 50;
        loadedState.points = todayStats.points || 0;
        loadedState.streak = todayStats.streak || 0;
        loadedState.done = todayStats.completed_tasks || [];
        loadedState.lastDate = todayStats.date;
      } else {
        // New day - calculate streak from yesterday
        if (yesterdayStats) {
          const yesterdayTasks = yesterdayStats.completed_tasks || [];
          const completedAllYesterday = yesterdayTasks.length === TASKS.length;
          loadedState.streak = completedAllYesterday ? (yesterdayStats.streak || 0) + 1 : 0;
          loadedState.points = yesterdayStats.points || 0; // Carry over points
        }
        loadedState.lastDate = new Date().toISOString().split('T')[0];
      }

      setState(loadedState);
      setScreen(loadedState.pet ? 'dashboard' : 'setup');
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
      const deviceId = user.email || user.id;

      const timeout = setTimeout(() => {
        // Save stats
        upsertTodayStats(deviceId, {
          happiness: state.happiness,
          points: state.points,
          streak: state.streak,
          completed_tasks: state.done,
        }).catch(err => {
          console.error('Failed to save stats:', err);
        });
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [state.happiness, state.points, state.streak, state.done, loaded, isAuthenticated, user]);

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
      await loadUserData(data.user.email || data.user.id);
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

  const setPet = useCallback(async (pet: Pet) => {
    const today = new Date().toISOString().split('T')[0];
    setState(prev => ({
      ...prev,
      pet,
      lastDate: today,
      happiness: 50,
    }));
    setScreen('dashboard');

    // Save pet to devices table
    if (user) {
      const deviceId = user.email || user.id;
      await updateDevice(deviceId, {
        name: pet.name,
        breed: pet.breed,
        photo_data: pet.photo,
      });
    }
  }, [user]);

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
      const deviceId = user.email || user.id;
      await updateDevice(deviceId, { name: '', breed: '', photo_data: '' });
      await upsertTodayStats(deviceId, {
        happiness: 50,
        points: 0,
        streak: 0,
        completed_tasks: [],
      });
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
