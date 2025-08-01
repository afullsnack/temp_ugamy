import type {PlanRoute, SubscribeRoute} from "./payments.routes"
import type {AppRouteHandler} from "@/lib/types"


export const plan: AppRouteHandler<PlanRoute> = (c) => {
  return c.json({
    amount: 40000,
    title: "Entry plan"
  }, 200)
}

export const subscribe: AppRouteHandler<SubscribeRoute> = (c) => c.json({
  title: "Entry plan",
  amount: 40000,
  interval: "30d"
})
