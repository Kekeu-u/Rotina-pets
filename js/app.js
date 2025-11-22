/**
 * PetCare v3 - Compact & Clean with Supabase Auth
 */

const STORAGE_KEY = 'petcare_v3';
const DEFAULT_PHOTO = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCBmaWxsPSIjMWExYTJlIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSI0MCI+8J+QlTwvdGV4dD48L3N2Zz4=';

const TASKS = [
    { id: 'xixi1', time: '08:30', name: '1º xixi', emoji: '🚽', pts: 10 },
    { id: 'cafe', time: '10:00', name: 'Café', emoji: '🍳', pts: 15 },
    { id: 'almoco', time: '12:00', name: 'Almoço', emoji: '🍖', pts: 15 },
    { id: 'xixi2', time: '13:30', name: '2º xixi', emoji: '🚽', pts: 10 },
    { id: 'xixi3', time: '19:00', name: '3º xixi', emoji: '🚽', pts: 10 },
    { id: 'jantar', time: '22:00', name: 'Jantar', emoji: '🥘', pts: 15 },
    { id: 'xixi4', time: '00:00', name: 'Último xixi', emoji: '🚽', pts: 10 }
];

const HAPPINESS_LEVELS = [
    { min: 80, emoji: '🤩' },
    { min: 60, emoji: '😄' },
    { min: 40, emoji: '😊' },
    { min: 20, emoji: '😐' },
    { min: 0, emoji: '😢' }
];

const ACTIONS = {
    carinho: 'Carinho', comida: 'Comida', passeio: 'Passeio',
    agua: 'Água', brincar: 'Brincar', banho: 'Banho'
};

let state = {
    pet: null,
    happiness: 50,
    done: [],
    history: [],
    streak: 0,
    points: 0,
    lastDate: null
};

// Utils
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const today = () => new Date().toISOString().split('T')[0];
const now = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
const toMins = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const currMins = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };

// Loading
function showLoading() { $('#loading').style.display = 'flex'; }
function hideLoading() { $('#loading').style.display = 'none'; }

// Storage
function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function load() {
    const d = localStorage.getItem(STORAGE_KEY);
    if (d) {
        state = { ...state, ...JSON.parse(d) };
        if (state.lastDate !== today()) newDay();
    }
}

function newDay() {
    if (state.done.length === TASKS.length && state.lastDate) state.streak++;
    else if (state.lastDate) state.streak = 0;
    state.done = [];
    state.history = [];
    state.lastDate = today();
    save();
}

function reset() {
    if (confirm('Apagar tudo?')) {
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
    }
}

// Screens
function show(name) {
    $$('.screen').forEach(s => s.classList.remove('active'));
    $(`#${name}-screen`).classList.add('active');
    if (name === 'dashboard') update();
}

// Auth - Simplified (local mode only)
async function handleAuth() {
    hideLoading();
    load();

    if (state.pet) {
        show('dashboard');
    } else {
        show('login');
    }
}

// Setup
function initSetup() {
    const preview = $('#photo-preview');
    const input = $('#pet-photo');
    const img = $('#preview-image');

    preview.onclick = () => input.click();

    input.onchange = e => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = ev => {
                img.src = ev.target.result;
                img.style.display = 'block';
                $('.photo-icon').style.display = 'none';
                $('.photo-text').style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    };

    $('#pet-form').onsubmit = e => {
        e.preventDefault();

        const name = $('#pet-name').value.trim();
        const breed = $('#pet-breed').value.trim();
        const photo = img.src || DEFAULT_PHOTO;

        state.pet = { name, breed, photo };
        state.lastDate = today();
        state.happiness = 50;

        save();
        show('dashboard');
    };
}

// Dashboard
function update() {
    if (!state.pet) return;

    $('#pet-avatar').src = state.pet.photo || DEFAULT_PHOTO;
    $('#pet-name-display').textContent = state.pet.name;
    $('#pet-breed-display').textContent = state.pet.breed;

    const level = HAPPINESS_LEVELS.find(l => state.happiness >= l.min);
    $('#happiness-emoji').textContent = level?.emoji || '😊';
    $('#happiness-num').textContent = Math.round(state.happiness);
    $('#tasks-num').textContent = `${state.done.length}/${TASKS.length}`;
    $('#streak-num').textContent = state.streak;
    $('#points-num').textContent = state.points;

    renderTasks();
    renderTimeline();
    loadAI();
}

function renderTasks() {
    const c = currMins();
    $('#task-list').innerHTML = TASKS.map(t => {
        const done = state.done.includes(t.id);
        const late = !done && (t.time === '00:00' ? c < 60 : c > toMins(t.time) + 30);
        return `
            <div class="task ${done ? 'done' : ''} ${late ? 'late' : ''}" data-id="${t.id}">
                <div class="task-check">${done ? '✓' : ''}</div>
                <div class="task-info">
                    <div class="task-name">${t.emoji} ${t.name}</div>
                    <div class="task-time">${t.time}</div>
                </div>
                <div class="task-pts">+${t.pts}</div>
            </div>
        `;
    }).join('');

    $$('.task:not(.done)').forEach(el => {
        el.onclick = () => doTask(el.dataset.id);
    });
}

function renderTimeline() {
    const c = $('#timeline');
    if (!state.history.length) {
        c.innerHTML = '<p class="empty">Nenhuma atividade</p>';
        return;
    }
    c.innerHTML = [...state.history].reverse().slice(0, 8).map(h => `
        <div class="timeline-item">
            <span class="time">${h.time}</span>
            <span class="emoji">${h.emoji}</span>
            <span class="text">${h.name}</span>
            <span class="pts">+${h.pts}</span>
        </div>
    `).join('');
}

// Actions
function doTask(id) {
    if (state.done.includes(id)) return;
    const t = TASKS.find(x => x.id === id);
    if (!t) return;

    state.done.push(id);
    addPts(t.pts, t.emoji);
    state.happiness = Math.min(100, state.happiness + t.pts * 0.5);
    state.history.push({ name: t.name, emoji: t.emoji, pts: t.pts, time: now() });
    save();
    update();

    if (window.AI?.isConfigured()) showReaction(t.name, t.emoji);
    if (state.done.length === TASKS.length) celebrate();
}

function doAction(action, pts, emoji) {
    addPts(pts, emoji);
    state.happiness = Math.min(100, state.happiness + pts * 0.5);
    state.history.push({ name: ACTIONS[action], emoji, pts, time: now() });
    save();
    update();

    if (window.AI?.isConfigured()) showReaction(ACTIONS[action], emoji);
}

function addPts(pts, emoji) {
    state.points += pts;
    const p = document.createElement('div');
    p.className = 'points-popup';
    p.textContent = `+${pts} ${emoji}`;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 800);
}

function celebrate() {
    $('#celebration-msg').textContent = `${state.pet.name} completou tudo!`;
    $('#celebration-modal').style.display = 'flex';
}

// AI
async function loadAI() {
    if (!window.AI?.isConfigured() || !state.pet) {
        $('#ai-tip').style.display = 'none';
        return;
    }

    $('#ai-tip').style.display = 'flex';
    $('#ai-message').textContent = 'Carregando dica...';

    try {
        const tip = await AI.getDailyTip(state.pet.name, state.pet.breed, '', '');
        $('#ai-message').textContent = tip || 'Cuide bem do seu pet hoje! 🐕';
    } catch {
        $('#ai-message').textContent = 'Cuide bem do seu pet hoje! 🐕';
    }
}

async function showReaction(taskName, emoji) {
    if (!window.AI?.isConfigured()) return;

    $('#reaction-emoji').textContent = emoji;
    $('#reaction-text').textContent = 'Pensando...';
    $('#reaction-modal').style.display = 'flex';

    try {
        const r = await AI.getPetReaction(state.pet.name, state.pet.breed, '', taskName, state.happiness);
        $('#reaction-text').textContent = r || `${state.pet.name} adorou! 🐕`;
    } catch {
        $('#reaction-text').textContent = `${state.pet.name} adorou! 🐕`;
    }
}

// Decay
setInterval(() => {
    if (state.pet && state.happiness > 0) {
        state.happiness = Math.max(0, state.happiness - 1);
        save();
        if ($('#dashboard-screen').classList.contains('active')) update();
    }
}, 60000);

// Events
function initEvents() {
    // Start button (login screen)
    $('#start-btn').onclick = () => {
        show('setup');
    };

    // Tabs
    $$('.tab').forEach(tab => {
        tab.onclick = () => {
            $$('.tab').forEach(t => t.classList.remove('active'));
            $$('.tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            $(`#tab-${tab.dataset.tab}`).classList.add('active');
        };
    });

    // Quick actions
    $$('.action-btn').forEach(btn => {
        btn.onclick = () => {
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => btn.style.transform = '', 150);
            doAction(btn.dataset.action, +btn.dataset.points, btn.dataset.emoji);
        };
    });

    // Settings
    $('#settings-btn').onclick = () => {
        const key = localStorage.getItem('petcare_gemini_key');
        $('#api-key').value = key || '';
        $('#settings-modal').style.display = 'flex';
    };

    $('#close-settings').onclick = () => $('#settings-modal').style.display = 'none';

    // SAVE API
    $('#save-api-btn').onclick = () => {
        const key = $('#api-key').value.trim();
        if (key) {
            if (window.AI) {
                AI.init(key);
                alert('API salva! IA ativada.');
                $('#settings-modal').style.display = 'none';
                loadAI();
            }
        } else {
            if (window.AI) AI.clear();
            $('#ai-tip').style.display = 'none';
            alert('API removida.');
        }
    };

    // Edit pet
    $('#edit-pet-btn').onclick = () => {
        $('#settings-modal').style.display = 'none';
        if (state.pet) {
            $('#pet-name').value = state.pet.name;
            $('#pet-breed').value = state.pet.breed;
            if (state.pet.photo !== DEFAULT_PHOTO) {
                $('#preview-image').src = state.pet.photo;
                $('#preview-image').style.display = 'block';
                $('.photo-icon').style.display = 'none';
                $('.photo-text').style.display = 'none';
            }
        }
        show('setup');
    };

    // Logout (Apagar dados)
    $('#logout-btn').onclick = () => {
        if (confirm('Apagar todos os dados do app?')) {
            $('#settings-modal').style.display = 'none';
            localStorage.removeItem(STORAGE_KEY);
            state = {
                pet: null,
                happiness: 50,
                done: [],
                history: [],
                streak: 0,
                points: 0,
                lastDate: null
            };
            show('login');
        }
    };

    // Modals
    $('#close-reaction').onclick = () => $('#reaction-modal').style.display = 'none';
    $('#close-celebration').onclick = () => $('#celebration-modal').style.display = 'none';

    $$('.modal').forEach(m => {
        m.onclick = e => { if (e.target === m) m.style.display = 'none'; };
    });
}

// Init
function init() {
    load();
    initSetup();
    initEvents();
    if (window.AI) AI.load();

    handleAuth();

    console.log('PetCare v3 🐕');
}

init();
