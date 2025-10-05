"use client";
import { useState } from "react";

export default function DebugPage() {
  const [id, setId] = useState<string>("");
  const [log, setLog] = useState<string>("");

  async function submit() {
    setLog("Submitting test render…");
    const payload = {
      timeline: {
        background: "#000000",
        tracks: [{ clips: [{ asset: { type: "text", text: "Hello Moe" }, start: 0, length: 3 }]}]
      },
      output: { format: "mp4", size: { width: 640, height: 360 } }
    };
    const r = await fetch("/api/render", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload) });
    const j = await r.json();
    setLog(prev => prev + "\n" + JSON.stringify(j, null, 2));
    const newId = j?.shotstack?.response?.id || j?.shotstack?.id || j?.id;
    if (newId) setId(newId);
  }

  async function check() {
    if (!id) { setLog(l => l + "\nNo id yet."); return; }
    const r = await fetch(`/api/status/${encodeURIComponent(id)}`);
    const j = await r.json();
    setLog(prev => prev + "\n" + JSON.stringify(j, null, 2));
  }

  return (
    <div className="p-6 space-y-4">
      <button className="px-4 py-2 rounded bg-black text-white" onClick={submit}>Submit Test Render</button>
      <div>ID: {id || "(none)"}</div>
      <button className="px-4 py-2 rounded bg-black text-white" onClick={check}>Check Status</button>
      <pre className="p-3 bg-gray-100 rounded whitespace-pre-wrap text-sm">{log}</pre>
      <div className="text-xs text-gray-500">Visit /api/health too.</div>
    </div>
  );
}
