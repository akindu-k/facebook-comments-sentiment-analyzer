import React from "react";
import { COLORS } from "../utils/mock";


export function Comments({ comments }) {
return (
<div className="bg-white border rounded p-4">
<h3 className="text-lg font-semibold mb-3">Comments ({comments.length})</h3>
<div className="space-y-3 max-h-96 overflow-y-auto">
{comments.map((c) => (
<div key={c.id} className="p-3 border rounded">
<div className="flex justify-between">
<div>{c.text}</div>
<span style={{ color: COLORS[c.sentiment] }} className="text-xs font-semibold">{c.sentiment}</span>
</div>
<div className="text-xs text-gray-400">{new Date(c.created_time).toLocaleString()}</div>
</div>
))}
</div>
</div>
);
}