import { Hono } from "hono";

export interface CrossRepoWebhookDTO {
  prId: string;
  sourceBranch: string;
  targetBranch: string;
  action: "open" | "merge" | "close";
}

export const webhookRouter = new Hono();

webhookRouter.post("/cross-repo-pr", async (c) => {
  try {
    const payload = await c.req.json<CrossRepoWebhookDTO>();
    return c.json({
      received: true,
      prId: payload.prId,
      action: payload.action,
      message: `Cross-repo PR ${payload.prId} event processed`,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return c.json({ error: error.message }, 400);
  }
});
