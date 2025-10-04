import { NextRequest, NextResponse } from "next/server";
import { ssFetch } from "@/lib/shotstack";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const edit = await request.json();
    const resp = await ssFetch("/render", { method: "POST", json: edit });

    if (!resp.ok) {
      const errBody = await resp.text();
      return NextResponse.json(
        {
          ok: false,
          error: `Shotstack ${resp.status}: ${errBody}`,
        },
        { status: resp.status }
      );
    }

    const data = await resp.json();
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
