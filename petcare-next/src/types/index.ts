export interface Pet {
  name: string;
  breed: string;
  photo: string | null;
}

export interface Task {
  id: string;
  time: string;
  name: string;
  emoji: string;
  pts: number;
}

export interface HistoryItem {
  name: string;
  emoji: string;
  pts: number;
  time: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  badge: string;
  image: string;
  link: string;
}

export interface AppState {
  pet: Pet | null;
  happiness: number;
  done: string[];
  history: HistoryItem[];
  streak: number;
  points: number;
  lastDate: string | null;
  productPreviews: Record<string, string>;
}

export type Screen = 'login' | 'setup' | 'dashboard';
