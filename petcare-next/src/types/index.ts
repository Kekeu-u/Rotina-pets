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

export interface TaskNote {
  taskId: string;
  note: string;
  timestamp: string;
  completedAt?: string;
}

export interface HistoryItem {
  name: string;
  emoji: string;
  pts: number;
  time: string;
  note?: string;
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

// Produto customizado adicionado pelo usuário via link do Mercado Livre
export interface CustomProduct {
  id: string;
  url: string;
  title: string;
  description: string;
  image: string;
  price?: string;
  addedAt: string;
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
  taskNotes: Record<string, TaskNote>;
  customProducts: CustomProduct[];
}

export type Screen = 'login' | 'setup' | 'dashboard';
