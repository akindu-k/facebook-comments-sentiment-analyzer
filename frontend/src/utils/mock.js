export const COLORS = {
    positive: "#16a34a",
    negative: "#dc2626",
    neutral: "#6b7280",
    };
    
    
    export function generateMockComments({ pageId, accessToken, daysBack = 90, count = 250 }) {
    const sentiments = ["positive", "negative", "neutral"];
    const now = Date.now();
    const comments = [];
    for (let i = 0; i < count; i++) {
    const ts = new Date(now - Math.random() * daysBack * 24 * 60 * 60 * 1000);
    const text = `Mock comment #${i + 1} for page ${pageId || "<no-page>"}`;
    const r = Math.random();
    const sentiment = r < 0.55 ? "neutral" : r < 0.8 ? "positive" : "negative";
    comments.push({ id: i, text, sentiment, created_time: ts.toISOString() });
    }
    return comments.sort((a, b) => new Date(a.created_time) - new Date(b.created_time));
    }
    
    
    export function aggregateByDay(comments) {
    const map = new Map();
    comments.forEach((c) => {
    const k = c.created_time.slice(0, 10);
    if (!map.has(k)) map.set(k, { date: k, positive: 0, negative: 0, neutral: 0 });
    map.get(k)[c.sentiment] += 1;
    });
    return [...map.values()].sort((a, b) => (a.date > b.date ? 1 : -1));
    }