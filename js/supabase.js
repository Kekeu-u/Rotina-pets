/**
 * PetCare - Supabase Client (Modo Híbrido)
 * Sync automático sem login
 */

const SUPABASE_URL = 'https://ayddobtosltlfnaodhgq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_x0tHADtpPepVGXjy819jfw_MyZ-TsLy';

const Supabase = {
    url: SUPABASE_URL,
    key: SUPABASE_ANON_KEY,
    deviceId: null,

    // Gera ou recupera ID único do dispositivo
    getDeviceId() {
        if (this.deviceId) return this.deviceId;

        let id = localStorage.getItem('petcare_device_id');
        if (!id) {
            id = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('petcare_device_id', id);
        }
        this.deviceId = id;
        return id;
    },

    // Headers para requisições
    headers() {
        return {
            'Content-Type': 'application/json',
            'apikey': this.key,
            'Authorization': `Bearer ${this.key}`
        };
    },

    // Verifica se está online
    isOnline() {
        return navigator.onLine;
    },

    // ==================== SYNC ====================

    // Sincroniza dados do pet com a nuvem
    async syncPet(petData) {
        if (!this.isOnline()) return null;

        try {
            const deviceId = this.getDeviceId();
            const data = {
                device_id: deviceId,
                name: petData.name,
                breed: petData.breed,
                photo_data: petData.photo,
                updated_at: new Date().toISOString()
            };

            const res = await fetch(`${this.url}/rest/v1/devices`, {
                method: 'POST',
                headers: {
                    ...this.headers(),
                    'Prefer': 'return=representation,resolution=merge-duplicates'
                },
                body: JSON.stringify(data)
            });

            return res.ok ? await res.json() : null;
        } catch (e) {
            console.log('Sync pet offline:', e.message);
            return null;
        }
    },

    // Sincroniza estatísticas diárias
    async syncStats(stats) {
        if (!this.isOnline()) return null;

        try {
            const deviceId = this.getDeviceId();
            const data = {
                device_id: deviceId,
                date: stats.date,
                happiness: stats.happiness,
                points: stats.points,
                streak: stats.streak,
                completed_tasks: stats.done,
                updated_at: new Date().toISOString()
            };

            const res = await fetch(`${this.url}/rest/v1/device_stats`, {
                method: 'POST',
                headers: {
                    ...this.headers(),
                    'Prefer': 'return=representation,resolution=merge-duplicates'
                },
                body: JSON.stringify(data)
            });

            return res.ok ? await res.json() : null;
        } catch (e) {
            console.log('Sync stats offline:', e.message);
            return null;
        }
    },

    // Carrega dados da nuvem (para recuperação)
    async loadFromCloud() {
        if (!this.isOnline()) return null;

        try {
            const deviceId = this.getDeviceId();

            // Busca dados do pet
            const petRes = await fetch(
                `${this.url}/rest/v1/devices?device_id=eq.${deviceId}&select=*`,
                { headers: this.headers() }
            );

            if (!petRes.ok) return null;
            const pets = await petRes.json();
            if (!pets.length) return null;

            // Busca stats de hoje
            const today = new Date().toISOString().split('T')[0];
            const statsRes = await fetch(
                `${this.url}/rest/v1/device_stats?device_id=eq.${deviceId}&date=eq.${today}&select=*`,
                { headers: this.headers() }
            );

            const stats = statsRes.ok ? await statsRes.json() : [];

            return {
                pet: {
                    name: pets[0].name,
                    breed: pets[0].breed,
                    photo: pets[0].photo_data
                },
                stats: stats[0] || null
            };
        } catch (e) {
            console.log('Load from cloud error:', e.message);
            return null;
        }
    },

    // Sincroniza tudo de uma vez
    async syncAll(state) {
        if (!this.isOnline() || !state.pet) return;

        await this.syncPet(state.pet);
        await this.syncStats({
            date: state.lastDate,
            happiness: state.happiness,
            points: state.points,
            streak: state.streak,
            done: state.done
        });

        console.log('☁️ Dados sincronizados');
    }
};

window.Supabase = Supabase;
