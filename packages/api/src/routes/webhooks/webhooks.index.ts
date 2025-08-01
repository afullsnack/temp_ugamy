import * as routes from "./webhooks.routes"
import * as handlers from "./webhooks.handlers"
import { createRouter } from "@/lib/create-app"


const router = createRouter()
  .openapi(routes.paystack, handlers.paystack)


export default router
