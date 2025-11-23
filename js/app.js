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

// Produtos da loja - Atualize os links de afiliado aqui
const SHOP_PRODUCTS = [
    {
        id: 'cacto',
        name: 'Cacto Dançante',
        description: 'Toca música e repete fala!',
        price: 'R$ 34,90',
        badge: '🔥 Popular',
        image: 'https://http2.mlstatic.com/D_NQ_NP_2X_622629-MLU72541779498_102023-F.webp',
        link: 'https://www.mercadolivre.com.br/sec/1wEe68m'
    },
    {
        id: 'mordedor',
        name: 'Mordedor Escova',
        description: 'Limpa os dentes brincando!',
        price: 'R$ 29,90',
        badge: '🦷 Saúde',
        image: 'https://http2.mlstatic.com/D_NQ_NP_2X_917941-MLB72567498498_102023-F.webp',
        link: 'https://www.mercadolivre.com.br/sec/27jb2Mm'
    },
    {
        id: 'corda',
        name: 'Kit 4 Cordas',
        description: 'Brinquedo resistente!',
        price: 'R$ 39,90',
        badge: '💪 Forte',
        image: 'https://http2.mlstatic.com/D_NQ_NP_2X_806575-MLB53162729498_012023-F.webp',
        link: 'https://www.mercadolivre.com.br/sec/2mMKX3A'
    }
];

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
    // Sync to cloud (non-blocking)
    if (window.Supabase) Supabase.syncAll(state);
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

    // Update avatar display (icon vs photo)
    updateAvatarDisplay();

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
    updateAIBadge();
    loadAI();
    updateShop();
}

// Update avatar display (icon or photo)
function updateAvatarDisplay() {
    const avatar = $('#pet-avatar');
    const icon = $('#pet-avatar-icon');
    const hasPhoto = state.pet?.photo && state.pet.photo !== DEFAULT_PHOTO;

    if (hasPhoto) {
        avatar.src = state.pet.photo;
        avatar.style.display = 'block';
        if (icon) icon.style.display = 'none';
    } else {
        avatar.style.display = 'none';
        if (icon) icon.style.display = 'block';
    }

    // Reinit Lucide icons
    if (window.lucide) lucide.createIcons();
}

// Shop
function updateShop() {
    if (!state.pet) return;

    const shopPhoto = $('#shop-pet-photo');
    const shopIcon = $('#shop-pet-icon');
    const shopName = $('#shop-pet-name');

    const hasPhoto = state.pet.photo && state.pet.photo !== DEFAULT_PHOTO;

    if (hasPhoto) {
        if (shopPhoto) {
            shopPhoto.src = state.pet.photo;
            shopPhoto.style.display = 'block';
        }
        if (shopIcon) shopIcon.style.display = 'none';
    } else {
        if (shopPhoto) shopPhoto.style.display = 'none';
        if (shopIcon) shopIcon.style.display = 'block';
    }

    if (shopName) shopName.textContent = state.pet.name;

    // Render products
    renderShopProducts();

    // Reinit Lucide icons
    if (window.lucide) lucide.createIcons();
}

// Render shop products dynamically
function renderShopProducts() {
    const container = $('#shop-products');
    if (!container) return;

    container.innerHTML = SHOP_PRODUCTS.map(product => `
        <a href="${product.link}" target="_blank" rel="noopener" class="product-card" data-product="${product.id}">
            <div class="product-img-wrap">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-info">
                <h4>${product.name}</h4>
                <p>${product.description}</p>
                <span class="product-price">${product.price}</span>
            </div>
            <div class="product-badge">${product.badge}</div>
        </a>
    `).join('');
}

async function loadShopRecommendation() {
    if (!window.AI?.isConfigured() || !state.pet) {
        $('#shop-ai-tip').textContent = 'Brinquedos selecionados para seu pet!';
        return;
    }

    try {
        const prompt = `Você é um especialista em pets. Dê uma recomendação CURTA (máximo 15 palavras) de brinquedos para um ${state.pet.breed || 'cachorro'} chamado ${state.pet.name}. Seja carinhoso e direto. Não use emojis.`;
        const tip = await AI.request(prompt);
        $('#shop-ai-tip').textContent = tip || 'Brinquedos perfeitos para deixar seu pet feliz!';
    } catch {
        $('#shop-ai-tip').textContent = 'Brinquedos perfeitos para deixar seu pet feliz!';
    }
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

// Avatar Menu Modal
function openAvatarMenu() {
    if (!state.pet) return;

    const modal = $('#avatar-menu-modal');
    const photo = $('#avatar-menu-photo');
    const icon = $('#avatar-menu-icon');
    const nameEl = $('#avatar-menu-name');
    const removeBtn = $('#avatar-remove-btn');
    const thoughtContainer = $('#avatar-thought-container');

    // Update name
    nameEl.textContent = state.pet.name;

    // Update photo/icon display
    const hasPhoto = state.pet.photo && state.pet.photo !== DEFAULT_PHOTO;
    if (hasPhoto) {
        photo.src = state.pet.photo;
        photo.style.display = 'block';
        icon.style.display = 'none';
        removeBtn.style.display = 'flex';
    } else {
        photo.style.display = 'none';
        icon.style.display = 'block';
        removeBtn.style.display = 'none';
    }

    // Hide thought container initially
    thoughtContainer.style.display = 'none';

    // Show modal
    modal.style.display = 'flex';

    // Reinitialize Lucide icons in modal
    if (window.lucide) lucide.createIcons();
}

// Handle avatar photo upload
function handleAvatarUpload() {
    const input = $('#avatar-photo-input');
    input.value = ''; // Reset para permitir mesmo arquivo
    input.click();
}

// Process uploaded avatar with visual feedback
async function processAvatarUpload(file) {
    if (!file) return;

    console.log('📸 Iniciando processamento da foto...');

    try {
        // Close avatar menu
        $('#avatar-menu-modal').style.display = 'none';

        // Show processing modal
        const modal = $('#photo-processing-modal');
        const preview = $('#processing-photo');
        const overlay = $('#processing-overlay');
        const check = $('#processing-check');
        const title = $('#processing-title');
        const status = $('#processing-status');
        const stepOptimize = $('#step-optimize');
        const stepAnalyze = $('#step-analyze');
        const stepSave = $('#step-save');

        // Reset state
        overlay.style.display = 'flex';
        check.style.display = 'none';
        title.textContent = 'Processando foto...';
        [stepOptimize, stepAnalyze, stepSave].forEach(s => {
            s.classList.remove('active', 'done');
        });

        modal.style.display = 'flex';
        initLucideIcons();

        // Read file as data URL
        const originalData = await readFileAsDataURL(file);
        preview.src = originalData;
        console.log('📸 Foto carregada, otimizando...');

        // Step 1: Optimize
        stepOptimize.classList.add('active');
        status.textContent = 'Otimizando imagem...';
        await sleep(600);

        const optimizedData = await optimizeImage(originalData);
        stepOptimize.classList.remove('active');
        stepOptimize.classList.add('done');
        console.log('📸 Foto otimizada');

        // Step 2: Analyze (AI if available)
        stepAnalyze.classList.add('active');
        status.textContent = 'Analisando pet...';
        await sleep(500);

        let aiAnalysis = null;
        if (window.AI?.isConfigured()) {
            try {
                aiAnalysis = await analyzePhotoWithAI();
                console.log('📸 Análise IA:', aiAnalysis);
            } catch (err) {
                console.log('📸 AI analysis skipped');
            }
        }
        stepAnalyze.classList.remove('active');
        stepAnalyze.classList.add('done');

        // Step 3: Save
        stepSave.classList.add('active');
        status.textContent = 'Salvando...';
        await sleep(400);

        state.pet.photo = optimizedData;
        save();
        console.log('📸 Foto salva!');

        stepSave.classList.remove('active');
        stepSave.classList.add('done');

        // Show success
        overlay.style.display = 'none';
        check.style.display = 'flex';
        title.textContent = 'Foto atualizada!';
        status.textContent = aiAnalysis || 'Pronto para usar';
        initLucideIcons();

        // Close after delay
        await sleep(1500);
        modal.style.display = 'none';

        // Update all displays
        updateAvatarDisplay();
        updateShop();

        console.log('📸 Processamento concluído!');
    } catch (error) {
        console.error('📸 Erro no processamento:', error);
        alert('Erro ao processar foto. Tente novamente.');
        $('#photo-processing-modal').style.display = 'none';
    }
}

// Read file as Data URL (Promise-based)
function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Optimize/compress image
function optimizeImage(dataUrl) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Max size 400px (good for avatars)
            const maxSize = 400;
            let { width, height } = img;

            if (width > height && width > maxSize) {
                height = (height * maxSize) / width;
                width = maxSize;
            } else if (height > maxSize) {
                width = (width * maxSize) / height;
                height = maxSize;
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            // Compress to JPEG 80% quality
            resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = dataUrl;
    });
}

// Analyze photo with AI (optional)
async function analyzePhotoWithAI() {
    if (!window.AI?.isConfigured() || !state.pet) return null;

    try {
        const prompt = `O usuário acabou de enviar uma foto do pet ${state.pet.name} (${state.pet.breed}). Dê uma resposta MUITO curta (máximo 8 palavras) elogiando o pet de forma carinhosa. Exemplo: "Que lindo! Foto perfeita!" ou "Adorável! Ficou ótima!"`;
        return await AI.request(prompt);
    } catch {
        return null;
    }
}

// Sleep helper
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Remove avatar photo
function removeAvatarPhoto() {
    if (!state.pet) return;

    state.pet.photo = DEFAULT_PHOTO;
    save();

    // Update displays
    updateAvatarDisplay();
    updateShop();
    openAvatarMenu(); // Refresh modal
}

// AI thought in avatar menu
async function loadAvatarThought() {
    const container = $('#avatar-thought-container');
    const text = $('#avatar-thought-text');

    container.style.display = 'block';
    text.textContent = 'Pensando...';

    if (!window.AI?.isConfigured()) {
        text.textContent = `${state.pet.name} está feliz em te ver! 🐕`;
        return;
    }

    try {
        const hour = new Date().getHours();
        const pending = TASKS.length - state.done.length;
        const thought = await AI.getPetThought(
            state.pet.name,
            state.pet.breed,
            state.happiness,
            hour,
            pending,
            state.done.length
        );
        text.textContent = thought || `${state.pet.name} te ama!`;
    } catch {
        text.textContent = `${state.pet.name} está feliz! 🐕`;
    }
}

// Update AI badge visibility
function updateAIBadge() {
    const badge = $('#ai-badge');
    if (badge) {
        badge.classList.toggle('hidden', !window.AI?.isConfigured());
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

    // Avatar click to open menu
    $('#avatar-click').onclick = () => openAvatarMenu();

    // Avatar menu buttons
    $('#avatar-upload-btn').onclick = () => handleAvatarUpload();
    $('#avatar-remove-btn').onclick = () => removeAvatarPhoto();
    $('#avatar-ai-btn').onclick = () => loadAvatarThought();

    // Avatar photo input
    $('#avatar-photo-input').onchange = e => {
        const file = e.target.files[0];
        if (file) processAvatarUpload(file);
    };

    // Tabs
    $$('.tab').forEach(tab => {
        tab.onclick = () => {
            $$('.tab').forEach(t => t.classList.remove('active'));
            $$('.tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            $(`#tab-${tab.dataset.tab}`).classList.add('active');

            // Load shop recommendation when opening shop tab
            if (tab.dataset.tab === 'loja') {
                loadShopRecommendation();
            }
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

// Splash Screen
function hideSplash() {
    const splash = document.getElementById('splash');
    const app = document.getElementById('app');

    splash.classList.add('hide');
    app.style.display = 'block';

    // Remove splash after animation
    setTimeout(() => splash.remove(), 500);
}

// Initialize Lucide icons globally
function initLucideIcons() {
    if (window.lucide) {
        lucide.createIcons();
    }
}

// Init
function init() {
    load();
    initSetup();
    initEvents();
    if (window.AI) AI.load();

    // Initialize Lucide icons after DOM ready
    initLucideIcons();

    // Show splash for 2 seconds, then show app
    setTimeout(() => {
        hideSplash();
        handleAuth();
        // Reinit icons after app is shown
        setTimeout(initLucideIcons, 100);
    }, 2000);

    console.log('PetCare v3 🐕');
}

init();
