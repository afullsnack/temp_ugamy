import { createMiddleware } from "hono/factory";
import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppBindings } from "@/lib/types";

import { auth } from "@/lib/auth";

export const sessionValidation = createMiddleware<AppBindings>(async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ status: false, message: "Not Authorized" }, HttpStatusCodes.UNAUTHORIZED);
  }

  // Set user and session
  c.set("session", session.session);
  c.set("user", session.user);

  await next();
});
