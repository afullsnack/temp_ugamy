"use client"

import { Play, X, ChevronLeft, ChevronRight } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useNavigate } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import SidebarSkeleton from "@/components/ui/skeletons/sidebar-skeleton"
import BrandLogo from "./brand-logo"
import { useState, useEffect } from "react"
import { authClient } from "@/lib/auth-client"
import { formatDate } from "@/lib/utils"
import { useSession } from "@/lib/auth-hooks"
import { show } from "@ebay/nice-modal-react"
import { VideoPlayerModal } from "./video-player-modal"

const signOut = async () => {
    const { error, data } = await authClient.signOut()

    if (error) {
        throw error
    }

    return data
}

const Sidebar = () => {
    const [visible, setVisible] = useState(false)
    const [collapsed, setCollapsed] = useState(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("sidebar-collapsed")
            return saved ? JSON.parse(saved) : false
        }
        return false
    })

    useEffect(() => {
        localStorage.setItem("sidebar-collapsed", JSON.stringify(collapsed))
    }, [collapsed])

    // Get user session
    const { user, isPending: loading } = useSession()

    const navigate = useNavigate()

    const queryClient = useQueryClient()

    // Sign in mutation
    const { mutateAsync, isPending } = useMutation({
        mutationFn: signOut,
        onSuccess: () => {
            queryClient.clear()
            navigate({ to: "/signin" })
        },
        onError: (error) => {
            toast.error(error.message || "Error signing you out")
        },
    })

    const handleSignout = async () => {
        await mutateAsync()
    }

    if (loading) {
        return <SidebarSkeleton />
    }

    const handleShowIntro = () => {
        show(VideoPlayerModal, {
            videoUrl: "/ugamy-intro-video.mp4",
            title: "Welcome to Ugamy - Intro video",
        })
    }

    return (
        <div
            className={`fixed left-0 top-0 h-full bg-[hsla(221,39%,11%,1)] flex flex-col items-center z-50 text-white p-6 transform transition-all duration-300 ease-in-out
    lg:translate-x-0 lg:static lg:z-auto overflow-y-auto
    ${visible ? "translate-x-0" : "-translate-x-full"}
    ${collapsed ? "w-20" : "w-80"}
`}
        >
            <Button
                variant="default"
                size="icon"
                onClick={() => setVisible(false)}
                className="absolute top-4 right-4 bg-white text-primary hover:bg-slate-700 lg:hidden"
            >
                <X className="w-5 h-5 bg-white text-primary" />
            </Button>

            <Button
                variant="ghost"
                size="icon"
                onClick={() => setCollapsed(!collapsed)}
                className="absolute top-4 right-4 text-white hover:bg-slate-700 hidden lg:flex"
            >
                {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </Button>

            {/* Logo */}
            <div
                className={`flex items-center justify-center mb-[50px] transition-all duration-300 ${collapsed ? "w-12 h-12" : "w-[233px] h-[233px]"}`}
            >
                <BrandLogo />
            </div>

            {/* Profile Section */}
            <div className="flex-1">
                <div
                    className={`flex flex-col items-center mb-8 transition-all duration-300 ${collapsed ? "opacity-0 scale-0" : "opacity-100 scale-100"}`}
                >
                    <h2 className="text-xl md:text-2xl font-semibold mb-4">{user?.name ?? "N/A"}</h2>
                </div>

                <div
                    className={`space-y-3 text-sm text-center mb-8 transition-all duration-300 ${collapsed ? "opacity-0 scale-0" : "opacity-100 scale-100"}`}
                >
                    <div>
                        <span className="text-gray-400">Gamer's tag: </span>
                        <span className="text-teal-400">{user?.displayUsername ?? "N/A"}</span>
                    </div>
                    <div>
                        <span className="text-gray-400">Email: </span>
                        <span className="text-teal-400">{user?.email ?? "N/A"}</span>
                    </div>
                    <div>
                        <span className="text-gray-400">Phone: </span>
                        <span className="text-teal-400">{user?.phoneNumber ?? "N/A"}</span>
                    </div>
                    <div>
                        <span className="text-gray-400">Join Date: </span>
                        <span className="text-teal-400">{formatDate(user?.createdAt as Date) || "N/A"}</span>
                    </div>
                </div>

                <Button
                    onClick={handleShowIntro}
                    className={`bg-[hsla(221,39%,11%,1)] hover:bg-[hsla(221,39%,11%,1)] text-[hsla(199,89%,48%,1)] font-bold mb-8 cursor-pointer transition-all duration-300 ${collapsed ? "w-12 h-12 p-0" : "w-full"}`}
                >
                    <Play className="w-4 h-4 mr-2" />
                    {!collapsed && "Watch Intro Video"}
                </Button>
            </div>

            {/* Bottom Actions */}
            <div
                className={`space-y-[50px] mt-auto transition-all duration-300 ${collapsed ? "opacity-0 scale-0" : "opacity-100 scale-100"}`}
            >
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className="flex-1 border-[hsla(160,84%,39%,1)] text-teal-400 hover:bg-[hsla(160,84%,39%,1)] hover:text-white bg-transparent"
                    >
                        Edit Profile
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => navigate({ to: "/reset-password" })}
                        className="flex-1 border-[hsla(160,84%,39%,1)] text-teal-400 hover:bg-[hsla(160,84%,39%,1)] hover:text-white bg-transparent"
                    >
                        Password Reset
                    </Button>
                </div>
                <Button
                    variant="link"
                    disabled={isPending}
                    onClick={handleSignout}
                    className="w-full text-lg text-[hsla(199,89%,48%,1)] hover:text-[hsla(199,89%,48%,1)] font-bold"
                >
                    {isPending ? "Logging you out..." : "Logout"}
                </Button>
            </div>
        </div>
    )
}

export default Sidebar
