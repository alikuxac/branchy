import { NextResponse } from "next/server";
import { workspaceEngine } from "@/lib/engine";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { branchId, commitId } = body;

    if (!commitId) {
      return NextResponse.json(
        { success: false, error: "commitId is required" },
        { status: 400 }
      );
    }

    const stateBefore = workspaceEngine.getState();
    const targetBranch = branchId || stateBefore.activeBranchId;

    const commit = workspaceEngine.revertCommit(targetBranch, commitId);
    const state = workspaceEngine.getState();

    return NextResponse.json({ success: true, commit, ...state }, { status: 201 });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
