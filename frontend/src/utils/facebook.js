export const COLORS = {
    positive: "#16a34a",
    negative: "#dc2626",
    neutral: "#6b7280",
  };
  
  // Simulate sentiment analysis for real Facebook comments
  function analyzeSentiment(message) {
    if (!message) return "neutral";
    
    const positiveWords = ["good", "great", "awesome", "nice", "love", "excellent", "amazing", "wonderful", "fantastic", "perfect", "beautiful", "thank"];
    const negativeWords = ["bad", "hate", "terrible", "awful", "horrible", "worst", "disgusting", "angry", "sad", "disappointed", "stupid", "ugly"];
    
    const lowerMessage = message.toLowerCase();
    
    let positiveCount = positiveWords.filter(word => lowerMessage.includes(word)).length;
    let negativeCount = negativeWords.filter(word => lowerMessage.includes(word)).length;
    
    if (positiveCount > negativeCount) return "positive";
    if (negativeCount > positiveCount) return "negative";
    return "neutral";
  }
  
  export async function fetchFacebookData({ pageId, accessToken }) {
    try {
      // In a real implementation, you would fetch from your backend API
      // For now, we'll simulate loading from the JSON file
      
      // You can either:
      // 1. Create an API endpoint in your backend to serve this data
      // 2. Copy the JSON file to your frontend public folder
      // 3. Use a backend API to fetch fresh data from Facebook
      
      // Simulating API call with static data for now
      const response = await fetch('/api/facebook-posts'); // You'll need to create this endpoint
      
      if (!response.ok) {
        throw new Error('Failed to fetch Facebook data');
      }
      
      const posts = await response.json();
      
      // Extract all comments from all posts and add sentiment analysis
      const allComments = [];
      
      posts.forEach(post => {
        if (post.comments && post.comments.length > 0) {
          post.comments.forEach(comment => {
            allComments.push({
              ...comment,
              sentiment: analyzeSentiment(comment.message),
              post_id: post.id,
              post_message: post.message
            });
          });
        }
      });
      
      return allComments;
    } catch (error) {
      console.error('Error fetching Facebook data:', error);
      // Fallback to mock data if real data fails
      return generateMockComments({ pageId, accessToken });
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
        text: text, // Keep both for compatibility
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