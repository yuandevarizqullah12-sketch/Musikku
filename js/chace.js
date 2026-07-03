// ===== Cache Module (In-Memory + LocalStorage) =====
const memoryCache = new Map();
const CACHE_PREFIX = 'music_cache_';
const MAX_AGE = 3600000; // 1 hour

export const cache = {
    get(key) {
        // Check memory first
        if (memoryCache.has(key)) {
            const entry = memoryCache.get(key);
            if (Date.now() - entry.timestamp < MAX_AGE) {
                return entry.data;
            } else {
                memoryCache.delete(key);
            }
        }
        // Check localStorage
        const stored = localStorage.getItem(CACHE_PREFIX + key);
        if (stored) {
            try {
                const entry = JSON.parse(stored);
                if (Date.now() - entry.timestamp < MAX_AGE) {
                    // Store back to memory
                    memoryCache.set(key, entry);
                    return entry.data;
                } else {
                    localStorage.removeItem(CACHE_PREFIX + key);
                }
            } catch (e) {}
        }
        return null;
    },

    set(key, data) {
        const entry = {
            data,
            timestamp: Date.now()
        };
        memoryCache.set(key, entry);
        try {
            localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
        } catch (e) {}
    },

    clear() {
        memoryCache.clear();
        // Clear all localStorage items with prefix
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(CACHE_PREFIX)) {
                localStorage.removeItem(key);
            }
        }
    }
};