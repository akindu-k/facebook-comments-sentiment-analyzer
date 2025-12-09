import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import OpenAI from 'openai';

// Load environment variables
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openai = new OpenAI({
    apiKey:"YOUR_API_KEY_HERE", 
});

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// OpenAI-powered sentiment analysis
async function analyzeSentiment(message) {
    try {
        if (!message || message.trim() === '') {
            return "neutral";
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a sentiment analyzer. Reply with only one word: 'positive', 'negative', or 'neutral'."
                },
                {
                    role: "user",
                    content: message
                }
            ],
            temperature: 0.1,
        });

        return response.choices[0].message.content.toLowerCase().trim();
    } catch (error) {
        console.error('OpenAI sentiment analysis failed:', error);
        // Fallback to simple keyword-based analysis
        return fallbackSentimentAnalysis(message);
    }
}

// Fallback sentiment analysis function
function fallbackSentimentAnalysis(message) {
    if (!message) return "neutral";
    
    const positiveWords = ["good", "great", "awesome", "nice", "love", "excellent", "amazing", "wonderful"];
    const negativeWords = ["bad", "hate", "terrible", "awful", "horrible", "worst", "disgusting", "angry"];
    
    const lowerMessage = message.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerMessage.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerMessage.includes(word)).length;
    
    if (positiveCount > negativeCount) return "positive";
    if (negativeCount > positiveCount) return "negative";
    return "neutral";
}

app.get('/api/comments', async (req, res) => {
    try {
        console.log('GET /api/comments - Fetching comments...');
        
        const filePath = path.join(__dirname, 'all_posts_with_comments.json');

        if (!fs.existsSync(filePath)) {
            console.log("JSON file with extracted posts and comments not found");
            return res.status(404).json({ error: "Data file not found" });
        }

        const postsData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        console.log(`Found ${postsData.length} posts`);

        const allComments = [];
        let commentId = 1;

        // Process comments with sentiment analysis (using fallback for now to avoid API costs)
        for (const post of postsData) {
            if (post.comments && post.comments.length > 0) {
                for (const comment of post.comments) {
                    // Use fallback sentiment analysis to avoid excessive API calls during testing
                    const sentiment = fallbackSentimentAnalysis(comment.message);
                    allComments.push({
                        id: commentId++,
                        message: comment.message || "",
                        text: comment.message || "",
                        created_time: comment.created_time || "",
                        from: comment.from,
                        like_count: comment.like_count || 0,
                        sentiment: sentiment,
                        post_id: post.id,
                        post_message: post.message || ""
                    });
                }
            }
        }

        console.log(`Total comments extracted: ${allComments.length}`);
        res.json(allComments);

    } catch (error) {
        console.error("Error fetching comments: ", error);
        res.status(500).json({ error: "Failed to fetch comments" });
    }
});

app.post("/api/summary", async (req, res) => {
    try {
        console.log("POST /api/summary - Generating AI summary...");
        const { comments, fromDate, toDate } = req.body;

        if (!comments || !Array.isArray(comments)) {
            return res.status(400).json({ error: "Comments array is needed" });
        }

        let filteredComments = comments;

        if (fromDate && toDate) {
            const f = new Date(fromDate + "T00:00:00");
            const t = new Date(toDate + "T23:59:59");

            filteredComments = comments.filter(c => {
                const d = new Date(c.created_time);
                return d >= f && d <= t;
            });
        }

        const totalComments = filteredComments.length;

        if (totalComments === 0) {
            return res.json({ summary: "No comments found in the selected date range." });
        }

        // Calculate sentiment counts
        const sentimentCounts = {
            positive: filteredComments.filter(c => c.sentiment === 'positive').length,
            negative: filteredComments.filter(c => c.sentiment === 'negative').length,
            neutral: filteredComments.filter(c => c.sentiment === 'neutral').length
        };

        // Calculate Top Commenters
        const commenterStats = {};
        filteredComments.forEach(c => {
            const name = c.from?.name || 'Unknown';
            commenterStats[name] = (commenterStats[name] || 0) + 1;
        });
        const topCommenters = Object.entries(commenterStats)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([name, count]) => `${name} (${count})`);

        // Calculate Peak Time
        const timeDistribution = {};
        filteredComments.forEach(c => {
            const hour = new Date(c.created_time).getHours();
            const slot = hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening';
            timeDistribution[slot] = (timeDistribution[slot] || 0) + 1;
        });
        const peakTime = Object.entries(timeDistribution).sort((a, b) => b[1] - a[1])[0] || ['N/A', 0];

        const promptPayload = {
            period: `${fromDate || 'Start'} to ${toDate || 'Now'}`,
            metrics: {
                total: totalComments,
                sentiments: sentimentCounts,
                peak_activity: peakTime[0],
                top_users: topCommenters
            }
        };

        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: `You are an expert social media analyst. 
                        Analyze the JSON metrics provided and write a comprehensive summary report.
                        
                        Guidelines:
                        - Use emojis and clear sections: '📊 ENGAGEMENT', '🎭 SENTIMENT', '🔍 KEY INSIGHTS', '📈 RECOMMENDATIONS'
                        - In 'KEY INSIGHTS', analyze sentiment ratios and community health
                        - In 'RECOMMENDATIONS', give specific actionable advice
                        - Keep it professional but engaging with bullet points`
                    },
                    {
                        role: "user",
                        content: JSON.stringify(promptPayload)
                    }
                ],
                temperature: 0.7,
            });

            const aiSummary = completion.choices[0].message.content;
            console.log(`Generated AI summary for ${totalComments} comments`);
            res.json({ summary: aiSummary });

        } catch (openaiError) {
            console.error("OpenAI API error, generating fallback summary:", openaiError);
            
            // Fallback summary generation
            const positivePerc = totalComments > 0 ? ((sentimentCounts.positive / totalComments) * 100).toFixed(1) : 0;
            const negativePerc = totalComments > 0 ? ((sentimentCounts.negative / totalComments) * 100).toFixed(1) : 0;
            const neutralPerc = totalComments > 0 ? ((sentimentCounts.neutral / totalComments) * 100).toFixed(1) : 0;

            const fallbackSummary = `📊 ENGAGEMENT METRICS
• Total Comments Analyzed: ${totalComments}
• Most Active Period: ${peakTime[0]}
• Top Contributors: ${topCommenters.join(', ')}

🎭 SENTIMENT BREAKDOWN
• Positive: ${sentimentCounts.positive} comments (${positivePerc}%)
• Negative: ${sentimentCounts.negative} comments (${negativePerc}%)
• Neutral: ${sentimentCounts.neutral} comments (${neutralPerc}%)

🔍 KEY INSIGHTS
${sentimentCounts.positive > sentimentCounts.negative ? 
  "✅ Positive sentiment dominates - healthy community engagement detected" : 
  sentimentCounts.negative > sentimentCounts.positive ? 
  "⚠️ Negative sentiment detected - consider reviewing content strategy" :
  "📊 Balanced sentiment distribution - neutral community response"
}

📈 RECOMMENDATIONS
• ${totalComments > 50 ? 
  "Maintain current engagement levels and monitor sentiment trends" : 
  "Focus on strategies to increase comment engagement"
}
• Optimize posting times around ${peakTime[0].toLowerCase()} for maximum reach

🤖 Generated using fallback analysis (OpenAI API unavailable)`;

            res.json({ summary: fallbackSummary });
        }

    } catch (error) {
        console.error("Error generating summary: ", error);
        res.status(500).json({ error: "Failed to generate summary" });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Facebook Analytics API is running',
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Facebook Analytics API server running on http://localhost:${PORT}`);
    console.log(`📊 Comments endpoint: http://localhost:${PORT}/api/comments`);
    console.log(`🤖 Summary endpoint: http://localhost:${PORT}/api/summary`);
    console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
});

export default app;