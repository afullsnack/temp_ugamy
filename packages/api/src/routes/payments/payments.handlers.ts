import db from "@/db"
import PaystackAdapter from "./adapters/paystack.adapter"
import type { CreatePlanRoute, GetPlans, SubscribeRoute } from "./payments.routes"
import type { AppRouteHandler } from "@/lib/types"
import { plans } from "@/db/schema/schema"
import * as HttpStatusCodes from "stoker/http-status-codes"


export const plan: AppRouteHandler<CreatePlanRoute> = async (c) => {
  const body = c.req.valid("json")
  const adapter = new PaystackAdapter()

  const { data: newPlanData, error } = await adapter.createPlan(body.amount, body.name)

  if(error) {
    console.log("Paystack error", error)
  }
  console.log("Newly created plan", newPlanData)

  const [newPlan] = await db.insert(plans).values({
    name: body.name,
    amount: body.amount.toString(),
    planCode: newPlanData?.data['plan_code'] as string
  }).returning()

  return c.json(newPlan, 200)
}


export const getPlan: AppRouteHandler<GetPlans> = async (c) => {
  const plans = await db.query.plans.findMany();

  return c.json(plans, 200)
}

export const subscribe: AppRouteHandler<SubscribeRoute> = async (c) => {

  const body = c.req.valid("json")

  // Validate email
  const emailExists = await db.query.user.findFirst({
    where: (field, ops) => ops.eq(field.email, body.email)
  }).catch((error) => console.log("Failed to query user", error))

  if (!emailExists) {
    return c.json({
      status: false,
      message: "User does not exist with email provided"
    }, HttpStatusCodes.BAD_REQUEST)
  }

  const adapter = new PaystackAdapter()

  const reference = crypto.randomUUID()
  const { data: subscribeData, error } = await adapter.getPaymentLink(
    body.email,
    body.amount,
    reference,
    body.planCode,
    body.callbackUrl || `http://localhost:9001`
  )

  if (error) {
    return c.json({
      status: false,
      message: error.message || "Failed to create transaction"
    }, HttpStatusCodes.BAD_REQUEST)
  }

  return c.json(subscribeData, HttpStatusCodes.OK)
}
