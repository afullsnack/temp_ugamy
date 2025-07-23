import type { AppRouteHandler } from "@/lib/types";

import { auth } from "@/lib/auth";

import type { AuthGet, AuthPost } from "./auth.routes";

export const authGet: AppRouteHandler<AuthGet> = async c => auth.handler(c.req.raw);
export const authPost: AppRouteHandler<AuthPost> = async c => auth.handler(c.req.raw);
