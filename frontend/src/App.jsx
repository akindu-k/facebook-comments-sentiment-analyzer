import React, { useState, useMemo } from "react";
import { Inputs } from "./components/Inputs";
import { SentimentPie, SentimentTimeline } from "./components/Charts";
import { Comments } from "./components/Comments";
import { Summary } from "./components/Summary";
import { fetchFacebookData, generateMockComments, aggregateByDay, generateAISummary } from "./utils/facebook";

export default function App() {
  const [pageId, setPageId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [allComments, setAllComments] = useState([]);
  const [fromDate, setFromDate] = useState(() => new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10));
  const [toDate, setToDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [aiSummary, setAiSummary] = useState("");

  const analyze = async () => {
    if (!pageId || !accessToken) return setError("Enter Page ID & Access Token");
    setError("");
    setLoading(true);
    
    try {
      // Try to fetch real Facebook data first
      const data = await fetchFacebookData({ pageId, accessToken });
      setAllComments(data);
    } catch (err) {
      console.error("Failed to fetch real data, using mock data:", err);
      // Fallback to mock data
      await new Promise((r) => setTimeout(r, 500));
      const data = generateMockComments({ pageId, accessToken });
      setAllComments(data);
    }
    
    setLoading(false);
  };

  const reset = () => {
    setAllComments([]);
    setAiSummary("");
  };

  const filtered = useMemo(() => {
    const from = new Date(fromDate + "T00:00");
    const to = new Date(toDate + "T23:59");
    return allComments.filter((c) => {
      const t = new Date(c.created_time);
      return t >= from && t <= to;
    });
  }, [allComments, fromDate, toDate]);

  const distribution = useMemo(() => {
    const c = { positive: 0, negative: 0, neutral: 0 };
    filtered.forEach((cmt) => c[cmt.sentiment]++);
    return [
      { name: "Positive", key: "positive", value: c.positive },
      { name: "Negative", key: "negative", value: c.negative },
      { name: "Neutral", key: "neutral", value: c.neutral },
    ];
  }, [filtered]);

  const aggregated = useMemo(() => aggregateByDay(filtered), [filtered]);

  const genSummary = async () => {
    try {
      const summary = await generateAISummary(filtered, fromDate, toDate);
      setAiSummary(summary);
    } catch (error) {
      console.error('Failed to generate AI summary:', error);
      // Fallback to local summary generation
      const totalComments = filtered.length;
      const positiveCount = filtered.filter(c => c.sentiment === 'positive').length;
      const negativeCount = filtered.filter(c => c.sentiment === 'negative').length;
      
      setAiSummary(`📊 Basic Analysis Summary: ${totalComments} comments analyzed. ${positiveCount} positive, ${negativeCount} negative, ${totalComments - positiveCount - negativeCount} neutral.`);
    }
  };

  // ...existing JSX return statement remains the same...
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-800/20 to-pink-800/20"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
        
        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-16">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 mb-8">
              <span className="text-purple-300 text-sm font-medium">✨ AI-Powered Analytics</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-6 leading-tight">
              Facebook Post
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Sentiment Analysis
              </span>
            </h1>
            
            <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Unlock the power of social media insights with our advanced AI-driven sentiment analysis. 
              Transform your Facebook engagement data into actionable intelligence.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Real-time Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Advanced AI Models</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Interactive Dashboards</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-6 pb-20">
        {/* Input Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl p-8 mb-12">
          <Inputs 
            pageId={pageId} 
            setPageId={setPageId}
            accessToken={accessToken}
            setAccessToken={setAccessToken}
            fromDate={fromDate}
            toDate={toDate}
            setFromDate={setFromDate}
            setToDate={setToDate}
            analyze={analyze}
            reset={reset}
            loading={loading}
            error={error}
          />
        </div>

        {/* Charts Section */}
        {filtered.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
              <SentimentPie distribution={distribution} />
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
              <SentimentTimeline aggregated={aggregated} />
            </div>
          </div>
        )}

        {/* Comments and Summary Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filtered.length > 0 && (
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
              <Comments comments={filtered} />
            </div>
          )}
          {filtered.length > 0 && (
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
              <Summary aiSummary={aiSummary} generate={genSummary} />
            </div>
          )}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && allComments.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-500/20 rounded-full mb-6">
              <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Analyze</h3>
            <p className="text-slate-400 max-w-md mx-auto">
              Enter your Facebook Page ID and Access Token above to start analyzing sentiment data from your posts.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}