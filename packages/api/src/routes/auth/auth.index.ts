import { createRouter } from "@/lib/create-app";

import * as handlers from "./auth.handlers";
import * as routes from "./auth.routes";

const router = createRouter()
  .openapi(routes.authGet, handlers.authGet)
  .openapi(routes.authPost, handlers.authPost);

export default router;
