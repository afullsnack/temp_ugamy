"use client"

import { Play, Menu, List } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import BrandLogo from "./brand-logo"
import { useState } from "react"
import { authClient } from "@/lib/auth-client"
import { formatDate } from "@/lib/utils"
import { useSession } from "@/lib/auth-hooks"
import { show } from "@ebay/nice-modal-react"
import { VideoPlayerModal } from "./video-player-modal"
import { ProfileEditModal } from "./profile-edit-modal"

const signOut = async () => {
    const { error, data } = await authClient.signOut()

    if (error) {
        throw error
    }

    return data
}

const Topbar = () => {
    const [sheetOpen, setSheetOpen] = useState(false)

    // Get user session
    const { user, isPending: loading } = useSession()

    const queryClient = useQueryClient()

    // Sign out mutation - simplified without navigation
    const { mutateAsync, isPending } = useMutation({
        mutationFn: signOut,
        onSuccess: () => {
            queryClient.clear()
            window.location.href = "/signin"
        },
        onError: (error) => {
            toast.error(error.message || "Error signing you out")
        },
    })

    const handleSignout = async () => {
        await mutateAsync()
    }

    const handleShowIntro = () => {
        show(VideoPlayerModal, {
            videoUrl: "/ugamy-intro-video.mp4",
            title: "Welcome to Ugamy - Intro video",
        })
    }

    const handleEditProfile = () => {
        show(ProfileEditModal)
    }

    const handlePasswordReset = () => {
        window.location.href = "/reset-password"
    }

    const getUserInitials = (name: string | null | undefined) => {
        if (!name) return "U"
        return name
            .split(" ")
            .map((word) => word.charAt(0))
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    if (loading) {
        return (
            <div className="fixed top-0 left-0 right-0 h-16 bg-[hsla(221,39%,11%,1)] z-50 flex items-center justify-between px-6">
                <div className="w-8 h-8 bg-gray-600 rounded animate-pulse" />
                <div className="w-10 h-10 bg-gray-600 rounded-full animate-pulse" />
            </div>
        )
    }

    const MobileSheetContent = () => (
        <div className="h-full bg-[hsla(221,39%,11%,1)] flex flex-col items-center text-white p-6 overflow-y-auto">
            {/* Logo */}
            <div className="flex items-center justify-center mb-[50px] w-[233px] h-[233px]">
                <BrandLogo />
            </div>

            {/* Profile Section */}
            <div className="flex-1">
                <div className="flex flex-col items-center mb-8">
                    <h2 className="text-xl md:text-2xl font-semibold mb-4">{user?.name ?? "N/A"}</h2>
                </div>

                <div className="space-y-3 text-sm text-center mb-8">
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
                    className="bg-[hsla(221,39%,11%,1)] hover:bg-[hsla(221,39%,11%,1)] text-[hsla(199,89%,48%,1)] font-bold mb-8 cursor-pointer w-full"
                >
                    <Play className="w-4 h-4 mr-2" />
                    Watch Intro Video
                </Button>
            </div>

            {/* Bottom Actions */}
            <div className="space-y-[50px] mt-auto">
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={handleEditProfile}
                        className="flex-1 border-[hsla(160,84%,39%,1)] text-teal-400 hover:bg-[hsla(160,84%,39%,1)] hover:text-white bg-transparent"
                    >
                        Edit Profile
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handlePasswordReset}
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

    return (
        <>
            <div className="fixed w-screen top-0 left-0 right-0 h-16 bg-[hsla(221,39%,11%,1)] z-50 flex items-center justify-between px-6">
                {/* Left side - Logo/Brand */}
                <div className="flex items-center">
                    <div className="w-8 h-8">
                        <BrandLogo />
                    </div>
                </div>

                {/* Right side - Mobile hamburger menu and Desktop avatar */}
                <div className="w-fit h-full flex items-center gap-x-10">
                    <Button
                        onClick={handleShowIntro}
                        className="hidden lg:!visible w-fit h-full bg-[hsla(221,39%,11%,1)] hover:bg-[hsla(221,39%,11%,1)] lg:flex items-center text-[hsla(199,89%,48%,1)] font-bold cursor-pointer"
                    >
                        <Play className="w-4 h-4 mr-2" />
                        Watch Intro Video
                    </Button>
                    <div className="flex items-center">
                        {/* Mobile - Hamburger Menu with Sheet */}
                        <div className="lg:hidden">
                            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="bg-transparent">
                                        <div className="w-8 h-8 bg-teal-100 rounded flex items-center justify-center">
                                            <Menu className="w-5 h-5 text-[hsla(160,84%,39%,1)]" />
                                        </div>
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="p-0 w-80">
                                    <MobileSheetContent />
                                </SheetContent>
                            </Sheet>
                        </div>

                        {/* Desktop - Avatar with Dropdown */}
                        <div className="hidden lg:block">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback className="bg-white text-black font-semibold">
                                                {getUserInitials(user?.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 space-y-[6px]" align="end" forceMount>
                                    <DropdownMenuItem className="cursor-pointer" disabled onClick={handleEditProfile}>
                                        Edit Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="cursor-pointer" onClick={handlePasswordReset}>
                                        Password Reset
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="cursor-pointer text-red-600 focus:text-red-600"
                                        disabled={isPending}
                                        onClick={handleSignout}
                                    >
                                        {isPending ? "Logging you out..." : "Logout"}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Topbar
