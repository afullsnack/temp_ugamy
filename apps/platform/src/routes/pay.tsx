"use client";

import { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import PaymentSelectionScreen from '@/components/common/payment-selection-screen'
import WelcomeScreen from '@/components/auth/welcome-screen'
import PaySkeleton from '@/components/ui/skeletons/pay-skeleton'
import { useSession } from '@/lib/auth-hooks'
import Topbar from '@/components/common/topbar';

export const Route = createFileRoute('/pay')({
    component: RouteComponent,
})

function RouteComponent() {
    const {
        session,
        user,
        isPending: loading
    } = useSession()

    const navigate = useNavigate()

    // Redirect unverified users to email verification page before allowing payment access
    useEffect(() => {
        if (!loading && session !== null && !user?.emailVerified) {
            toast.error("Please verify your email to continue")
            navigate({
                to: "/verify-email",
                search: (prev) => ({ ...prev, email: `${user?.email}` }),
            })
        }
    }, [session, navigate])

    // Redirect users to dashboard if they are subscribed
    // TODO: Create a user redirect page and embed this logic there
    useEffect(() => {
        if (!loading && session !== null && user?.isSubscribed) {
            toast.info("You are already subscribed")
            navigate({ to: "/dashboard" })
        }
    }, [loading, session, navigate])

    if (loading) {
        return <PaySkeleton />
    }


    return (
        <div className='relative bg-gray-100 w-full min-h-screen h-fit flex items-center justify-center'>
            <Topbar />
            {/* Background Gaming Elements */}
            <div className="absolute inset-0 opacity-20">
                {/* Controller Button Elements */}
                <div className="absolute top-32 left-1/4 w-16 h-16 rounded-full border-2 border-red-400 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-red-400/30"></div>
                </div>

                <div className="absolute top-48 left-1/3 w-12 h-12 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-cyan-400 rotate-45 bg-cyan-400/20"></div>
                </div>

                <div className="absolute top-44 right-1/3 w-12 h-12 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-gray-400">
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="w-6 h-0.5 bg-gray-400 absolute"></div>
                            <div className="w-0.5 h-6 bg-gray-400 absolute"></div>
                        </div>
                    </div>
                </div>

                {/* D-pad at bottom */}
                <div className="absolute bottom-32 left-1/4">
                    <div className="relative w-16 h-16">
                        {/* Horizontal bar */}
                        <div className="absolute top-1/2 left-0 w-16 h-4 bg-gray-600/40 transform -translate-y-1/2 rounded"></div>
                        {/* Vertical bar */}
                        <div className="absolute left-1/2 top-0 w-4 h-16 bg-gray-600/40 transform -translate-x-1/2 rounded"></div>
                        {/* Center circle */}
                        <div className="absolute top-1/2 left-1/2 w-6 h-6 bg-gray-700/60 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                    </div>
                </div>

                {/* Additional controller elements */}
                <div className="absolute bottom-48 right-1/4 w-20 h-12 bg-gray-600/20 rounded-lg flex items-center justify-center">
                    <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-500/60 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-500/60 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-500/60 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-500/60 rounded-full"></div>
                    </div>
                </div>
            </div>
            <div className='min-h-screen h-fit container flex flex-col md:flex-row md:items-start justify-start md:justify-center gap-x-3 gap-y-5 mx-auto mt-[50px]'>
                <WelcomeScreen />
                <PaymentSelectionScreen />
            </div>
        </div>
    )
}
