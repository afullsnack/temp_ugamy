import { createRoute, z } from "@hono/zod-openapi"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers"


const tags = ["Payments"]
export const plan = createRoute({
  tags,
  method: "post",
  path: "/payments/plan",
  request: {
    body: jsonContentRequired(
      z.object({
        amount: z.number(),
        title: z.string().optional()
      }),
      "Body request"
    )
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        amount: z.number(),
        title: z.string().optional()
      }),
      "Response of plan creation"
    )
  }
})

export const subscribe = createRoute({
  tags,
  method: "post",
  path: "/payments/subscribe",
  request: {
    body: jsonContentRequired(
      z.object({
        planId: z.number(),
        email: z.string().email()
      }),
      "Body request"
    )
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        title: z.string().optional(),
        amount: z.number(),
        interval: z.string(),
        link: z.string()
      }),
      "User subscribed successul"
    )
  }
})


export type PlanRoute = typeof plan
export type SubscribeRoute = typeof subscribe
