export const COLORS = {
  positive: "#16a34a",
  negative: "#dc2626",
  neutral: "#6b7280",
};

const API_BASE_URL = 'http://localhost:3001/api';

export async function fetchFacebookData({ pageId, accessToken }) {
  try {
    console.log('Fetching Facebook data from backend...');
    
    const response = await fetch(`${API_BASE_URL}/comments`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const comments = await response.json();
    console.log(`Fetched ${comments.length} comments from backend`);
    
    return comments;
  } catch (error) {
    console.error('Error fetching Facebook data:', error);
    throw error; // Re-throw to trigger fallback in App.jsx
  }
}

export async function generateAISummary(comments, fromDate, toDate) {
  try {
    console.log('Generating AI summary...');
    
    const response = await fetch(`${API_BASE_URL}/summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        comments,
        fromDate,
        toDate
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('AI summary generated successfully');
    
    return data.summary;
  } catch (error) {
    console.error('Error generating AI summary:', error);
    throw error;
  }
}

// Fallback mock data (keep existing function)
export function generateMockComments({ pageId, accessToken, daysBack = 90, count = 250 }) {
  const sentiments = ["positive", "negative", "neutral"];
  const now = Date.now();
  const comments = [];
  
  for (let i = 0; i < count; i++) {
    const ts = new Date(now - Math.random() * daysBack * 24 * 60 * 60 * 1000);
    const text = `Mock comment #${i + 1} for page ${pageId || "<no-page>"}`;
    const r = Math.random();
    const sentiment = r < 0.55 ? "neutral" : r < 0.8 ? "positive" : "negative";
    comments.push({ 
      id: i, 
      message: text, 
      text: text,
      sentiment, 
      created_time: ts.toISOString(),
      from: { name: `User ${i + 1}`, id: `user_${i + 1}` },
      like_count: Math.floor(Math.random() * 10)
    });
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