"use client"

import { useState } from "react"
import axios from 'axios'
import { Check, Shield } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"
import { BrandLogoDark } from "../common/brand-logo-dark"
import { Button } from "@/components/ui/button"


// TODO: Improve API integration implementation
interface ISubscribeResponse {
    status: boolean,
    message: string,
    data: {
        authorization_url: string,
        access_code: string,
        reference: string
    }
}
interface ISubscribePayload {
    email: string,
    amount: string,
    planCode?: string,
    callbackUrl: string
}

export const subscribe = async (payload: ISubscribePayload): Promise<ISubscribeResponse> => {
    const response = await axios.post('https://ugamy-api.fly.dev/payments/subscribe', payload)
    return response.data
}


export default function PaymentSelectionScreen() {
    const [selectedPayment, setSelectedPayment] = useState("paystack")

    // Subscribe API mutation
    const SubscribeMutation = useMutation({
        mutationFn: subscribe,
        onSuccess: (data) => {
            toast.success("Redirecting to Paystack checkout")
            window.location.href = data.data.authorization_url
        },
        onError: (error) => {
            toast.error(error.message || "Error subscribing. Please try again")
        },
    })

    const handleContinuePayment = () => {
        SubscribeMutation.mutate({
            email: "adiejoel14@gmail.com",
            amount: "1000",
            callbackUrl: 'https://ugamy-backend-platform.vercel.app/pay/successful'
        })
    }

    return (
        <div className="z-10 min-h-screen h-fit bg-inherit flex items-start md:items-center justify-center">
            <div className="bg-white w-full pt-[80px] md:pt-8 p-8">
                <div className="md:hidden w-full flex items-center justify-center pb-[50px] p-0">
                    <BrandLogoDark />
                </div>
                {/* Header */}
                <div className="max-w-[484px] text-center mb-8 space-y-[24px]">
                    <h1 className="text-2xl font-bold text-gray-900">Secure Your Access</h1>
                    <p className="text-[hsla(221,39%,11%,1)] text-sm">
                        Choose Your Preferred Payment Method To Unlock All Tutorials In The FIFA 24 Series.
                    </p>
                </div>

                {/* Payment Options */}
                <Accordion type="single" value={selectedPayment} onValueChange={setSelectedPayment} className="mb-4">
                    {/* Paystack Option */}
                    <AccordionItem value="paystack" className="p-[1px] border rounded-[8px] mb-4 shadow-sm">
                        <AccordionTrigger className="bg-[hsla(210,20%,98%,1)] h-[44px] px-4 py-3 hover:no-underline rounded-none rounded-t-[8px] cursor-pointer">
                            <div className="flex items-center gap-3 w-full">
                                <div className="flex items-center justify-center">
                                    <div
                                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedPayment === "paystack" ? "border-[hsla(160,84%,39%,1)] bg-[hsla(160,84%,39%,1)]" : "border-gray-300"
                                            }`}
                                    >
                                        {selectedPayment === "paystack" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                    </div>
                                </div>
                                <span className="font-medium text-gray-900">Paystack</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4 rounded-[8px]">
                            <div className="space-y-2 mb-3">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Check className="w-4 h-4 text-[hsla(160,84%,39%,1)]" />
                                    <span>For Nigeria and African countries</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Check className="w-4 h-4 text-[hsla(160,84%,39%,1)]" />
                                    <span>Pay using Debit/Credit card</span>
                                </div>
                            </div>

                            <div className="mb-3">
                                <span className="text-sm text-gray-700">
                                    Amount: <span className="font-semibold text-green-600">₦1,000 NGN</span>
                                </span>
                            </div>

                            <div className="flex items-start gap-2 text-xs text-gray-500">
                                <Shield className="w-4 h-4 text-[hsla(160,84%,39%,1)] mt-0.5 flex-shrink-0" />
                                <span>All transactions are secured by Paystack. We do not store your card details.</span>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Stripe Option */}
                    <AccordionItem value="stripe" disabled className="p-[1px] border rounded-[8px] shadow-sm">
                        <AccordionTrigger className="bg-[hsla(210,20%,98%,1)] h-[44px] px-4 py-3 hover:no-underline rounded-none rounded-t-[8px] cursor-pointer">
                            <div className="flex items-center gap-3 w-full">
                                <div className="flex items-center justify-center">
                                    <div
                                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedPayment === "stripe" ? "border-[hsla(160,84%,39%,1)] bg-[hsla(160,84%,39%,1)]" : "border-gray-300"
                                            }`}
                                    >
                                        {selectedPayment === "stripe" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                    </div>
                                </div>
                                <span className="font-medium text-gray-900">Stripe</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="h-fit px-4 py-4 rounded-[8px]">
                            <div className="space-y-2 mb-3">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Check className="w-4 h-4 text-[hsla(160,84%,39%,1)]" />
                                    <span>For international payments</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Check className="w-4 h-4 text-[hsla(160,84%,39%,1)]" />
                                    <span>Pay using Credit/Debit card or digital wallets</span>
                                </div>
                            </div>

                            <div className="mb-3">
                                <span className="text-sm text-gray-700">
                                    Amount: <span className="font-semibold text-green-600">$25.00 USD</span>
                                </span>
                            </div>

                            <div className="flex items-start gap-2 text-xs text-gray-500">
                                <Shield className="w-4 h-4 text-[hsla(160,84%,39%,1)] mt-0.5 flex-shrink-0" />
                                <span>All transactions are secured by Stripe. Industry-leading security standards.</span>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                {/* Continue Button */}
                <Button
                    onClick={handleContinuePayment}
                    disabled={SubscribeMutation.isPending}
                    className="w-full h-[50px] bg-[hsla(160,84%,39%,1)] hover:bg-[hsla(160,84%,39%,1)] text-white py-3 text-base font-medium rounded-[8px]"
                    size="lg"
                >
                    {SubscribeMutation.isPending ? "Processing..." : "Continue to Payment"}
                </Button>
            </div>
        </div>
    )
}
