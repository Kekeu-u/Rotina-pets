# PetCare Wellness App - Documentacao Base

> Template de referencia para projetos futuros baseados nesta arquitetura.

---

## 1. Visao Geral

| Item | Valor |
|------|-------|
| **Nome** | PetCare (Rotina Pets) |
| **Tipo** | App de gerenciamento de cuidados com pets gamificado |
| **Plataforma** | Mobile-first PWA |
| **Idioma** | Portugues (BR) |
| **Framework** | Next.js 16 + React 19 |

---

## 2. Tech Stack Completa

### Core
```
- Next.js v16.0.3 (App Router)
- React v19.2.0
- TypeScript v5
- Node.js (API routes server-side)
```

### Estilizacao
```
- Tailwind CSS v4 (@tailwindcss/postcss)
- PostCSS v4
- Design System: "Liquid Glass" (glassmorphism)
```

### UI & Animacoes
```
- Lucide React v0.554.0 (icones)
- Anime.js v4.2.2 (animacoes)
```

### Backend & Database
```
- Supabase v2.84.0 (BaaS)
  - PostgreSQL
  - Auth (email/senha, Google OAuth)
  - Row-Level Security (RLS)
- @supabase/ssr v0.7.0
```

### AI/ML APIs
```
- Groq LLM API (Llama 3.3 70B, Llama 3.1 8B, Mixtral)
- Google Gemini API (texto + visao)
- Pollinations.ai (imagens gratuitas - Flux, Turbo)
```

---

## 3. Estrutura de Pastas

```
petcare-next/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/ai/             # API routes de IA
│   │   │   ├── report/         # Relatorio diario
│   │   │   ├── pet-reaction/   # Reacoes do pet
│   │   │   ├── pet-with-product/  # Geracao de imagens
│   │   │   ├── analyze-photo/  # Analise de fotos
│   │   │   ├── combine-images/ # Analise multi-imagem
│   │   │   ├── daily-tip/      # Dicas diarias
│   │   │   ├── prompt/         # Geracao de texto
│   │   │   └── status/         # Status dos providers
│   │   ├── layout.tsx          # Layout raiz + providers
│   │   ├── globals.css         # Estilos globais + Liquid Glass
│   │   └── page.tsx            # Entry point
│   │
│   ├── components/             # Componentes React
│   │   ├── Dashboard.tsx       # Dashboard principal (tabs)
│   │   ├── TaskList.tsx        # Lista de tarefas
│   │   ├── Actions.tsx         # Botoes de acao rapida
│   │   ├── Report.tsx          # Relatorio IA
│   │   ├── Shop.tsx            # Loja de produtos
│   │   ├── AuthScreen.tsx      # Tela de autenticacao
│   │   ├── SetupScreen.tsx     # Wizard de criacao do pet
│   │   ├── SettingsModal.tsx   # Configuracoes
│   │   ├── AvatarMenu.tsx      # Menu do avatar
│   │   ├── SplashScreen.tsx    # Splash animado
│   │   ├── Header.tsx          # Cabecalho
│   │   ├── Timeline.tsx        # Timeline de atividades
│   │   ├── TaskModal.tsx       # Modal de detalhes
│   │   └── ui/                 # Componentes UI base
│   │       ├── Loader.tsx      # Loaders premium
│   │       └── ToggleSwitch.tsx
│   │
│   ├── context/                # Gerenciamento de estado
│   │   ├── PetContext.tsx      # Estado global do app
│   │   └── ThemeContext.tsx    # Tema dark/light
│   │
│   ├── hooks/                  # Hooks customizados
│   │   └── useAnime.ts         # Utilitarios Anime.js
│   │
│   ├── lib/                    # Bibliotecas e APIs
│   │   ├── supabase.ts         # Cliente Supabase
│   │   ├── groq.ts             # Integracao Groq LLM
│   │   ├── gemini.ts           # Integracao Gemini
│   │   ├── pollinations.ts     # Integracao Pollinations
│   │   └── constants.ts        # Constantes do app
│   │
│   └── types/                  # Tipos TypeScript
│       └── index.ts
│
├── public/                     # Assets estaticos
├── next.config.ts              # Config Next.js
├── tsconfig.json               # Config TypeScript
├── postcss.config.mjs          # Config PostCSS
├── eslint.config.mjs           # Config ESLint
├── supabase-schema.sql         # Schema do banco
└── .env.example                # Variaveis de ambiente
```

---

## 4. Schema do Banco (Supabase)

### Tabela: `devices`
```sql
CREATE TABLE devices (
  device_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,           -- nome do pet
  breed TEXT,                   -- raca
  photo_data TEXT,              -- imagem base64
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabela: `device_stats`
```sql
CREATE TABLE device_stats (
  device_id TEXT REFERENCES devices(device_id),
  date TEXT NOT NULL,           -- YYYY-MM-DD
  happiness INTEGER DEFAULT 50, -- 0-100
  points INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  completed_tasks TEXT[],       -- array de IDs
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (device_id, date)
);
```

### Tabela: `pets` (legado)
```sql
CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: usuarios so acessam seus dados
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own pets" ON pets
  USING (auth.uid() = user_id);
```

---

## 5. Features Implementadas

### 5.1 Autenticacao
- [x] Email/Senha (registro e login)
- [x] Google OAuth
- [x] Persistencia de sessao
- [x] Identificador por device/email

### 5.2 Gerenciamento do Pet
- [x] Wizard de criacao (nome, raca, foto)
- [x] Upload/captura de avatar
- [x] Persistencia no Supabase
- [x] Suporte a multiplos pets

### 5.3 Sistema de Tarefas
```typescript
const TASKS = [
  { id: '1', name: '1o Xixi',   time: '08:30', points: 10 },
  { id: '2', name: 'Cafe',      time: '10:00', points: 15 },
  { id: '3', name: 'Almoco',    time: '12:00', points: 15 },
  { id: '4', name: '2o Xixi',   time: '13:30', points: 10 },
  { id: '5', name: '3o Xixi',   time: '19:00', points: 10 },
  { id: '6', name: 'Janta',     time: '22:00', points: 15 },
  { id: '7', name: 'Ultimo Xixi', time: '00:00', points: 10 },
];
```
- [x] Conclusao com animacao
- [x] Notas/observacoes por tarefa
- [x] Deteccao de atraso (>30min)
- [x] Desfazer conclusao
- [x] Status visual

### 5.4 Gamificacao
```typescript
// Sistema de Felicidade (0-100)
const HAPPINESS_LEVELS = [
  { min: 80, emoji: '🤩', label: 'Muito Feliz' },
  { min: 60, emoji: '😄', label: 'Feliz' },
  { min: 40, emoji: '😊', label: 'Neutro' },
  { min: 20, emoji: '😐', label: 'Triste' },
  { min: 0,  emoji: '😢', label: 'Muito Triste' },
];

// Acoes Rapidas
const ACTIONS = [
  { id: 'affection', name: 'Carinho', emoji: '🤗', points: 5 },
  { id: 'food',      name: 'Comida',  emoji: '🍖', points: 10 },
  { id: 'walk',      name: 'Passeio', emoji: '🦮', points: 15 },
  { id: 'water',     name: 'Agua',    emoji: '💧', points: 5 },
  { id: 'play',      name: 'Brincar', emoji: '🎾', points: 12 },
  { id: 'bath',      name: 'Banho',   emoji: '🛁', points: 8 },
];
```
- [x] Sistema de pontos
- [x] Medidor de felicidade com decay (1/min)
- [x] Sistema de streak (dias consecutivos)
- [x] Acoes rapidas com animacao

### 5.5 IA Integrada

#### Relatorio Diario
```typescript
// Hierarquia de fallback
1. Groq LLM (llama-3.3-70b-versatile) -> JSON estruturado
2. Groq simples -> texto
3. Pollinations.ai -> texto basico
```

#### Reacoes do Pet
- Mensagens contextuais por tarefa
- Emojis dinamicos
- Toast notifications

#### Geracao de Imagens
- Pet + Produto (Pollinations Flux)
- Analise de fotos (Gemini Vision)
- Cache de previews

### 5.6 Loja
- [x] Catalogo de produtos
- [x] Preview com IA
- [x] Links externos (Mercado Livre)
- [x] Categorias com badges

### 5.7 Timeline
- [x] Historico de atividades
- [x] Timestamps
- [x] Notas anexadas

### 5.8 Configuracoes
- [x] Tema dark/light
- [x] Persistencia (localStorage)
- [x] Reset/logout

---

## 6. API Routes

### GET `/api/ai/status`
Verifica disponibilidade dos providers de IA.

### POST `/api/ai/report`
```typescript
// Request
{
  petName: string,
  petBreed: string,
  happiness: number,
  completedTasks: Task[],
  pendingTasks: Task[],
  streak: number,
  points: number,
  notes: TaskNote[],
  history: HistoryItem[]
}

// Response (estruturado)
{
  summary: string,
  insights: string[],       // 3 items
  recommendations: string[], // 3 items
  healthScore: number,      // 0-100
  mood: string              // emoji
}
```

### POST `/api/ai/pet-reaction`
```typescript
{ petName, petBreed, taskName, happiness }
// -> { message: string }
```

### POST `/api/ai/pet-with-product`
```typescript
{ petName, petBreed, productName, productDescription }
// -> { imageUrl: string }
```

### POST `/api/ai/analyze-photo`
```typescript
{ image: string (base64), prompt: string }
// -> { analysis: string }
```

### POST `/api/ai/combine-images`
```typescript
{ petImage, productImage, petName, petBreed }
// -> { imageUrl: string }
```

### POST `/api/ai/daily-tip`
```typescript
{ petBreed: string }
// -> { tip: string }
```

---

## 7. Design System: Liquid Glass

### Classes Base
```css
/* Efeito glass basico */
.glass {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
}

/* Card elevado com brilho */
.glass-card {
  @apply glass;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* Botao interativo */
.glass-button {
  @apply glass;
  transition: all 0.3s ease;
}
.glass-button:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-2px);
}

/* Input de formulario */
.glass-input {
  @apply glass;
  background: rgba(0, 0, 0, 0.2);
}

/* Item de tarefa */
.glass-task {
  @apply glass;
  padding: 12px 16px;
}

/* Pill/Tab */
.glass-pill {
  @apply glass;
  border-radius: 9999px;
  padding: 8px 16px;
}
```

### Animacoes
```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes float-slow {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20px) scale(1.05); }
}

@keyframes paw-bounce {
  0%, 100% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.1) rotate(-5deg); }
  75% { transform: scale(0.95) rotate(5deg); }
}
```

### Cores do Tema
```css
:root {
  --bg-primary: #0a0a0f;
  --bg-secondary: #12121a;
  --text-primary: #ffffff;
  --text-secondary: #a0a0b0;
  --accent-indigo: #6366f1;
  --accent-purple: #a855f7;
  --accent-green: #22c55e;
  --accent-orange: #f97316;
  --accent-red: #ef4444;
}

.light {
  --bg-primary: #f8fafc;
  --bg-secondary: #ffffff;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
}
```

---

## 8. Gerenciamento de Estado

### PetContext
```typescript
interface AppState {
  pet: Pet | null;
  happiness: number;        // 0-100
  done: string[];           // IDs das tarefas completas
  history: HistoryItem[];   // Log de atividades
  streak: number;           // Dias consecutivos
  points: number;           // Pontos acumulados
  lastDate: string;         // YYYY-MM-DD
  productPreviews: Record<string, string>;
  taskNotes: Record<string, TaskNote>;
}

interface PetContextType {
  loaded: boolean;
  state: AppState;
  screen: 'login' | 'setup' | 'dashboard';
  aiConfigured: boolean;
  isAuthenticated: boolean;
  user: User | null;

  // Actions
  completeTask: (taskId: string) => void;
  uncompleteTask: (taskId: string) => void;
  addTaskNote: (taskId: string, note: string) => void;
  doAction: (actionId: string) => void;
  updateHappiness: (delta: number) => void;

  // Auth
  handleSignUp: (email: string, password: string) => Promise<void>;
  handleSignIn: (email: string, password: string) => Promise<void>;
  handleGoogleSignIn: () => Promise<void>;
  logout: () => void;
}
```

### ThemeContext
```typescript
interface ThemeContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}
```

---

## 9. Integracoes Externas

### Supabase
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Funcoes principais
export async function savePetData(deviceId: string, data: Pet) {...}
export async function loadPetData(deviceId: string) {...}
export async function saveStats(deviceId: string, stats: Stats) {...}
export async function loadStats(deviceId: string, date: string) {...}
```

### Groq LLM
```typescript
// src/lib/groq.ts
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function generateReport(data: ReportInput) {
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });
  return response.json();
}
```

### Pollinations.ai (Gratuito)
```typescript
// src/lib/pollinations.ts

// Geracao de imagem
export function getImageUrl(prompt: string, options?: ImageOptions) {
  const params = new URLSearchParams({
    width: options?.width?.toString() || '512',
    height: options?.height?.toString() || '512',
    model: options?.model || 'flux',
    seed: options?.seed?.toString() || Math.random().toString(),
  });
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params}`;
}

// Geracao de texto (fallback)
export async function generateText(prompt: string) {
  const response = await fetch('https://text.pollinations.ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  return response.text();
}
```

### Google Gemini
```typescript
// src/lib/gemini.ts
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/beta/models';

export async function analyzeImage(image: string, prompt: string) {
  const response = await fetch(
    `${GEMINI_API_URL}/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: 'image/jpeg', data: image } }
          ]
        }]
      }),
    }
  );
  return response.json();
}
```

---

## 10. Variaveis de Ambiente

```env
# .env.example

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# AI APIs
GROQ_API_KEY=gsk_xxx...
GEMINI_API_KEY=AIza...

# Opcional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 11. Comandos de Desenvolvimento

```bash
# Instalar dependencias
npm install

# Rodar em desenvolvimento
npm run dev

# Build de producao
npm run build

# Rodar producao local
npm start

# Lint
npm run lint
```

---

## 12. Deploy (Vercel)

### Configuracao
1. Conectar repositorio GitHub
2. Adicionar variaveis de ambiente
3. Build automatico em cada push

### Headers de Cache (next.config.ts)
```typescript
headers: async () => [
  {
    source: '/:path*',
    headers: [
      { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
      { key: 'CDN-Cache-Control', value: 'no-store' },
      { key: 'Vercel-CDN-Cache-Control', value: 'no-store' }
    ]
  }
]
```

---

## 13. Licoes Aprendidas

### Next.js
- `staleTimes.static` deve ser >= 30 (minimo do Next.js)
- Usar `'use client'` em componentes com hooks/estado
- API routes sao server-side por padrao

### Supabase
- Sempre habilitar RLS em tabelas sensiveis
- Usar `device_id` como alternativa ao `user_id` para apps sem login obrigatorio
- Testar policies antes de ir para producao

### AI APIs
- Sempre ter fallback (Groq -> Pollinations)
- Pollinations.ai e gratuito e nao precisa de API key
- Groq e muito rapido para LLM (1-3s)
- Gemini Vision e otimo para analise de imagens

### Performance
- Usar Anime.js para animacoes GPU-accelerated
- Cachear previews de imagens no estado
- Debounce em saves frequentes (1s)

### Mobile
- `100dvh` para altura correta em mobile
- Safe area insets para iPhone
- Touch-friendly (min 44px para botoes)

### Tailwind v4
- Usar `@tailwindcss/postcss` no postcss.config
- Classes utilitarias funcionam igual
- Dark mode com `.dark` class

---

## 14. Proximos Passos Sugeridos

- [ ] Notificacoes push (PWA)
- [ ] Lembretes de tarefas
- [ ] Historico semanal/mensal
- [ ] Compartilhamento social
- [ ] Multiplos pets por usuario
- [ ] Conquistas/achievements
- [ ] Integracao com wearables
- [ ] Modo offline (Service Worker)

---

## 15. Links Uteis

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Groq API](https://console.groq.com/docs)
- [Pollinations.ai](https://pollinations.ai)
- [Anime.js](https://animejs.com/documentation)
- [Lucide Icons](https://lucide.dev/icons)

---

> **Criado em:** Novembro 2024
> **Versao:** 1.0
> **Autor:** Desenvolvido com Claude Code
