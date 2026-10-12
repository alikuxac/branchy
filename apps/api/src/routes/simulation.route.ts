import { Hono } from "hono";
import {
  financialGitService,
  type SafeToSpendDTO,
  type SimulateDiffDTO,
} from "../services/financial-git.service.js";

export const simulationRouter = new Hono();

simulationRouter.post("/simulate-diff", async (c) => {
  try {
    const body = await c.req.json<SimulateDiffDTO>();
    const diff = financialGitService.simulateDiff(body);
    return c.json({ success: true, diff });
  } catch (err: unknown) {
    const error = err as Error;
    return c.json({ error: error.message }, 400);
  }
});

simulationRouter.post("/safe-to-spend", async (c) => {
  try {
    const body = await c.req.json<SafeToSpendDTO>();
    const result = financialGitService.calculateSafeToSpend(body);
    return c.json({ success: true, result });
  } catch (err: unknown) {
    const error = err as Error;
    return c.json({ error: error.message }, 400);
  }
});
