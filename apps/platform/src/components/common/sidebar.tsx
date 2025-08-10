import { Play, X } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '../ui/button'
import SidebarSkeleton from '../ui/skeletons/sidebar-skeleton'
import BrandLogo from './brand-logo'
import { type Dispatch, type FC, type SetStateAction } from 'react';
import { authClient } from '@/lib/auth-client'
import {  formatDate } from '@/lib/utils'
import { useSession } from '@/lib/auth-hooks'


interface IProps {
    sidebarOpen: boolean
    setSidebarOpen: Dispatch<SetStateAction<boolean>>
}

const signOut = async () => {
    const { error, data } = await authClient.signOut()

    if (error) {
        throw error
    }

    return data
}

const Sidebar: FC<IProps> = ({ sidebarOpen, setSidebarOpen }) => {
    const {
        user,
        isPending: loading
    } = useSession()

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
        }
    })

    const handleSignout = async () => {
        await mutateAsync()
    }

    if (loading) {
        return <SidebarSkeleton />
    }

    return (
        <div
            className={`fixed left-0 top-0 h-full w-80 bg-[hsla(221,39%,11%,1)] flex flex-col items-center z-50 text-white p-6 transform transition-transform duration-300 ease-in-out
    lg:translate-x-0 lg:static lg:z-auto overflow-y-auto
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
`}
        >
            {/* Mobile Close Button */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-white hover:bg-slate-700 lg:hidden"
                onClick={() => setSidebarOpen(false)}
            >
                <X className="w-5 h-5" />
            </Button>

            {/* Logo */}
            <div className="w-[233px] h-[233px] flex items-center justify-center mb-[50px]">
                <BrandLogo />
            </div>

            {/* Profile Section */}
            <div className="flex-1">
                <div className="flex flex-col items-center mb-8">
                    {/* <div className="w-[233px] h-[233px] rounded-full overflow-hidden mb-4 bg-gray-600">
                        <img
                            src={session?.user.image ?? ProfileImage}
                            alt="Profile"
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                        />
                    </div> */}
                    <h2 className="text-xl md:text-2xl font-semibold mb-4">{user?.name ?? "N/A"}</h2>
                </div>

                <div className="space-y-3 text-sm text-center mb-8">
                    <div>
                        <span className="text-gray-400">Username: </span>
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

                <Button className="w-full bg-[hsla(221,39%,11%,1)] hover:bg-[hsla(221,39%,11%,1)] text-[hsla(199,89%,48%,1)] font-bold mb-8 cursor-pointer">
                    <Play className="w-4 h-4 mr-2" />
                    Watch Intro Video
                </Button>
            </div>

            {/* Bottom Actions */}
            <div className="space-y-[50px] mt-auto">
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
                <Button variant="link" disabled={isPending} onClick={handleSignout} className="w-full text-lg text-[hsla(199,89%,48%,1)] hover:text-[hsla(199,89%,48%,1)] font-bold">
                    {isPending ? "Logging you out..." : "Logout"}
                </Button>
            </div>
        </div>
    )
}

export default Sidebar
