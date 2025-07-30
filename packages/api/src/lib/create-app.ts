import type { Schema } from "hono";

import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import { notFound, onError, serveEmojiFavicon } from "stoker/middlewares";
import { defaultHook } from "stoker/openapi";

import { pinoLogger } from "@/middlewares/pino-logger";

import type { AppBindings, AppOpenAPI } from "./types";

export function createRouter() {
  return new OpenAPIHono<AppBindings>({
    strict: false,
    defaultHook,
  });
}

export default function createApp() {
  const app = createRouter();
  app.use(requestId())
    .use(serveEmojiFavicon("📝"))
    .use(pinoLogger())
    .use(cors({
      origin: ["*", "http://localhost:3000", "https://ugamy-backend-platform.vercel.app", "https://ugamy.io"],
      credentials: true,
    }));

  app.notFound(notFound);
  app.onError(onError);
  app.use(async (c, next) => {
    await next();
    if(c.res.status >= 400) {
      console.log("Catch all 4xx error", JSON.stringify(c.res, null, 4));
    }
  })
  return app;
}

export function createTestApp<S extends Schema>(router: AppOpenAPI<S>) {
  return createApp().route("/", router);
}
