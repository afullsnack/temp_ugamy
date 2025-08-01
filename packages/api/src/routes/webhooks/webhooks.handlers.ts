import type {PaystackWebhookRoute} from "./webhooks.routes"
import {AppRouteHandler} from "@/lib/types"




export const paystack: AppRouteHandler<PaystackWebhookRoute> = async (c) => {
  console.log("Webhook event", await c.req.raw.json())


  return c.json({
    success: true,
    event: "payment.collection"
  })
}
