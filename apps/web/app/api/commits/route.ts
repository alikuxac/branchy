import { NextResponse } from "next/server";
import { workspaceEngine, type NewCommitInput } from "@/lib/engine";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as NewCommitInput;

    if (!body.amount || isNaN(body.amount)) {
      return NextResponse.json(
        { success: false, error: "A valid amount is required" },
        { status: 400 }
      );
    }

    if (!body.category) {
      return NextResponse.json(
        { success: false, error: "Category is required" },
        { status: 400 }
      );
    }

    const commit = workspaceEngine.addCommit(body);
    const state = workspaceEngine.getState();

    return NextResponse.json({ success: true, commit, ...state }, { status: 201 });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
