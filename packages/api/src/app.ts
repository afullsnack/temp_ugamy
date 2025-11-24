import { auth } from "@/lib/auth";
import configureOpenAPI from "@/lib/configure-open-api";
import createApp from "@/lib/create-app";
// import { sessionValidation } from "@/middlewares/session-validation";
import courses from "@/routes/courses/courses.index";
import index from "@/routes/index.route";
import contact from "@/routes/contact.route";
import payments from "@/routes/payments/payments.index";
// import uploads from "@/routes/uploads.index";
import videos from "@/routes/videos/videos.index";
import webhooks from "@/routes/webhooks/webhooks.index";
import { sessionValidation } from "@/middlewares/session-validation";

const app = createApp();

configureOpenAPI(app);

const publicRoutes = [
  index,
  webhooks,
  contact,
] as const;

publicRoutes.forEach((route) => {
  app.route("/", route);
});

const routes = [
  payments,
  // uploads,
  courses,
  videos,
] as const;

app.on(["POST", "GET", "DELETE", "PUT"], "/api/auth/*", async c => await auth.handler(c.req.raw));

app.use(async (c, next) => sessionValidation(c, next));
routes.forEach((route) => {
  app.route("/", route);
});

export type AppType = typeof routes[number];

export default app;
