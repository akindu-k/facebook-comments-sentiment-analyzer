import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend, CartesianGrid } from "recharts";
import { COLORS } from "../utils/facebook";

export function SentimentPie({ distribution }) {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white">Sentiment Distribution</h3>
      </div>
      
      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie 
              data={distribution} 
              dataKey="value" 
              nameKey="name" 
              cx="50%" 
              cy="50%" 
              innerRadius={60} 
              outerRadius={100}
              paddingAngle={4}
            >
              {distribution.map((e) => (
                <Cell 
                  key={e.key} 
                  fill={COLORS[e.key]} 
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(30, 41, 59, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                color: '#ffffff',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
              labelStyle={{ color: '#ffffff' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4">
        {distribution.map((item) => (
          <div key={item.key} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[item.key] }}
            ></div>
            <span className="text-sm text-slate-300 capitalize">
              {item.name} ({item.value})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SentimentTimeline({ aggregated }) {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white">Sentiment Timeline</h3>
      </div>
      
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={aggregated} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(255,255,255,0.1)" 
            />
            <XAxis 
              dataKey="date" 
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
            />
            <YAxis 
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(30, 41, 59, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                color: '#ffffff',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
              labelStyle={{ color: '#ffffff', marginBottom: '8px' }}
              cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
            />
            <Legend 
              wrapperStyle={{ 
                paddingTop: '20px',
                color: '#ffffff'
              }}
              iconType="circle"
            />
            <Bar 
              dataKey="positive" 
              stackId="a" 
              fill={COLORS.positive}
              radius={[0, 0, 4, 4]}
              name="Positive"
            />
            <Bar 
              dataKey="neutral" 
              stackId="a" 
              fill={COLORS.neutral}
              name="Neutral"
            />
            <Bar 
              dataKey="negative" 
              stackId="a" 
              fill={COLORS.negative}
              radius={[4, 4, 0, 0]}
              name="Negative"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        {aggregated.length > 0 && (
          <>
            <div className="text-center p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
              <div className="text-lg font-bold text-green-400">
                {aggregated.reduce((sum, day) => sum + day.positive, 0)}
              </div>
              <div className="text-xs text-slate-400">Total Positive</div>
            </div>
            <div className="text-center p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
              <div className="text-lg font-bold text-slate-400">
                {aggregated.reduce((sum, day) => sum + day.neutral, 0)}
              </div>
              <div className="text-xs text-slate-400">Total Neutral</div>
            </div>
            <div className="text-center p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
              <div className="text-lg font-bold text-red-400">
                {aggregated.reduce((sum, day) => sum + day.negative, 0)}
              </div>
              <div className="text-xs text-slate-400">Total Negative</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}