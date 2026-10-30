import { Workspace } from "@/components/layout/workspace";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workspace — Branchy DAG Financial Engine",
  description: "Interactive financial DAG ledger workspace. Manage branches, diff timeline scenarios, and calculate runway.",
};

export default function WorkspacePage() {
  return <Workspace />;
}
