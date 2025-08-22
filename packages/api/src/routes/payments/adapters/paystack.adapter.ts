import env from "@/env";
import { BetterFetch, createFetch } from "@better-fetch/fetch";


type ResponseType = {
  status: boolean;
  message: string;
  data: Record<string, any>;
}

class PaystackAdapter {
  private fetch: BetterFetch

  constructor() {
    this.fetch = createFetch({
      baseURL: `https://api.paystack.co`,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.PAYSTACK_SK}`
      }
    })
  }


  async createPlan(amount: number, name?: string) {
    return await this.fetch<ResponseType>('/plan', {
      method: "POST",
      body: JSON.stringify({
        name: name || "Monthly subscription plan",
        interval: "monthly",
        amount
      })
    })
  }

  async getPlans() {
    return await this.fetch<ResponseType>('/plan')
  }

  async getPaymentLink(email: string, amount: number, reference: string, planCode?: string, callbackUrl?: string) {
    return await this.fetch<ResponseType>('/transaction/initialize', {
      method: "POST",
      body: JSON.stringify({
        email,
        amount,
        plan: planCode,
        reference,
        callback_url: callbackUrl
      })
    })
  }
}

export default PaystackAdapter
