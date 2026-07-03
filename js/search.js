// ===== Search Module =====
import { searchSongs } from './firebase.js';
import { cache } from './cache.js';
import { ui } from './ui.js';
import { setQueue } from './player.js';

const searchInput = document.getElementById('searchInput');
let debounceTimer = null;

// ----- Debounced Search -----
searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const query = searchInput.value.trim();
    if (query.length === 0) {
        ui.showEmptyState();
        return;
    }
    debounceTimer = setTimeout(() => performSearch(query), 300);
});

// ----- Perform Search -----
async function performSearch(query) {
    // Check cache first (memory)
    const cached = cache.get(query);
    if (cached) {
        ui.renderResults(cached);
        return;
    }

    // Show skeletons
    ui.showSkeletons(6);

    try {
        const results = await searchSongs(query);
        if (results && results.length > 0) {
            cache.set(query, results);
            ui.renderResults(results);
        } else {
            ui.showEmptyState('Tidak ada hasil untuk "' + query + '"');
        }
    } catch (error) {
        console.error('Search error:', error);
        // Check if offline
        if (!navigator.onLine) {
            ui.showOfflineState();
        } else {
            ui.showEmptyState('Terjadi kesalahan, coba lagi.');
        }
    }
}

// ----- Handle click on result card (play) -----
document.addEventListener('click', (e) => {
    const card = e.target.closest('.result-card');
    if (card) {
        const videoId = card.dataset.videoId;
        if (videoId) {
            // Get all results from current render
            const cards = document.querySelectorAll('.result-card');
            const songs = [];
            cards.forEach(c => {
                const vid = c.dataset.videoId;
                const title = c.querySelector('.result-card__title')?.textContent || '';
                const artist = c.querySelector('.result-card__artist')?.textContent || '';
                const thumbnail = c.querySelector('.result-card__thumbnail')?.src || '';
                const duration = c.querySelector('.result-card__duration')?.textContent || '';
                if (vid) songs.push({ videoId: vid, title, artist, thumbnail, duration });
            });
            const index = songs.findIndex(s => s.videoId === videoId);
            if (index !== -1) {
                setQueue(songs, index);
            }
        }
    }
    // Click on play button inside card
    const playBtn = e.target.closest('.result-card__play-btn');
    if (playBtn) {
        e.stopPropagation();
        const card = playBtn.closest('.result-card');
        if (card) card.click();
    }
});

// ----- Retry offline -----
document.getElementById('offlineRetryBtn').addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) performSearch(query);
    else ui.showEmptyState();
});

// ----- Export for offline state -----
export { performSearch };