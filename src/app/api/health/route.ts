import { NextResponse } from "next/server";
import { maskKeyForLog, getShotstackConfig } from "@/lib/shotstack";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { host } = getShotstackConfig();
    return NextResponse.json({
      ok: true,
      shotstackHost: host,
      keyMasked: await maskKeyForLog(),
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "config error" },
      { status: 500 }
    );
  }
}
