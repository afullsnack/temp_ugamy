import {createRoute, z} from "@hono/zod-openapi"
import * as HttpStatusCodes from "stoker/http-status-codes"
import {jsonContent} from "stoker/openapi/helpers"


const tags = ["Webhooks"]
export const paystack = createRoute({
  tags,
  method: "post",
  path: "/webhook/paystack",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.any()
        }
      }
    }
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        event: z.string(),
        success: z.boolean()
      }),
      "Webhook respose"
    )
  }
})

export type PaystackWebhookRoute = typeof paystack
