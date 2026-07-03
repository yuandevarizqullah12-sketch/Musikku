// ===== Firebase API Client =====
// This module communicates with the Vercel backend API (/api/search)

export async function searchSongs(query) {
    try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        // Expected format: { results: [ { videoId, title, artist, thumbnail, duration } ] }
        return data.results || [];
    } catch (error) {
        console.error('Firebase API fetch failed:', error);
        throw error;
    }
}