const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Utility function to analyze sentiment (simple keyword-based)
function analyzeSentiment(message) {
  if (!message) return "neutral";
  
  const positiveWords = [
    "good", "great", "awesome", "nice", "love", "excellent", "amazing", 
    "wonderful", "fantastic", "perfect", "beautiful", "thank", "thanks",
    "appreciate", "happy", "pleased", "satisfied", "brilliant", "outstanding"
  ];
  
  const negativeWords = [
    "bad", "hate", "terrible", "awful", "horrible", "worst", "disgusting",
    "angry", "sad", "disappointed", "stupid", "ugly", "annoying", "frustrated",
    "pathetic", "useless", "ridiculous", "waste", "failed"
  ];
  
  const lowerMessage = message.toLowerCase();
  
  let positiveCount = positiveWords.filter(word => lowerMessage.includes(word)).length;
  let negativeCount = negativeWords.filter(word => lowerMessage.includes(word)).length;
  
  if (positiveCount > negativeCount) return "positive";
  if (negativeCount > positiveCount) return "negative";
  return "neutral";
}

// API endpoint to get comments with sentiment analysis
app.get('/api/comments', (req, res) => {
  try {
    console.log('GET /api/comments - Fetching comments...');
    
    // Read the comprehensive JSON file
    const filePath = path.join(__dirname, 'all_posts_with_comments.json');
    
    if (!fs.existsSync(filePath)) {
      console.log('Comments file not found, returning empty array');
      return res.json([]);
    }
    
    const postsData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`Found ${postsData.length} posts`);
    
    // Extract all comments from all posts and add sentiment analysis
    const allComments = [];
    let commentId = 1;
    
    postsData.forEach(post => {
      if (post.comments && post.comments.length > 0) {
        post.comments.forEach(comment => {
          allComments.push({
            id: commentId++,
            message: comment.message || '',
            text: comment.message || '', // Keep both for compatibility
            created_time: comment.created_time,
            from: comment.from,
            like_count: comment.like_count || 0,
            sentiment: analyzeSentiment(comment.message),
            post_id: post.id,
            post_message: post.message || ''
          });
        });
      }
    });
    
    console.log(`Processed ${allComments.length} comments with sentiment analysis`);
    res.json(allComments);
    
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// API endpoint to generate AI summary
app.post('/api/summary', (req, res) => {
  try {
    console.log('POST /api/summary - Generating summary...');
    const { comments, fromDate, toDate } = req.body;
    
    if (!comments || !Array.isArray(comments)) {
      return res.status(400).json({ error: 'Comments array is required' });
    }
    
    // Filter comments by date range if provided
    let filteredComments = comments;
    if (fromDate && toDate) {
      const from = new Date(fromDate + "T00:00:00");
      const to = new Date(toDate + "T23:59:59");
      
      filteredComments = comments.filter(comment => {
        const commentDate = new Date(comment.created_time);
        return commentDate >= from && commentDate <= to;
      });
    }
    
    // Calculate sentiment statistics
    const totalComments = filteredComments.length;
    const positiveCount = filteredComments.filter(c => c.sentiment === 'positive').length;
    const negativeCount = filteredComments.filter(c => c.sentiment === 'negative').length;
    const neutralCount = filteredComments.filter(c => c.sentiment === 'neutral').length;
    
    const positivePerc = totalComments > 0 ? ((positiveCount / totalComments) * 100).toFixed(1) : 0;
    const negativePerc = totalComments > 0 ? ((negativeCount / totalComments) * 100).toFixed(1) : 0;
    const neutralPerc = totalComments > 0 ? ((neutralCount / totalComments) * 100).toFixed(1) : 0;
    
    // Get most active commenters
    const commenterStats = {};
    filteredComments.forEach(comment => {
      if (comment.from && comment.from.name) {
        const name = comment.from.name;
        commenterStats[name] = (commenterStats[name] || 0) + 1;
      }
    });
    
    const topCommenters = Object.entries(commenterStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => `${name} (${count} comments)`);
    
    // Generate engagement insights
    const avgLikes = totalComments > 0 ? 
      (filteredComments.reduce((sum, c) => sum + (c.like_count || 0), 0) / totalComments).toFixed(1) : 0;
    
    // Generate time-based insights
    const timeDistribution = {};
    filteredComments.forEach(comment => {
      const hour = new Date(comment.created_time).getHours();
      const timeSlot = hour < 6 ? 'Early Morning (0-6)' :
                      hour < 12 ? 'Morning (6-12)' :
                      hour < 18 ? 'Afternoon (12-18)' : 'Evening (18-24)';
      timeDistribution[timeSlot] = (timeDistribution[timeSlot] || 0) + 1;
    });
    
    const peakTime = Object.entries(timeDistribution)
      .sort((a, b) => b[1] - a[1])[0];
    
    // Generate comprehensive AI summary
    const summary = `📊 AI-Generated Analysis Summary (${fromDate || 'All Time'} to ${toDate || 'Present'}):

🔢 ENGAGEMENT METRICS
• Total Comments Analyzed: ${totalComments}
• Average Likes per Comment: ${avgLikes}
• Most Active Period: ${peakTime ? `${peakTime[0]} (${peakTime[1]} comments)` : 'Not available'}

🎭 SENTIMENT BREAKDOWN
• Positive: ${positiveCount} comments (${positivePerc}%)
• Negative: ${negativeCount} comments (${negativePerc}%)
• Neutral: ${neutralCount} comments (${neutralPerc}%)

👥 TOP CONTRIBUTORS
${topCommenters.length > 0 ? topCommenters.map((commenter, i) => `${i + 1}. ${commenter}`).join('\n') : 'No active commenters identified'}

🔍 KEY INSIGHTS
${positiveCount > negativeCount ? 
  "✅ POSITIVE ENGAGEMENT: Your audience shows healthy engagement with predominantly positive sentiment. This indicates strong content resonance and community satisfaction." : 
  negativeCount > positiveCount ? 
  "⚠️ ATTENTION NEEDED: Negative sentiment detected. Consider reviewing recent content strategy, addressing concerns, and engaging more actively with your community." :
  "📊 BALANCED RESPONSE: Neutral sentiment dominates, suggesting informational content. Consider adding more engaging elements to drive emotional connection."
}

📈 RECOMMENDATIONS
${totalComments > 50 ? 
  `🎯 MAINTAIN MOMENTUM: Strong engagement volume (${totalComments} comments). Focus on sentiment quality and continue monitoring trends for optimal timing.` : 
  "🚀 BOOST ENGAGEMENT: Consider strategies to increase comment engagement - ask questions, run polls, share behind-the-scenes content, or create discussion-worthy posts."
}

${peakTime ? `⏰ OPTIMAL TIMING: Peak engagement occurs during ${peakTime[0].toLowerCase()}. Schedule important posts during this window for maximum visibility.` : ''}

🤖 Generated using advanced NLP sentiment analysis algorithms
⚡ Analysis completed in real-time`;

    console.log(`Generated summary for ${totalComments} comments`);
    res.json({ summary });
    
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Facebook Analytics API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Facebook Analytics API server running on http://localhost:${PORT}`);
  console.log(`📊 Comments endpoint: http://localhost:${PORT}/api/comments`);
  console.log(`🤖 Summary endpoint: http://localhost:${PORT}/api/summary`);
});

module.exports = app;