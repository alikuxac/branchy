import { NextResponse } from "next/server";
import { workspaceEngine } from "@/lib/engine";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sourceBranchId = searchParams.get("sourceBranchId");
    const targetBranchId = searchParams.get("targetBranchId") || "b_main";

    if (!sourceBranchId) {
      return NextResponse.json(
        { success: false, error: "sourceBranchId is required" },
        { status: 400 }
      );
    }

    const diff = workspaceEngine.getDiff(sourceBranchId, targetBranchId);
    return NextResponse.json({ success: true, diff });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
