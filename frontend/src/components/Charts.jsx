import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend, CartesianGrid } from "recharts";
import { COLORS } from "../utils/mock";


export function SentimentPie({ distribution }) {
return (
<div className="bg-gray-50 p-4 rounded">
<h3 className="text-sm font-semibold mb-2">Sentiment Distribution</h3>
<div style={{ width: "100%", height: 220 }}>
<ResponsiveContainer>
<PieChart>
<Pie data={distribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70}>
{distribution.map((e) => <Cell key={e.key} fill={COLORS[e.key]} />)}
</Pie>
<Tooltip />
</PieChart>
</ResponsiveContainer>
</div>
</div>
);
}


export function SentimentTimeline({ aggregated }) {
return (
<div className="bg-gray-50 p-4 rounded">
<h3 className="text-sm font-semibold mb-2">Timeline</h3>
<div style={{ width: "100%", height: 260 }}>
<ResponsiveContainer>
<BarChart data={aggregated}>
<CartesianGrid strokeDasharray="3 3" />
<XAxis dataKey="date" />
<YAxis />
<Tooltip />
<Legend />
<Bar dataKey="positive" stackId="a" fill={COLORS.positive} />
<Bar dataKey="neutral" stackId="a" fill={COLORS.neutral} />
<Bar dataKey="negative" stackId="a" fill={COLORS.negative} />
</BarChart>
</ResponsiveContainer>
</div>
</div>
);
}