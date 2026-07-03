// ===== Main Entry Point =====
import { init as initPlayer } from './player.js';
import { init as initSearch } from './search.js';
import { init as initMediaSession } from './mediaSession.js';
import { ui } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    // Inisialisasi UI
    ui.showEmptyState();

    // Inisialisasi modul (urutan penting: player dulu, lalu search, lalu mediaSession)
    initPlayer();
    initSearch();
    initMediaSession();

    console.log('🎵 Musikku app initialized');
});