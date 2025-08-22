import { createRouter } from "@/lib/create-app";

import * as handlers from "./videos.handlers";
import * as routes from "./videos.routes";

const router = createRouter()
  .openapi(routes.create, handlers.create)
  .openapi(routes.getOne, handlers.getOne)
  .openapi(routes.list, handlers.list)
  .openapi(routes.stream, handlers.stream)
  .openapi(routes.like, handlers.like)
  .openapi(routes.trackWatched, handlers.trackWatched);

export default router;
