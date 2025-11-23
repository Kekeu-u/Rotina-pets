import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth functions
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// Device/Pet functions - usando sua schema existente
export async function getOrCreateDevice(deviceId: string) {
  // Try to get existing device
  const { data: existing } = await supabase
    .from('devices')
    .select('*')
    .eq('device_id', deviceId)
    .single();

  if (existing) {
    return { data: existing, error: null };
  }

  // Create new device
  const { data, error } = await supabase
    .from('devices')
    .insert({ device_id: deviceId, name: '' })
    .select()
    .single();

  return { data, error };
}

export async function updateDevice(deviceId: string, updates: {
  name?: string;
  breed?: string;
  photo_data?: string;
}) {
  const { data, error } = await supabase
    .from('devices')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('device_id', deviceId)
    .select()
    .single();

  return { data, error };
}

export async function getDevice(deviceId: string) {
  const { data, error } = await supabase
    .from('devices')
    .select('*')
    .eq('device_id', deviceId)
    .single();

  return { data, error };
}

// Stats functions - estatísticas diárias por device
export async function getTodayStats(deviceId: string) {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('device_stats')
    .select('*')
    .eq('device_id', deviceId)
    .eq('date', today)
    .single();

  return { data, error };
}

export async function upsertTodayStats(deviceId: string, stats: {
  happiness?: number;
  points?: number;
  streak?: number;
  completed_tasks?: string[];
}) {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('device_stats')
    .upsert({
      device_id: deviceId,
      date: today,
      ...stats,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'device_id,date'
    })
    .select()
    .single();

  return { data, error };
}

export async function getYesterdayStats(deviceId: string) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('device_stats')
    .select('*')
    .eq('device_id', deviceId)
    .eq('date', yesterdayStr)
    .single();

  return { data, error };
}
