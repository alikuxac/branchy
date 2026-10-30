import { NextResponse } from "next/server";
import { workspaceEngine } from "@/lib/engine";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "60", 10);

    const data = workspaceEngine.getRunway(params.id, days);
    return NextResponse.json({ success: true, ...data });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
