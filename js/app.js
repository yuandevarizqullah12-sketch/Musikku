// ===== Main Entry Point =====
import './player.js';
import './search.js';
import './mediaSession.js';
import { ui } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI state
    ui.showEmptyState();

    // Optional: restore volume from localStorage
    const savedVolume = localStorage.getItem('playerVolume');
    if (savedVolume !== null) {
        const vol = parseInt(savedVolume, 10);
        const slider = document.getElementById('volumeSlider');
        if (slider) slider.value = vol;
    }

    console.log('🎵 Musikku app initialized');
});