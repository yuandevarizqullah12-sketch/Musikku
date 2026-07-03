import { Firestore, Timestamp, FieldValue } from '@google-cloud/firestore';

let firestore;
if (process.env.FIREBASE_PROJECT_ID) {
    firestore = new Firestore({
        projectId: process.env.FIREBASE_PROJECT_ID,
        credentials: {
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        },
    });
} else {
    console.warn('Firestore not configured. Using mock.');
}

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Missing query parameter' });

    try {
        const cached = await getFromFirestore(query);
        if (cached) return res.status(200).json({ results: cached });

        const youtubeResults = await fetchYouTube(query);
        if (youtubeResults.length === 0) return res.status(200).json({ results: [] });

        await storeInFirestore(query, youtubeResults);
        return res.status(200).json({ results: youtubeResults });
    } catch (error) {
        console.error('Search error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function getFromFirestore(query) {
    if (!firestore) return null;
    try {
        const docRef = firestore.collection('songs').doc(query.toLowerCase());
        const doc = await docRef.get();
        if (doc.exists) {
            const data = doc.data();
            const cachedAt = data.cachedAt?.toMillis?.() || 0;
            if (Date.now() - cachedAt < 3600000) return data.results || null;
        }
        return null;
    } catch (e) { return null; }
}

async function storeInFirestore(query, results) {
    if (!firestore) return;
    try {
        const docRef = firestore.collection('songs').doc(query.toLowerCase());
        await docRef.set({ results, cachedAt: Timestamp.now() });
        const searchRef = firestore.collection('searches').doc(query.toLowerCase());
        await searchRef.set({ query, count: FieldValue.increment(1), lastSearched: Timestamp.now() }, { merge: true });
    } catch (e) { console.error('Firestore write error:', e); }
}

async function fetchYouTube(query) {
    if (!YOUTUBE_API_KEY) return [];
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=20&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}`;
    try {
        const response = await fetch(url);
        if (!response.ok) return [];
        const data = await response.json();
        if (!data.items) return [];

        const videoIds = data.items.map(item => item.id.videoId).join(',');
        const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
        const detailsResp = await fetch(detailsUrl);
        const detailsData = await detailsResp.json();
        const durationMap = {};
        if (detailsData.items) {
            detailsData.items.forEach(item => {
                durationMap[item.id] = formatDuration(item.contentDetails.duration);
            });
        }
        return data.items.map(item => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            artist: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
            duration: durationMap[item.id.videoId] || '—',
        }));
    } catch (e) {
        console.error('YouTube fetch error:', e);
        return [];
    }
}

function formatDuration(isoString) {
    const match = isoString.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return '—';
    const hours = parseInt(match[1]) || 0;
    const mins = parseInt(match[2]) || 0;
    const secs = parseInt(match[3]) || 0;
    if (hours > 0) return `${hours}:${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
    return `${mins}:${secs.toString().padStart(2,'0')}`;
}