/**
 * PetCare v2 - Gamified Pet Wellness
 * Clean & Minimal Implementation
 */

// Config
const STORAGE_KEY = 'petcare_v2';
const DEFAULT_PHOTO = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzFhMWEyZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjgwIj7wn5CVPC90ZXh0Pjwvc3ZnPg==';

// Daily routine
const TASKS = [
    { id: 'xixi1', time: '08:30', name: '1º xixi do dia', emoji: '🚽', points: 10 },
    { id: 'cafe', time: '10:00', name: 'Café da manhã', emoji: '🍳', points: 15 },
    { id: 'almoco', time: '12:00', name: 'Almoço', emoji: '🍖', points: 15 },
    { id: 'xixi2', time: '13:30', name: '2º xixi', emoji: '🚽', points: 10 },
    { id: 'xixi3', time: '19:00', name: '3º xixi', emoji: '🚽', points: 10 },
    { id: 'jantar', time: '22:00', name: 'Jantar', emoji: '🥘', points: 15 },
    { id: 'xixi4', time: '00:00', name: 'Último xixi', emoji: '🚽', points: 10 }
];

// Happiness levels
const HAPPINESS = [
    { min: 80, emoji: '🤩', color: '#10b981' },
    { min: 60, emoji: '😄', color: '#34d399' },
    { min: 40, emoji: '😊', color: '#fbbf24' },
    { min: 20, emoji: '😐', color: '#fb923c' },
    { min: 0, emoji: '😢', color: '#ef4444' }
];

// Action labels
const ACTION_NAMES = {
    carinho: 'Carinho',
    comida: 'Comida',
    passeio: 'Passeio',
    agua: 'Água',
    brincar: 'Brincadeira',
    banho: 'Banho'
};

// State
let state = {
    pet: null,
    happiness: 50,
    completedTasks: [],
    activities: [],
    streak: 0,
    totalPoints: 0,
    lastDate: null
};

// Utils
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const today = () => new Date().toISOString().split('T')[0];
const now = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
const timeToMins = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const currentMins = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };

// Storage
function save() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.error('Save error:', e);
    }
}

function load() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            state = { ...state, ...JSON.parse(data) };
            if (state.lastDate !== today()) {
                handleNewDay();
            }
        }
    } catch (e) {
        console.error('Load error:', e);
    }
}

function handleNewDay() {
    const allDone = state.completedTasks.length === TASKS.length;
    if (allDone && state.lastDate) {
        state.streak++;
    } else if (state.lastDate && !allDone) {
        state.streak = 0;
    }
    state.completedTasks = [];
    state.activities = [];
    state.lastDate = today();
    save();
}

function reset() {
    if (confirm('Apagar todos os dados?')) {
        localStorage.removeItem(STORAGE_KEY);
        state = { pet: null, happiness: 50, completedTasks: [], activities: [], streak: 0, totalPoints: 0, lastDate: null };
        showScreen('setup');
    }
}

// Screens
function showScreen(name) {
    $$('.screen').forEach(s => s.classList.remove('active'));
    $(`#${name}-screen`).classList.add('active');
    if (name === 'dashboard') updateDashboard();
}

// Setup
function initSetup() {
    const preview = $('#photo-preview');
    const input = $('#pet-photo');
    const img = $('#preview-image');

    preview.onclick = () => input.click();
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                img.src = ev.target.result;
                img.style.display = 'block';
                $('.photo-placeholder').style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    };

    $('#pet-form').onsubmit = (e) => {
        e.preventDefault();
        state.pet = {
            name: $('#pet-name').value.trim(),
            breed: $('#pet-breed').value.trim(),
            age: $('#pet-age').value.trim(),
            personality: $('#pet-personality').value.trim(),
            photo: img.src || DEFAULT_PHOTO
        };
        state.lastDate = today();
        state.happiness = 50;
        save();
        showScreen('dashboard');
    };
}

// Dashboard
function updateDashboard() {
    if (!state.pet) return;

    // Header
    $('#pet-avatar').src = state.pet.photo || DEFAULT_PHOTO;
    $('#pet-name-display').textContent = state.pet.name;
    $('#pet-details').textContent = `${state.pet.breed} • ${state.pet.age}`;

    // Stats
    $('#tasks-done').textContent = `${state.completedTasks.length}/${TASKS.length}`;
    $('#streak-count').textContent = state.streak;
    $('#total-points').textContent = state.totalPoints;

    // Happiness
    updateHappiness();

    // Tasks
    renderTasks();

    // Timeline
    renderTimeline();
}

function updateHappiness() {
    const h = Math.max(0, Math.min(100, state.happiness));
    const level = HAPPINESS.find(l => h >= l.min);

    $('#happiness-emoji').textContent = level?.emoji || '😊';
    $('#happiness-level').textContent = `${Math.round(h)}%`;
    $('#happiness-level').style.color = level?.color || '#fbbf24';
    $('#happiness-fill').style.width = `${h}%`;
}

function renderTasks() {
    const container = $('#task-list');
    const curr = currentMins();

    container.innerHTML = TASKS.map(task => {
        const done = state.completedTasks.includes(task.id);
        const taskMins = timeToMins(task.time);
        const late = !done && (task.time === '00:00' ? curr < 60 : curr > taskMins + 30);
        const cls = done ? 'completed' : late ? 'late' : '';

        return `
            <div class="task-item ${cls}" data-id="${task.id}">
                <div class="task-check">${done ? '✓' : ''}</div>
                <div class="task-content">
                    <div class="task-name">${task.emoji} ${task.name}</div>
                    <div class="task-time">${task.time}</div>
                </div>
                <div class="task-points">+${task.points}</div>
            </div>
        `;
    }).join('');

    // Progress
    const progress = Math.round((state.completedTasks.length / TASKS.length) * 100);
    $('#progress-text').textContent = `${progress}%`;

    // Click handlers
    container.querySelectorAll('.task-item:not(.completed)').forEach(el => {
        el.onclick = () => completeTask(el.dataset.id);
    });
}

function renderTimeline() {
    const container = $('#timeline-list');

    if (!state.activities.length) {
        container.innerHTML = '<p class="empty-timeline">Nenhuma atividade ainda</p>';
        return;
    }

    container.innerHTML = [...state.activities].reverse().slice(0, 10).map(a => `
        <div class="timeline-item">
            <span class="timeline-time">${a.time}</span>
            <span class="timeline-emoji">${a.emoji}</span>
            <span class="timeline-text">${a.name}</span>
            <span class="timeline-points">+${a.points}</span>
        </div>
    `).join('');
}

// Actions
function completeTask(id) {
    if (state.completedTasks.includes(id)) return;

    const task = TASKS.find(t => t.id === id);
    if (!task) return;

    state.completedTasks.push(id);
    addPoints(task.points, task.emoji);
    addHappiness(Math.round(task.points * 0.5));
    addActivity(task.name, task.emoji, task.points);

    save();
    updateDashboard();

    if (state.completedTasks.length === TASKS.length) {
        celebrate();
    }
}

function handleQuickAction(action, points, emoji) {
    addPoints(points, emoji);
    addHappiness(Math.round(points * 0.5));
    addActivity(ACTION_NAMES[action] || action, emoji, points);
    save();
    updateDashboard();
}

function addPoints(pts, emoji) {
    state.totalPoints += pts;
    showPointsPopup(pts, emoji);
}

function addHappiness(amount) {
    state.happiness = Math.min(100, state.happiness + amount);
}

function addActivity(name, emoji, points) {
    state.activities.push({ name, emoji, points, time: now() });
}

function showPointsPopup(pts, emoji) {
    const popup = document.createElement('div');
    popup.className = 'points-popup';
    popup.textContent = `+${pts} ${emoji}`;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 800);
}

function celebrate() {
    $('#celebration-msg').textContent = `${state.pet.name} está muito feliz! Todas as tasks concluídas!`;
    $('#celebration-modal').style.display = 'flex';
}

// Happiness decay
function startDecay() {
    setInterval(() => {
        if (state.pet && state.happiness > 0) {
            state.happiness = Math.max(0, state.happiness - 1);
            save();
            updateHappiness();
        }
    }, 60000);
}

// Event listeners
function initEvents() {
    // Quick actions
    $$('.action-btn').forEach(btn => {
        btn.onclick = () => {
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => btn.style.transform = '', 150);
            handleQuickAction(btn.dataset.action, +btn.dataset.points, btn.dataset.emoji);
        };
    });

    // Settings
    $('#settings-btn').onclick = () => $('#settings-modal').style.display = 'flex';
    $('#close-settings').onclick = () => $('#settings-modal').style.display = 'none';

    // Edit pet
    $('#edit-pet-btn').onclick = () => {
        $('#settings-modal').style.display = 'none';
        if (state.pet) {
            $('#pet-name').value = state.pet.name;
            $('#pet-breed').value = state.pet.breed;
            $('#pet-age').value = state.pet.age;
            $('#pet-personality').value = state.pet.personality || '';
            if (state.pet.photo && state.pet.photo !== DEFAULT_PHOTO) {
                $('#preview-image').src = state.pet.photo;
                $('#preview-image').style.display = 'block';
                $('.photo-placeholder').style.display = 'none';
            }
        }
        showScreen('setup');
    };

    // Reset
    $('#reset-btn').onclick = () => {
        $('#settings-modal').style.display = 'none';
        reset();
    };

    // Celebration
    $('#close-celebration').onclick = () => $('#celebration-modal').style.display = 'none';

    // Close modals on backdrop
    $$('.modal').forEach(m => {
        m.onclick = (e) => { if (e.target === m) m.style.display = 'none'; };
    });
}

// Init
function init() {
    load();
    initSetup();
    initEvents();

    if (state.pet) {
        showScreen('dashboard');
    } else {
        showScreen('setup');
    }

    startDecay();
    setInterval(() => state.pet && renderTasks(), 60000);

    console.log('PetCare v2 initialized 🐕');
}

document.addEventListener('DOMContentLoaded', init);

// PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
}
