import * as routes from "./payments.routes"
import * as handlers from "./payments.handlers"
import {createRouter} from "@/lib/create-app"

const router = createRouter()
  .openapi(routes.plan, handlers.plan)
  .openapi(routes.subscribe, handlers.subscribe)


export default router;
