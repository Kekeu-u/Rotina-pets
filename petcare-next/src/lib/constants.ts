import { Task, Product } from '@/types';

export const TASKS: Task[] = [
  { id: 'xixi1', time: '08:30', name: '1º xixi', emoji: '🚽', pts: 10 },
  { id: 'cafe', time: '10:00', name: 'Café', emoji: '🍳', pts: 15 },
  { id: 'almoco', time: '12:00', name: 'Almoço', emoji: '🍖', pts: 15 },
  { id: 'xixi2', time: '13:30', name: '2º xixi', emoji: '🚽', pts: 10 },
  { id: 'xixi3', time: '19:00', name: '3º xixi', emoji: '🚽', pts: 10 },
  { id: 'jantar', time: '22:00', name: 'Jantar', emoji: '🥘', pts: 15 },
  { id: 'xixi4', time: '00:00', name: 'Último xixi', emoji: '🚽', pts: 10 },
];

export const HAPPINESS_LEVELS = [
  { min: 80, emoji: '🤩' },
  { min: 60, emoji: '😄' },
  { min: 40, emoji: '😊' },
  { min: 20, emoji: '😐' },
  { min: 0, emoji: '😢' },
];

export const ACTIONS: Record<string, { name: string; pts: number; emoji: string }> = {
  carinho: { name: 'Carinho', pts: 5, emoji: '🤗' },
  comida: { name: 'Comida', pts: 10, emoji: '🍖' },
  passeio: { name: 'Passeio', pts: 15, emoji: '🦮' },
  agua: { name: 'Água', pts: 5, emoji: '💧' },
  brincar: { name: 'Brincar', pts: 12, emoji: '🎾' },
  banho: { name: 'Banho', pts: 8, emoji: '🛁' },
};

export const SHOP_PRODUCTS: Product[] = [
  {
    id: 'cacto',
    name: 'Cacto Dançante',
    description: 'Toca música e repete fala!',
    price: 'R$ 34,90',
    badge: '🔥 Popular',
    image: 'https://http2.mlstatic.com/D_NQ_NP_2X_622629-MLU72541779498_102023-F.webp',
    link: 'https://www.mercadolivre.com.br/cacto-dancante-e-falante-toca-musica-repete-a-fala-brinquedo/p/MLB22678530',
  },
  {
    id: 'mordedor',
    name: 'Mordedor Escova',
    description: 'Limpa os dentes brincando!',
    price: 'R$ 29,90',
    badge: '🦷 Saúde',
    image: 'https://http2.mlstatic.com/D_NQ_NP_2X_917941-MLB72567498498_102023-F.webp',
    link: 'https://www.mercadolivre.com.br/mordedor-escova-dente-cachorro-brinquedo-resistente-grande-cor-azul/p/MLB29494058',
  },
  {
    id: 'corda',
    name: 'Kit 4 Cordas',
    description: 'Brinquedo resistente!',
    price: 'R$ 39,90',
    badge: '💪 Forte',
    image: 'https://http2.mlstatic.com/D_NQ_NP_2X_806575-MLB53162729498_012023-F.webp',
    link: 'https://produto.mercadolivre.com.br/MLB-3227296476-4-brinquedo-pet-corda-resistente-interativo-cachorro-forte-_JM',
  },
];

export const DEFAULT_PHOTO = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCBmaWxsPSIjMWExYTJlIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSI0MCI+8J+QlTwvdGV4dD48L3N2Zz4=';

export const STORAGE_KEY = 'petcare_v3';
