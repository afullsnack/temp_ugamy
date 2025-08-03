import { auth } from "@/lib/auth";
import configureOpenAPI from "@/lib/configure-open-api";
import createApp from "@/lib/create-app";
import index from "@/routes/index.route";
import payments from "@/routes/payments/payments.index"
import webhooks from "@/routes/webhooks/webhooks.index"

const app = createApp();

configureOpenAPI(app);

const routes = [
  index,
  payments,
  webhooks
  // tasks,
] as const;

app.on(["POST", "GET", "DELETE", "PUT"], "/api/auth/*", async c => await auth.handler(c.req.raw));

routes.forEach((route) => {
  app.route("/", route);
});

export type AppType = typeof routes[number];

export default app;
