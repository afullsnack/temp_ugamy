import { BetterAuthError } from "better-auth";

import { auth } from "@/lib/auth";
import configureOpenAPI from "@/lib/configure-open-api";
import createApp from "@/lib/create-app";
import index from "@/routes/index.route";

const app = createApp();

configureOpenAPI(app);

const routes = [
  index,
  // tasks,
] as const;

routes.forEach((route) => {
  app.route("/", route);
});
app.on(["POST", "GET", "DELETE", "PUT"], "/api/auth/*", async (c) => {
  try {
    return await auth.handler(c.req.raw).catch((error) => {
      if (error instanceof BetterAuthError) {
        console.log("BetterAuth error", error);
      }
      console.log("Hono error", error);
    });
  }
  catch (error: any) {
    if (error instanceof BetterAuthError) {
      console.error("BetterAuth error", error);
    }
    console.error("Hono error", error);
  }
});

export type AppType = typeof routes[number];

export default app;
