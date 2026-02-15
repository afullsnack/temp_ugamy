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
      origin: [
        "*",
        "http://localhost:3000",
        "localhost:3000",
        "localhost",
        "https://dashboard.ugamy.io",
        "https://staging.ugamy.io",
        "https://ugamy.io",
        "https://www.ugamy.io",
        "https://ugamy-temp.vercel.app"
      ],
      credentials: true,
    }));

  app.notFound(notFound);
  app.onError((err, c) => {
    console.log("error on app", err);
    return onError(err, c);
  });

  return app;
}

export function createTestApp<S extends Schema>(router: AppOpenAPI<S>) {
  return createApp().route("/", router);
}
