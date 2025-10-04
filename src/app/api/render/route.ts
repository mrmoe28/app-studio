import { NextResponse } from "next/server";
import { ssFetch, vErr } from "@/lib/shotstack";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const upstream = await ssFetch("/render", { method: "POST", json: payload });
    const text = await upstream.text();
    let json: unknown;
    try { json = JSON.parse(text); } catch { json = { raw:text }; }

    if (!upstream.ok) {
      return NextResponse.json(
        { ok:false, status: upstream.status, errorFromShotstack: json },
        { status: 502 }
      );
    }
    return NextResponse.json({ ok:true, shotstack: json });
  } catch (e) {
    return NextResponse.json({ ok:false, error: vErr(e) }, { status: 500 });
  }
}
