// ===== Media Session API Module =====
// This integrates with the player module

if ('mediaSession' in navigator) {
    const player = window.playerModule || {};

    navigator.mediaSession.setActionHandler('play', () => {
        if (player.togglePlay) player.togglePlay();
        else console.warn('MediaSession: play handler not set');
    });
    navigator.mediaSession.setActionHandler('pause', () => {
        if (player.togglePlay) player.togglePlay();
    });
    navigator.mediaSession.setActionHandler('previoustrack', () => {
        if (player.playPrev) player.playPrev();
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => {
        if (player.playNext) player.playNext();
    });
    // Stop action optional
    navigator.mediaSession.setActionHandler('stop', () => {
        // Could pause
        if (player.togglePlay) {
            // If playing, pause
            // We'll just toggle to pause
            // But better to check state
        }
    });

    console.log('Media Session API initialized');
}