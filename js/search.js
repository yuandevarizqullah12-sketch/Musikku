// ===== Search Module =====
import { searchSongs } from './firebase.js';
import { cache } from './cache.js';
import { ui } from './ui.js';
import { setQueue } from './player.js';

let searchInput;
let debounceTimer = null;

// ----- Debounced Search -----
function performSearch(query) {
    const cached = cache.get(query);
    if (cached) {
        ui.renderResults(cached);
        return;
    }
    ui.showSkeletons(6);
    searchSongs(query)
        .then(results => {
            if (results && results.length > 0) {
                cache.set(query, results);
                ui.renderResults(results);
            } else {
                ui.showEmptyState('Tidak ada hasil untuk "' + query + '"');
            }
        })
        .catch(error => {
            console.error('Search error:', error);
            if (!navigator.onLine) ui.showOfflineState();
            else ui.showEmptyState('Terjadi kesalahan, coba lagi.');
        });
}

function handleInput() {
    clearTimeout(debounceTimer);
    const query = searchInput.value.trim();
    if (query.length === 0) {
        ui.showEmptyState();
        return;
    }
    debounceTimer = setTimeout(() => performSearch(query), 300);
}

// ----- Event listeners -----
function setupEventListeners() {
    searchInput.addEventListener('input', handleInput);

    // Klik pada card
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.result-card');
        if (card) {
            const videoId = card.dataset.videoId;
            if (videoId) {
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
                if (index !== -1) setQueue(songs, index);
            }
        }
        const playBtn = e.target.closest('.result-card__play-btn');
        if (playBtn) {
            e.stopPropagation();
            const card = playBtn.closest('.result-card');
            if (card) card.click();
        }
    });

    // Retry offline
    const retryBtn = document.getElementById('offlineRetryBtn');
    if (retryBtn) {
        retryBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) performSearch(query);
            else ui.showEmptyState();
        });
    }
}

// ----- Public init -----
export function init() {
    searchInput = document.getElementById('searchInput');
    if (!searchInput) {
        console.error('Search: searchInput not found');
        return;
    }
    setupEventListeners();
    console.log('🔍 Search module initialized');
}

export { performSearch };