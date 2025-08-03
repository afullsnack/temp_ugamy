import env from "@/env"
import type { PaystackWebhookRoute } from "./webhooks.routes"
import { AppRouteHandler } from "@/lib/types"
import * as HttpStatusCodes from "stoker/http-status-codes"
import crypto from "node:crypto"
import db from "@/db"
import { user } from "@/db/schema/auth-schema"
import { eq } from "drizzle-orm"




export const paystack: AppRouteHandler<PaystackWebhookRoute> = async (c) => {
  const body = await c.req.raw.json()
  console.log("Webhook event", body)

  const hash = crypto.createHmac('sha512', env.PAYSTACK_SK!)
    .update(JSON.stringify(body))
    .digest('hex');

  if (hash === c.req.raw.headers.get('x-paystack-signature')) {
    // TODO: handle event

    if (body['event'] === "charge.success") {
      const reference = body['data']['reference']
      const email = body['data']['customer']['email']

      const userExists = await db.query.user.findFirst({
        where: (fields, ops) => ops.eq(fields.email, email)
      })

      if (userExists && userExists.paymentReference === reference) {
        // User is subscribed
        const [userUpdate] = await db.update(user)
          .set({ isSubscribed: true })
          .where(eq(user.email, email))
          .returning()
        console.log("User subscription recorded", userUpdate)
      }
    }

    return c.json({
      success: true,
      event: "charge.success"
    }, HttpStatusCodes.OK)
  }

  return c.json({
    success: false,
    event: "charge.success"
  }, HttpStatusCodes.BAD_REQUEST)
}
