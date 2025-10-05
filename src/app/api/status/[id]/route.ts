import { NextResponse } from "next/server";
import { ssFetch, vErr } from "@/lib/shotstack";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: paramId } = await params;
  try {
    const id = decodeURIComponent(paramId ?? "");
    if (!id || id.length < 8) {
      return NextResponse.json({ ok:false, error:"invalid id" }, { status: 400 });
    }

    const upstream = await ssFetch(`/render/${id}`, { method: "GET" });
    const text = await upstream.text();
    let json: unknown;
    try { json = JSON.parse(text); } catch { json = { raw:text }; }

    if (!upstream.ok) {
      // Bubble the real reason so the UI can stop polling and show it.
      return NextResponse.json(
        { ok:false, status: upstream.status, errorFromShotstack: json },
        { status: upstream.status === 404 ? 404 : 502 }
      );
    }

    // Normalize payload; Shotstack returns status fields like "queued" | "fetching" | "rendering" | "done" | "failed"
    return NextResponse.json({ ok:true, shotstack: json });
  } catch (e) {
    return NextResponse.json({ ok:false, error: vErr(e) }, { status: 500 });
  }
}
