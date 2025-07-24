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
app.on(["POST", "GET", "DELETE", "PUT"], "/api/auth/*", async c => await auth.handler(c.req.raw));

export type AppType = typeof routes[number];

export default app;
