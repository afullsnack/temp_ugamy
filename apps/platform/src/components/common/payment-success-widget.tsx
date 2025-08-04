import { CheckCheck } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"

export const PaymentSuccessWidget = () => {
    const navigate = useNavigate()

    return (
        <div className="bg-white w-full min-h-screen flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-6 text-center">
                <div className="flex justify-center">
                    <CheckCheck className="h-24 w-24 text-primary" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900">Payment Successful!</h1>
                <p className="text-lg text-gray-700">Thank You!</p>
                <p className="text-md text-gray-600">Your EAFC Tutorial Series Is Now Fully Unlocked.</p>
                <div className="pt-4">
                    <Button
                        variant="default"
                        onClick={() => {
                            navigate({ to: "/dashboard" })
                        }}
                        className="w-full h-[50px] py-3 px-6 text-lg text-white font-semibold"
                    >
                        Continue to dashboard
                    </Button>
                </div>
            </div>
        </div>
    )
}
