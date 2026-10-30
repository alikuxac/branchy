import { NextResponse } from "next/server";
import { workspaceEngine } from "@/lib/engine";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "60", 10);
    const state = workspaceEngine.getState(days);
    return NextResponse.json({ success: true, ...state });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, fromBranchId, fromNodeId } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Branch name is required" },
        { status: 400 }
      );
    }

    const branch = workspaceEngine.forkBranch(
      fromBranchId || "b_main",
      name.trim(),
      fromNodeId
    );

    // Auto-checkout new scenario branch
    workspaceEngine.checkout(branch.id);
    const state = workspaceEngine.getState();

    return NextResponse.json({ success: true, branch, ...state }, { status: 201 });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get("branchId");

    if (!branchId) {
      return NextResponse.json(
        { success: false, error: "branchId query parameter is required" },
        { status: 400 }
      );
    }

    workspaceEngine.deleteBranch(branchId);
    const state = workspaceEngine.getState();
    return NextResponse.json({ success: true, ...state });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
