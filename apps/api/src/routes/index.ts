import { Hono } from "hono";
import { branchRouter } from "./branch.route.js";
import { simulationRouter } from "./simulation.route.js";
import { webhookRouter } from "./webhook.route.js";

export const apiRouter = new Hono();

apiRouter.route("/branches", branchRouter);
apiRouter.route("/", simulationRouter);
apiRouter.route("/webhooks", webhookRouter);
