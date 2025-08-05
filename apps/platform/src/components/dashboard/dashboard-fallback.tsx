import { useNavigate } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import FallbackIllust from "@/public/dashboard-fallback-illust.png"
import { authClient } from "@/lib/auth-client"

const DashboardFallback = () => {
    const { data: session } = authClient.useSession()
    const isSubscribed = session?.user.isSubscribed

    const navigate = useNavigate()
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white mt-8 text-center">
            <div className="max-w-[370px] space-y-6 px-4 py-12">
                <img
                    src={FallbackIllust}
                    alt="fallback url"
                    width={200}
                    height={150}
                    className="mx-auto"
                />
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900">Oops!</h2>
                    <p className="text-gray-600 max-w-sm mx-auto">
                        No courses to view yet, may payment to get access to course videos.
                    </p>
                </div>

                {isSubscribed ?
                    <Button
                        className="h-[50px] px-8 py-3 text-lg font-semibold text-green-800 bg-gradient-to-r from-[#D9F9E6] to-[#E0FCEB] hover:from-[#C0F0D0] hover:to-[#C7F5DA] transition-colors duration-200"
                        size="lg"
                        onClick={() => {
                            navigate({ to: "/pay" })
                        }}
                    >
                        Make Payment Now
                    </Button> :
                    <Button
                        className="h-[50px] px-8 py-3 text-lg font-semibold text-green-800 bg-gradient-to-r from-[#D9F9E6] to-[#E0FCEB] hover:from-[#C0F0D0] hover:to-[#C7F5DA] transition-colors duration-200"
                        size="lg"
                        onClick={() => {
                            navigate({ to: "/verify-email" })
                        }}
                    >
                        Verify Email
                    </Button>
                }

            </div>
        </div>
    )
}

export default DashboardFallback