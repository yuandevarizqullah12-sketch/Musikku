// ===== UI Rendering Module =====
export const ui = {
    showSkeletons(count = 6) {
        const container = document.getElementById('resultsContainer');
        const empty = document.getElementById('emptyState');
        const offline = document.getElementById('offlineState');
        empty.style.display = 'none';
        offline.style.display = 'none';
        container.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const skeleton = document.createElement('div');
            skeleton.className = 'skeleton-card';
            skeleton.innerHTML = `
                <div class="skeleton-card__thumb"></div>
                <div class="skeleton-card__body">
                    <div class="skeleton-card__line"></div>
                    <div class="skeleton-card__line skeleton-card__line--short"></div>
                    <div class="skeleton-card__line skeleton-card__line--medium"></div>
                </div>
            `;
            container.appendChild(skeleton);
        }
    },

    renderResults(songs) {
        const container = document.getElementById('resultsContainer');
        const empty = document.getElementById('emptyState');
        const offline = document.getElementById('offlineState');
        empty.style.display = 'none';
        offline.style.display = 'none';
        container.innerHTML = '';
        if (!songs || songs.length === 0) {
            this.showEmptyState('Tidak ada hasil');
            return;
        }
        songs.forEach(song => {
            const card = document.createElement('div');
            card.className = 'result-card';
            card.dataset.videoId = song.videoId;
            card.innerHTML = `
                <img class="result-card__thumbnail" src="${song.thumbnail || ''}" alt="${song.title || 'Lagu'}" loading="lazy" />
                <div class="result-card__body">
                    <div class="result-card__title">${escapeHtml(song.title) || 'Untitled'}</div>
                    <div class="result-card__artist">${escapeHtml(song.artist) || 'Unknown'}</div>
                    <div class="result-card__footer">
                        <span class="result-card__duration">${song.duration || '—'}</span>
                        <button class="result-card__play-btn" aria-label="Putar">▶</button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    },

    showEmptyState(message = 'Cari lagu favoritmu') {
        const container = document.getElementById('resultsContainer');
        const empty = document.getElementById('emptyState');
        const offline = document.getElementById('offlineState');
        container.innerHTML = '';
        offline.style.display = 'none';
        empty.style.display = 'block';
        const title = empty.querySelector('.empty-state__title');
        const desc = empty.querySelector('.empty-state__desc');
        if (message && message !== 'Cari lagu favoritmu') {
            title.textContent = message;
            desc.textContent = 'Coba dengan kata kunci lain.';
        } else {
            title.textContent = 'Cari lagu favoritmu';
            desc.textContent = 'Mulai ketik di kolom pencarian untuk menemukan musik.';
        }
    },

    showOfflineState() {
        const container = document.getElementById('resultsContainer');
        const empty = document.getElementById('emptyState');
        const offline = document.getElementById('offlineState');
        container.innerHTML = '';
        empty.style.display = 'none';
        offline.style.display = 'block';
    },

    highlightResult(videoId) {
        // Remove previous highlight
        document.querySelectorAll('.result-card').forEach(c => c.style.borderColor = '');
        if (videoId) {
            const card = document.querySelector(`.result-card[data-video-id="${videoId}"]`);
            if (card) card.style.borderColor = '#3b82f6';
        }
    }
};

// Helper to escape HTML
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}