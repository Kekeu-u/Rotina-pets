/**
 * PetCare - Supabase Client
 * Database and Auth integration
 */

// Supabase Config - Replace with your project details
const SUPABASE_URL = 'https://ayddobtosltlfnaodhgq.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE'; // Get from Supabase Dashboard > Settings > API

// Simple Supabase Client (no SDK needed)
const Supabase = {
    url: SUPABASE_URL,
    key: SUPABASE_ANON_KEY,

    // Set the anon key
    init(anonKey) {
        this.key = anonKey;
        localStorage.setItem('supabase_anon_key', anonKey);
    },

    load() {
        const key = localStorage.getItem('supabase_anon_key');
        if (key) this.key = key;
        return !!key && key !== 'YOUR_ANON_KEY_HERE';
    },

    // Get auth headers
    headers(accessToken = null) {
        const h = {
            'Content-Type': 'application/json',
            'apikey': this.key,
        };
        if (accessToken) {
            h['Authorization'] = `Bearer ${accessToken}`;
        } else {
            h['Authorization'] = `Bearer ${this.key}`;
        }
        return h;
    },

    // ==================== AUTH ====================

    // Sign in with Google (opens popup)
    async signInWithGoogle() {
        const redirectUrl = window.location.origin + window.location.pathname;
        const authUrl = `${this.url}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`;
        window.location.href = authUrl;
    },

    // Sign out
    async signOut() {
        const token = this.getAccessToken();
        if (token) {
            await fetch(`${this.url}/auth/v1/logout`, {
                method: 'POST',
                headers: this.headers(token)
            });
        }
        localStorage.removeItem('supabase_session');
        localStorage.removeItem('supabase_user');
    },

    // Get current session from URL hash (after OAuth redirect)
    async handleAuthCallback() {
        const hash = window.location.hash;
        if (hash && hash.includes('access_token')) {
            const params = new URLSearchParams(hash.substring(1));
            const session = {
                access_token: params.get('access_token'),
                refresh_token: params.get('refresh_token'),
                expires_in: params.get('expires_in'),
                token_type: params.get('token_type'),
                expires_at: Date.now() + (parseInt(params.get('expires_in')) * 1000)
            };

            // Get user data
            const user = await this.getUser(session.access_token);
            if (user) {
                localStorage.setItem('supabase_session', JSON.stringify(session));
                localStorage.setItem('supabase_user', JSON.stringify(user));
            }

            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
            return { session, user };
        }
        return null;
    },

    // Get user from token
    async getUser(accessToken) {
        try {
            const res = await fetch(`${this.url}/auth/v1/user`, {
                headers: this.headers(accessToken)
            });
            if (res.ok) return await res.json();
        } catch (e) {
            console.error('Get user error:', e);
        }
        return null;
    },

    // Get stored session
    getSession() {
        const s = localStorage.getItem('supabase_session');
        if (s) {
            const session = JSON.parse(s);
            // Check if expired
            if (session.expires_at && Date.now() > session.expires_at) {
                this.signOut();
                return null;
            }
            return session;
        }
        return null;
    },

    // Get stored user
    getStoredUser() {
        const u = localStorage.getItem('supabase_user');
        return u ? JSON.parse(u) : null;
    },

    // Get access token
    getAccessToken() {
        const session = this.getSession();
        return session?.access_token || null;
    },

    // Check if logged in
    isLoggedIn() {
        return !!this.getSession();
    },

    // ==================== DATABASE ====================

    // Query helper
    async query(table, options = {}) {
        const token = this.getAccessToken();
        let url = `${this.url}/rest/v1/${table}`;

        const params = new URLSearchParams();

        if (options.select) params.append('select', options.select);
        if (options.eq) {
            for (const [col, val] of Object.entries(options.eq)) {
                params.append(col, `eq.${val}`);
            }
        }
        if (options.order) params.append('order', options.order);
        if (options.limit) params.append('limit', options.limit);

        const queryString = params.toString();
        if (queryString) url += '?' + queryString;

        const res = await fetch(url, {
            headers: this.headers(token)
        });

        return res.ok ? await res.json() : [];
    },

    // Insert
    async insert(table, data) {
        const token = this.getAccessToken();
        const res = await fetch(`${this.url}/rest/v1/${table}`, {
            method: 'POST',
            headers: {
                ...this.headers(token),
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(data)
        });
        return res.ok ? await res.json() : null;
    },

    // Update
    async update(table, data, eq) {
        const token = this.getAccessToken();
        const params = new URLSearchParams();
        for (const [col, val] of Object.entries(eq)) {
            params.append(col, `eq.${val}`);
        }

        const res = await fetch(`${this.url}/rest/v1/${table}?${params}`, {
            method: 'PATCH',
            headers: {
                ...this.headers(token),
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(data)
        });
        return res.ok ? await res.json() : null;
    },

    // Delete
    async delete(table, eq) {
        const token = this.getAccessToken();
        const params = new URLSearchParams();
        for (const [col, val] of Object.entries(eq)) {
            params.append(col, `eq.${val}`);
        }

        const res = await fetch(`${this.url}/rest/v1/${table}?${params}`, {
            method: 'DELETE',
            headers: this.headers(token)
        });
        return res.ok;
    },

    // Upsert (insert or update)
    async upsert(table, data) {
        const token = this.getAccessToken();
        const res = await fetch(`${this.url}/rest/v1/${table}`, {
            method: 'POST',
            headers: {
                ...this.headers(token),
                'Prefer': 'return=representation,resolution=merge-duplicates'
            },
            body: JSON.stringify(data)
        });
        return res.ok ? await res.json() : null;
    },

    // ==================== STORAGE ====================

    // Upload file
    async uploadFile(bucket, path, file) {
        const token = this.getAccessToken();
        const res = await fetch(`${this.url}/storage/v1/object/${bucket}/${path}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': this.key
            },
            body: file
        });

        if (res.ok) {
            return `${this.url}/storage/v1/object/public/${bucket}/${path}`;
        }
        return null;
    },

    // Get public URL
    getPublicUrl(bucket, path) {
        return `${this.url}/storage/v1/object/public/${bucket}/${path}`;
    }
};

window.Supabase = Supabase;
