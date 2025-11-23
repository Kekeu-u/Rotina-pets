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

// Database functions
export async function savePetData(userId: string, petData: any) {
  const { data, error } = await supabase
    .from('pets')
    .upsert({
      user_id: userId,
      data: petData,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id'
    });
  return { data, error };
}

export async function getPetData(userId: string) {
  const { data, error } = await supabase
    .from('pets')
    .select('data')
    .eq('user_id', userId)
    .single();
  return { data: data?.data, error };
}
