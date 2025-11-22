# PetCare - Gamified Pet Wellness Companion

Uma plataforma web gamificada que revoluciona a forma como donos de cães cuidam de seus pets, combinando rotinas estruturadas, neurociência comportamental e gamificação para criar uma experiência engajadora.

## Features (MVP)

- **Setup Inicial**: Cadastro do pet com nome, raça, idade, personalidade e foto
- **Dashboard Principal**: Hub central com foto do pet em destaque e informações
- **Rotina Diária Gamificada**: 7 tasks diárias com horários definidos e pontuação
- **Sistema de Pontos**: Recompensas por completar tasks e ações rápidas
- **Medidor de Felicidade**: Indicador visual do bem-estar do pet (0-100)
- **Ações Rápidas**: Carinho, Comida, Passeio, Água, Brincar, Banho
- **Timeline de Atividades**: Histórico das ações do dia
- **Sistema de Streak**: Contador de dias consecutivos com todas as tasks completas
- **Persistência Local**: Dados salvos no localStorage

## Tech Stack

- HTML5
- CSS3 (Glassmorphism design)
- JavaScript (Vanilla)
- Progressive Web App (PWA)

## Como Usar

1. Clone o repositório
2. Abra `index.html` no navegador
3. Cadastre seu pet
4. Complete as tasks diárias e ganhe pontos!

## Estrutura do Projeto

```
Rotina-pets/
├── index.html          # Página principal
├── css/
│   └── style.css       # Estilos com glassmorphism
├── js/
│   └── app.js          # Lógica principal
├── assets/
│   ├── icon-192.svg    # Ícone PWA
│   └── icon-512.svg    # Ícone PWA
├── manifest.json       # Manifest PWA
└── sw.js               # Service Worker
```

## Rotina Diária

| Horário | Task | Pontos |
|---------|------|--------|
| 08:30 | 1º xixi do dia | +10 |
| 10:00 | Café da manhã | +15 |
| 12:00 | Ração/Almoço | +15 |
| 13:30 | 2º xixi do dia | +10 |
| 19:00 | 3º xixi do dia | +10 |
| 22:00 | Jantar | +15 |
| 00:00 | Último xixi | +10 |

**Total possível/dia: 85 pontos**

## Níveis de Felicidade

| Nível | Range | Emoji |
|-------|-------|-------|
| Muito Feliz | 80-100 | 🤩 |
| Feliz | 60-79 | 😄 |
| OK | 40-59 | 😊 |
| Triste | 20-39 | 😐 |
| Muito Triste | 0-19 | 😢 |

## Roadmap

- [ ] Integração com IA Generativa
- [ ] Sistema de Lembretes/Notificações
- [ ] Gráficos e Analytics
- [ ] Conquistas e Badges
- [ ] Features Sociais
- [ ] Backend com Supabase

## Licença

MIT
