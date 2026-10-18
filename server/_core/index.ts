import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { publicPlatformScript } from "./publicConfig";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { runMigrationsIfRequested } from "./migrate";
import { clearLocalAdminCookie, createLocalAdminSession, localAdminCredentialsConfigured, setLocalAdminCookie, verifyLocalAdminCredentials } from "../localAdminAuth";

async function startServer() {
  await runMigrationsIfRequested();
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.get("/api/platform/config.js", (_req, res) => {
    res.set("Cache-Control", "no-store").type("application/javascript").send(publicPlatformScript());
  });
  app.post("/api/local-admin/login", async (req, res) => {
    if (!localAdminCredentialsConfigured()) {
      return res.status(503).json({ message: "Local admin login is not configured." });
    }
    const username = typeof req.body?.username === "string" ? req.body.username.trim() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!verifyLocalAdminCredentials(username, password)) {
      return res.status(401).json({ message: "Invalid username or password." });
    }
    const token = await createLocalAdminSession(username);
    setLocalAdminCookie(req, res, token);
    return res.json({ success: true });
  });
  app.post("/api/local-admin/logout", (req, res) => {
    clearLocalAdminCookie(req, res);
    return res.json({ success: true });
  });
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = Number(process.env.PORT || "3000");
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid PORT");
  server.on("error", error => { console.error("Server failed:", error.message); process.exit(1); });
  server.listen(port, "0.0.0.0", () => console.log(`Server listening on port ${port}`));
}

startServer().catch(error => { console.error(error); process.exit(1); });
