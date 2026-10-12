import { Hono } from "hono";
import { apiRouter } from "./routes/index.js";

const app = new Hono();

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    service: "branchy-api",
    timestamp: new Date().toISOString(),
  });
});

// Mount modular API router under /api
app.route("/api", apiRouter);

export default app;
