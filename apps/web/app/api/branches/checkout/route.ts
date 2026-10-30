import { NextResponse } from "next/server";
import { workspaceEngine } from "@/lib/engine";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { branchId } = body;

    if (!branchId) {
      return NextResponse.json(
        { success: false, error: "branchId is required" },
        { status: 400 }
      );
    }

    const branch = workspaceEngine.checkout(branchId);
    const state = workspaceEngine.getState();
    return NextResponse.json({ success: true, branch, ...state });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
