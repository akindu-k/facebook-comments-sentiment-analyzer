import React from "react";


export function Summary({ aiSummary, generate }) {
return (
<div className="bg-white border rounded p-4">
<h3 className="text-lg font-semibold mb-3">AI Summary (dummy)</h3>
<button onClick={generate} className="mb-3 px-4 py-2 bg-purple-600 text-white rounded w-full">Generate Summary</button>
<pre className="text-sm whitespace-pre-wrap">{aiSummary || "Click to generate dummy summary"}</pre>
</div>
);
}