import { NextResponse } from "next/server";
import { getCfg, mask } from "@/lib/shotstack";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { host } = getCfg();
    return NextResponse.json({
      ok: true,
      host,
      keyMasked: mask(process.env.SHOTSTACK_API_KEY)
    });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e.message }, { status: 500 });
  }
}
