import React from "react";

export function Summary({ aiSummary, generate }) {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white">AI Summary</h3>
      </div>
      
      <button 
        onClick={generate} 
        className="mb-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl w-full font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
      >
        <div className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Generate AI Summary
        </div>
      </button>

      <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/30 p-4 min-h-[200px]">
        {aiSummary ? (
          <div className="space-y-4">
            <pre className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed font-mono">
              {aiSummary}
            </pre>
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-4 border-t border-slate-700/30">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>AI Analysis Complete</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">Ready to Analyze</h4>
            <p className="text-slate-400 text-sm max-w-sm">
              Click the button above to generate an intelligent AI summary of your sentiment analysis data.
            </p>
            <div className="flex items-center gap-4 mt-6 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                <span>Sentiment Analysis</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                <span>Trend Detection</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                <span>Recommendations</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Capabilities Indicator */}
      {aiSummary && (
        <div className="mt-4 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
          <div className="flex items-center gap-2 text-sm text-purple-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">AI-Powered Insights</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Generated using advanced natural language processing and sentiment analysis algorithms.
          </p>
        </div>
      )}
    </div>
  );
}