import { Scalar } from "@scalar/hono-api-reference";
import { onError } from "stoker/middlewares";

import type { AppOpenAPI } from "./types";

import packageJSON from "../../package.json" with { type: "json" };

export default function configureOpenAPI(app: AppOpenAPI) {
  app.doc("/doc", {
    openapi: "3.0.0",
    info: {
      version: packageJSON.version,
      title: "Ugamy API",
    },
  }).onError((error, c) => {
    console.error("Doc error", error);
    return onError(error, c);
  });

  app.get(
    "/reference",
    Scalar({
      url: "/doc",
      theme: "kepler",
      layout: "classic",
      servers: [{ url: "http://localhost:9001", description: "Local server" }, { url: "https://ugamy-api.fly.dev", description: "Staging server" }],
      defaultHttpClient: {
        targetKey: "js",
        clientKey: "fetch",
      },
      hideModels: true,
    }),
  );
}
