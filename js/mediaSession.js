// ===== Media Session API Module =====
// This integrates with the player module via window.player

if ('mediaSession' in navigator) {
    // Set action handlers
    try {
        navigator.mediaSession.setActionHandler('play', () => {
            const player = window.player;
            if (player && player.togglePlay) {
                player.togglePlay();
            } else {
                console.warn('MediaSession: play handler - player not ready');
            }
        });

        navigator.mediaSession.setActionHandler('pause', () => {
            const player = window.player;
            if (player && player.togglePlay) {
                player.togglePlay();
            }
        });

        navigator.mediaSession.setActionHandler('previoustrack', () => {
            const player = window.player;
            if (player && player.playPrev) {
                player.playPrev();
            }
        });

        navigator.mediaSession.setActionHandler('nexttrack', () => {
            const player = window.player;
            if (player && player.playNext) {
                player.playNext();
            }
        });

        // Stop handler (optional)
        navigator.mediaSession.setActionHandler('stop', () => {
            const player = window.player;
            if (player && player.togglePlay) {
                // Pause if playing (simplified: just toggle)
                player.togglePlay();
            }
        });

        console.log('✅ Media Session API initialized');
    } catch (error) {
        console.warn('⚠️ Media Session API setup error:', error);
    }
} else {
    console.log('ℹ️ Media Session API not supported');
}

// ----- Exported functions for player to update metadata and playback state -----
export function updateMediaMetadata(song) {
    if (!('mediaSession' in navigator)) return;
    if (!song) return;
    try {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: song.title || 'Unknown',
            artist: song.artist || 'Unknown',
            album: 'Musikku',
            artwork: [
                { src: song.thumbnail || '', sizes: '96x96', type: 'image/jpeg' },
                { src: song.thumbnail || '', sizes: '128x128', type: 'image/jpeg' },
                { src: song.thumbnail || '', sizes: '192x192', type: 'image/jpeg' },
                { src: song.thumbnail || '', sizes: '256x256', type: 'image/jpeg' },
                { src: song.thumbnail || '', sizes: '384x384', type: 'image/jpeg' },
                { src: song.thumbnail || '', sizes: '512x512', type: 'image/jpeg' },
            ]
        });
    } catch (e) {
        console.warn('Failed to update media metadata:', e);
    }
}

export function updatePlaybackState(state) {
    if (!('mediaSession' in navigator)) return;
    try {
        navigator.mediaSession.playbackState = state; // 'playing', 'paused', 'none'
    } catch (e) {
        console.warn('Failed to update playback state:', e);
    }
}