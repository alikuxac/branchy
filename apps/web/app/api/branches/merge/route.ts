import { NextResponse } from "next/server";
import { workspaceEngine } from "@/lib/engine";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sourceBranchId, targetBranchId, message } = body;

    if (!sourceBranchId || !targetBranchId) {
      return NextResponse.json(
        { success: false, error: "sourceBranchId and targetBranchId are required" },
        { status: 400 }
      );
    }

    const result = workspaceEngine.mergeBranch(sourceBranchId, targetBranchId, message);
    // Checkout target branch after merge
    workspaceEngine.checkout(targetBranchId);
    const state = workspaceEngine.getState();

    return NextResponse.json({ success: true, result, ...state });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
