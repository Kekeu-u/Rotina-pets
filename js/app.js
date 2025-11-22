/**
 * PetCare - Gamified Pet Wellness Companion
 * Main Application Logic
 */

// ==========================================
// Configuration & Constants
// ==========================================

const CONFIG = {
    STORAGE_KEY: 'petcare_data',
    HAPPINESS_DECAY_RATE: 1, // Points per minute
    HAPPINESS_DECAY_INTERVAL: 60000, // 1 minute
    DEFAULT_PHOTO: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiM2NjdlZWEiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSI4MCIgZmlsbD0id2hpdGUiPvCfkbY8L3RleHQ+PC9zdmc+'
};

// Daily routine tasks with schedules
const DAILY_ROUTINE = [
    { id: 'xixi1', time: '08:30', name: '1º xixi do dia', emoji: '🚽', points: 10 },
    { id: 'cafe', time: '10:00', name: 'Café da manhã', emoji: '🍳', points: 15 },
    { id: 'almoco', time: '12:00', name: 'Ração/Almoço', emoji: '🍖', points: 15 },
    { id: 'xixi2', time: '13:30', name: '2º xixi do dia', emoji: '🚽', points: 10 },
    { id: 'xixi3', time: '19:00', name: '3º xixi do dia', emoji: '🚽', points: 10 },
    { id: 'jantar', time: '22:00', name: 'Jantar', emoji: '🥘', points: 15 },
    { id: 'xixi4', time: '00:00', name: 'Último xixi', emoji: '🚽', points: 10 }
];

// Happiness levels configuration
const HAPPINESS_LEVELS = [
    { min: 80, max: 100, emoji: '🤩', text: 'Muito Feliz', color: '#10b981' },
    { min: 60, max: 79, emoji: '😄', text: 'Feliz', color: '#34d399' },
    { min: 40, max: 59, emoji: '😊', text: 'OK', color: '#fbbf24' },
    { min: 20, max: 39, emoji: '😐', text: 'Triste', color: '#fb923c' },
    { min: 0, max: 19, emoji: '😢', text: 'Muito Triste', color: '#ef4444' }
];

// ==========================================
// State Management
// ==========================================

let state = {
    pet: null,
    happiness: 50,
    completedTasks: [],
    activities: [],
    streak: 0,
    totalPoints: 0,
    lastCheckDate: null,
    lastHappinessUpdate: Date.now()
};

// ==========================================
// Utility Functions
// ==========================================

function formatTime(date) {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function getCurrentTimeString() {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

function isTaskLate(taskTime) {
    const currentMinutes = timeToMinutes(getCurrentTimeString());
    const taskMinutes = timeToMinutes(taskTime);

    // Handle midnight (00:00) case - it's only late after midnight
    if (taskTime === '00:00') {
        return currentMinutes >= 0 && currentMinutes < 60; // Consider late for first hour after midnight
    }

    return currentMinutes > taskMinutes + 30; // 30 min grace period
}

function isTaskPending(taskTime) {
    const currentMinutes = timeToMinutes(getCurrentTimeString());
    const taskMinutes = timeToMinutes(taskTime);

    // Handle midnight case
    if (taskTime === '00:00') {
        return currentMinutes < 1380; // Before 23:00
    }

    return currentMinutes <= taskMinutes + 30;
}

// ==========================================
// Storage Functions
// ==========================================

function saveState() {
    try {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.error('Error saving state:', e);
    }
}

function loadState() {
    try {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            state = { ...state, ...parsed };

            // Check if it's a new day
            const today = formatDate(new Date());
            if (state.lastCheckDate !== today) {
                handleNewDay(today);
            }
        }
    } catch (e) {
        console.error('Error loading state:', e);
    }
}

function handleNewDay(today) {
    // Check if all tasks were completed yesterday for streak
    const yesterdayCompleted = state.completedTasks.length === DAILY_ROUTINE.length;

    if (yesterdayCompleted && state.lastCheckDate) {
        state.streak += 1;
    } else if (state.lastCheckDate && !yesterdayCompleted) {
        // Only reset streak if there was a previous day and tasks weren't completed
        state.streak = 0;
    }

    // Reset daily data
    state.completedTasks = [];
    state.activities = [];
    state.lastCheckDate = today;

    saveState();
}

function resetAllData() {
    if (confirm('Tem certeza que deseja apagar todos os dados? Esta ação não pode ser desfeita.')) {
        localStorage.removeItem(CONFIG.STORAGE_KEY);
        state = {
            pet: null,
            happiness: 50,
            completedTasks: [],
            activities: [],
            streak: 0,
            totalPoints: 0,
            lastCheckDate: null,
            lastHappinessUpdate: Date.now()
        };
        showSetupScreen();
    }
}

// ==========================================
// UI Functions - Setup Screen
// ==========================================

function showSetupScreen() {
    document.getElementById('setup-screen').style.display = 'block';
    document.getElementById('dashboard-screen').style.display = 'none';
}

function showDashboard() {
    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('dashboard-screen').style.display = 'block';
    updateDashboard();
}

function setupPhotoUpload() {
    const photoPreview = document.getElementById('photo-preview');
    const photoInput = document.getElementById('pet-photo');
    const previewImage = document.getElementById('preview-image');

    photoPreview.addEventListener('click', () => photoInput.click());

    photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                previewImage.src = event.target.result;
                previewImage.style.display = 'block';
                document.querySelector('.photo-placeholder').style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    });
}

function setupForm() {
    const form = document.getElementById('pet-form');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const previewImage = document.getElementById('preview-image');

        state.pet = {
            name: document.getElementById('pet-name').value.trim(),
            breed: document.getElementById('pet-breed').value.trim(),
            age: document.getElementById('pet-age').value.trim(),
            personality: document.getElementById('pet-personality').value.trim(),
            photo: previewImage.src || CONFIG.DEFAULT_PHOTO
        };

        state.lastCheckDate = formatDate(new Date());
        state.happiness = 50;

        saveState();
        showDashboard();
    });
}

// ==========================================
// UI Functions - Dashboard
// ==========================================

function updateDashboard() {
    if (!state.pet) return;

    updateHeroSection();
    updateStats();
    updateHappinessMeter();
    updateRoutineList();
    updateTimeline();
}

function updateHeroSection() {
    const pet = state.pet;

    // Set background
    const heroBg = document.getElementById('hero-bg');
    heroBg.style.backgroundImage = `url(${pet.photo || CONFIG.DEFAULT_PHOTO})`;

    // Set pet photo
    const petPhoto = document.getElementById('hero-pet-photo');
    petPhoto.src = pet.photo || CONFIG.DEFAULT_PHOTO;

    // Set pet info
    document.getElementById('hero-pet-name').textContent = pet.name;
    document.getElementById('hero-pet-details').textContent = `${pet.breed} • ${pet.age}`;

    // Update happiness badge
    updateHappinessBadge();
}

function updateHappinessBadge() {
    const level = HAPPINESS_LEVELS.find(l => state.happiness >= l.min && state.happiness <= l.max);
    if (level) {
        document.querySelector('.happiness-emoji').textContent = level.emoji;
        document.querySelector('.happiness-text').textContent = level.text;
    }
}

function updateStats() {
    const completedCount = state.completedTasks.length;
    const totalTasks = DAILY_ROUTINE.length;

    document.getElementById('tasks-completed').textContent = `${completedCount}/${totalTasks}`;
    document.getElementById('streak-count').textContent = state.streak;
    document.getElementById('total-points').textContent = state.totalPoints;
}

function updateHappinessMeter() {
    const happiness = Math.max(0, Math.min(100, state.happiness));
    const level = HAPPINESS_LEVELS.find(l => happiness >= l.min && happiness <= l.max);

    document.getElementById('happiness-value').textContent = `${Math.round(happiness)}/100`;
    document.getElementById('happiness-value').style.color = level?.color || '#fbbf24';
    document.getElementById('happiness-fill').style.width = `${happiness}%`;

    updateHappinessBadge();
}

function updateRoutineList() {
    const container = document.getElementById('routine-list');
    container.innerHTML = '';

    DAILY_ROUTINE.forEach(task => {
        const isCompleted = state.completedTasks.includes(task.id);
        const isLate = !isCompleted && isTaskLate(task.time);
        const isPending = !isCompleted && !isLate;

        let statusClass = 'pending';
        let statusIcon = '⏳';

        if (isCompleted) {
            statusClass = 'completed';
            statusIcon = '✓';
        } else if (isLate) {
            statusClass = 'late';
            statusIcon = '!';
        }

        const taskEl = document.createElement('div');
        taskEl.className = `task-item ${statusClass}`;
        taskEl.dataset.taskId = task.id;

        taskEl.innerHTML = `
            <span class="task-time">${task.time}</span>
            <div class="task-info">
                <span class="task-name">${task.emoji} ${task.name}</span>
                <span class="task-points">+${task.points} pts</span>
            </div>
            <div class="task-status">${statusIcon}</div>
        `;

        if (!isCompleted) {
            taskEl.addEventListener('click', () => completeTask(task));
        }

        container.appendChild(taskEl);
    });

    // Update progress bar
    const progress = (state.completedTasks.length / DAILY_ROUTINE.length) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
    document.getElementById('routine-progress').textContent = `${Math.round(progress)}%`;
}

function updateTimeline() {
    const container = document.getElementById('timeline-list');

    if (state.activities.length === 0) {
        container.innerHTML = '<p class="empty-timeline">Nenhuma atividade registrada ainda</p>';
        return;
    }

    container.innerHTML = '';

    // Show last 10 activities, newest first
    const recentActivities = [...state.activities].reverse().slice(0, 10);

    recentActivities.forEach(activity => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.innerHTML = `
            <span class="timeline-time">${activity.time}</span>
            <span class="timeline-emoji">${activity.emoji}</span>
            <span class="timeline-text">${activity.name}</span>
            <span class="timeline-points">+${activity.points}</span>
        `;
        container.appendChild(item);
    });
}

// ==========================================
// Game Logic Functions
// ==========================================

function completeTask(task) {
    if (state.completedTasks.includes(task.id)) return;

    // Add to completed tasks
    state.completedTasks.push(task.id);

    // Add points
    addPoints(task.points, task.emoji);

    // Add happiness bonus (50% of points)
    addHappiness(Math.round(task.points * 0.5));

    // Add to timeline
    addActivity(task.name, task.emoji, task.points);

    // Save and update
    saveState();
    updateDashboard();

    // Check if all tasks completed
    if (state.completedTasks.length === DAILY_ROUTINE.length) {
        celebrateCompletion();
    }
}

function handleQuickAction(action, points, emoji) {
    // Add points
    addPoints(points, emoji);

    // Add happiness bonus (50% of points)
    addHappiness(Math.round(points * 0.5));

    // Add to timeline
    const actionNames = {
        'carinho': 'Carinho',
        'comida': 'Comida extra',
        'passeio': 'Passeio',
        'agua': 'Água fresca',
        'brincar': 'Brincadeira',
        'banho': 'Banho'
    };

    addActivity(actionNames[action] || action, emoji, points);

    // Save and update
    saveState();
    updateDashboard();
}

function addPoints(points, emoji) {
    state.totalPoints += points;
    showPointsPopup(points, emoji);
}

function addHappiness(amount) {
    state.happiness = Math.min(100, state.happiness + amount);
    state.lastHappinessUpdate = Date.now();
}

function addActivity(name, emoji, points) {
    state.activities.push({
        name,
        emoji,
        points,
        time: formatTime(new Date()),
        timestamp: Date.now()
    });
}

function showPointsPopup(points, emoji) {
    const popup = document.createElement('div');
    popup.className = 'points-popup';
    popup.textContent = `+${points} ${emoji}`;

    // Position near center of screen
    popup.style.left = '50%';
    popup.style.top = '40%';
    popup.style.transform = 'translateX(-50%)';

    document.body.appendChild(popup);

    setTimeout(() => popup.remove(), 1000);
}

function celebrateCompletion() {
    const modal = document.getElementById('celebration-modal');
    const message = document.getElementById('celebration-message');

    message.textContent = `Você completou todas as ${DAILY_ROUTINE.length} tasks de hoje! ${state.pet.name} está muito feliz! 🎉`;

    modal.style.display = 'flex';
}

// ==========================================
// Happiness Decay System
// ==========================================

function startHappinessDecay() {
    setInterval(() => {
        if (state.pet && state.happiness > 0) {
            state.happiness = Math.max(0, state.happiness - CONFIG.HAPPINESS_DECAY_RATE);
            state.lastHappinessUpdate = Date.now();
            saveState();
            updateHappinessMeter();
        }
    }, CONFIG.HAPPINESS_DECAY_INTERVAL);
}

// ==========================================
// Task Status Update
// ==========================================

function startTaskStatusUpdate() {
    // Update task statuses every minute
    setInterval(() => {
        if (state.pet) {
            updateRoutineList();
        }
    }, 60000);
}

// ==========================================
// Event Listeners Setup
// ==========================================

function setupEventListeners() {
    // Quick action buttons
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = btn.dataset.action;
            const points = parseInt(btn.dataset.points);
            const emoji = btn.dataset.emoji;

            // Visual feedback
            btn.style.transform = 'scale(1.15)';
            setTimeout(() => btn.style.transform = '', 300);

            handleQuickAction(action, points, emoji);
        });
    });

    // Settings button
    document.getElementById('settings-btn').addEventListener('click', () => {
        document.getElementById('settings-modal').style.display = 'flex';
    });

    // Close settings
    document.getElementById('close-settings').addEventListener('click', () => {
        document.getElementById('settings-modal').style.display = 'none';
    });

    // Edit pet button
    document.getElementById('edit-pet-btn').addEventListener('click', () => {
        document.getElementById('settings-modal').style.display = 'none';
        populateEditForm();
        showSetupScreen();
    });

    // Reset data button
    document.getElementById('reset-data-btn').addEventListener('click', () => {
        document.getElementById('settings-modal').style.display = 'none';
        resetAllData();
    });

    // Close celebration
    document.getElementById('close-celebration').addEventListener('click', () => {
        document.getElementById('celebration-modal').style.display = 'none';
    });

    // Close modals on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

function populateEditForm() {
    if (state.pet) {
        document.getElementById('pet-name').value = state.pet.name || '';
        document.getElementById('pet-breed').value = state.pet.breed || '';
        document.getElementById('pet-age').value = state.pet.age || '';
        document.getElementById('pet-personality').value = state.pet.personality || '';

        if (state.pet.photo && state.pet.photo !== CONFIG.DEFAULT_PHOTO) {
            const previewImage = document.getElementById('preview-image');
            previewImage.src = state.pet.photo;
            previewImage.style.display = 'block';
            document.querySelector('.photo-placeholder').style.display = 'none';
        }
    }
}

// ==========================================
// Initialization
// ==========================================

function init() {
    // Load saved state
    loadState();

    // Setup event listeners
    setupPhotoUpload();
    setupForm();
    setupEventListeners();

    // Show appropriate screen
    if (state.pet) {
        showDashboard();
    } else {
        showSetupScreen();
    }

    // Start background processes
    startHappinessDecay();
    startTaskStatusUpdate();

    console.log('PetCare initialized! 🐕');
}

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Service Worker Registration (PWA)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker not registered:', err));
    });
}
