import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";

const tags = ["Auth"];

export const authGet = createRoute({
  tags,
  path: "/api/auth/**",
  method: "get",
  responses: {
    [HttpStatusCodes.OK]: {
      description: "Auth response",
    },
  },
});

export const authPost = createRoute({
  tags,
  path: "/api/auth/**",
  method: "post",
  responses: {
    [HttpStatusCodes.OK]: {
      description: "Auth response",
    },
  },
});

export type AuthGet = typeof authGet;
export type AuthPost = typeof authPost;
