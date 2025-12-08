import React from "react";


export function Inputs({ pageId, setPageId, accessToken, setAccessToken, fromDate, toDate, setFromDate, setToDate, analyze, reset, loading, error }) {
return (
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
<div className="col-span-1 md:col-span-2">
<label className="block text-sm font-medium">Page ID</label>
<input value={pageId} onChange={(e) => setPageId(e.target.value)} className="mt-1 w-full p-2 border rounded" />


<label className="block text-sm font-medium mt-3">Access Token</label>
<input value={accessToken} onChange={(e) => setAccessToken(e.target.value)} className="mt-1 w-full p-2 border rounded" />


<div className="flex gap-2 mt-4">
<button onClick={analyze} disabled={loading} className="px-4 py-2 rounded bg-blue-600 text-white">{loading ? "Analyzing…" : "Analyze (mock)"}</button>
<button onClick={reset} className="px-4 py-2 border rounded">Reset</button>
</div>
{error && <div className="mt-3 text-red-600 text-sm">{error}</div>}
</div>


<div>
<label className="block text-sm font-medium">From</label>
<input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="mt-1 w-full p-2 border rounded" />


<label className="block text-sm font-medium mt-3">To</label>
<input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="mt-1 w-full p-2 border rounded" />
</div>
</div>
);
}