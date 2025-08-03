import { selectPlanSchema } from "@/db/schema/schema"
import { createRoute, z } from "@hono/zod-openapi"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers"
import { createErrorSchema } from "stoker/openapi/schemas"


const tags = ["Payments"]
export const plan = createRoute({
  tags,
  method: "post",
  path: "/payments/plans",
  request: {
    body: jsonContentRequired(
      z.object({
        amount: z.number(),
        name: z.string().optional().default("Monthly subscription")
      }),
      "Body request"
    )
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectPlanSchema,
      "Response of plan creation"
    )
  }
})

export const getPlans = createRoute({
  tags,
  method: "get",
  path: "/payments/plans",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(selectPlanSchema),
      "get all plans"
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
        email: z.string().email(),
        amount: z.coerce.number(),
        planCode: z.string().optional(),
        callbackUrl: z.string().optional()
      }),
      "Body request"
    )
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.record(z.string(), z.any()),
      "Transaction init value"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({
        status: z.boolean(),
        message: z.string(),
      }),
      "Bad request return"
    )
  }
})


export type CreatePlanRoute = typeof plan
export type GetPlans = typeof getPlans
export type SubscribeRoute = typeof subscribe
