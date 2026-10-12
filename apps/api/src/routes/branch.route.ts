import { Hono } from "hono";
import {
  financialGitService,
  type CheckoutBranchDTO,
  type CommitDTO,
  type CreateBranchDTO,
  type MergeBranchDTO,
} from "../services/financial-git.service.js";

export const branchRouter = new Hono();

branchRouter.get("/", (c) => {
  const result = financialGitService.getBranches();
  return c.json(result);
});

branchRouter.post("/", async (c) => {
  try {
    const body = await c.req.json<CreateBranchDTO>();
    const branch = financialGitService.createBranch(body);
    return c.json({ success: true, branch }, 201);
  } catch (err: unknown) {
    const error = err as Error;
    return c.json({ error: error.message }, 400);
  }
});

branchRouter.post("/checkout", async (c) => {
  try {
    const body = await c.req.json<CheckoutBranchDTO>();
    const activeBranch = financialGitService.checkout(body);
    return c.json({ success: true, activeBranch });
  } catch (err: unknown) {
    const error = err as Error;
    return c.json({ error: error.message }, 400);
  }
});

branchRouter.post("/commit", async (c) => {
  try {
    const body = await c.req.json<CommitDTO>();
    const commit = financialGitService.commit(body);
    return c.json({ success: true, commit }, 201);
  } catch (err: unknown) {
    const error = err as Error;
    return c.json({ error: error.message }, 400);
  }
});

branchRouter.post("/merge", async (c) => {
  try {
    const body = await c.req.json<MergeBranchDTO>();
    const result = financialGitService.merge(body);
    return c.json({ success: true, ...result });
  } catch (err: unknown) {
    const error = err as Error;
    return c.json({ error: error.message }, 400);
  }
});
