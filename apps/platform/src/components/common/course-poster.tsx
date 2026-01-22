import { Star, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import CoursePosterImg from "/course-poster.png"
import { useNavigate } from "@tanstack/react-router"
import { useSession } from "@/lib/auth-hooks"
import DashboardFallbackSkeleton from "../ui/skeletons/dashboard-fallback-skeleton"

const courseModules = [
    { id: 1, title: "Introduction - 2:34" },
    { id: 2, title: "Basics - 9:58" },
    { id: 3, title: "Mentality - 10:03" },
    { id: 4, title: "Game Settings - 12:40" },
    { id: 5, title: "Formation - 12:56" },
    { id: 6, title: "Defending - 28:00" },
    { id: 7, title: "Attacking - 18:19" },
    { id: 8, title: "Finishing - 10:14" },
    { id: 9, title: "Play Locks - 11:29" },
    { id: 10, title: "Best Playstyles - 4:46" },
    { id: 11, title: "Skills Revisit - 11:45" },
    { id: 12, title: "The End - 0:27" },

]

export const CoursePoster = () => {
    const navigate = useNavigate()
    const {
        session,
        user,
        isPending: loading
    } = useSession()

    if (loading) {
        return <DashboardFallbackSkeleton />
    }

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-black font-sans text-white">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img src={CoursePosterImg} alt="Hero Background" className="object-cover object-center" />
                {/* Gradient Overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex min-h-screen flex-col justify-center px-6 md:px-12! lg:px-20!">
                <div className="max-w-2xl space-y-6">
                    {/* Title */}
                    <h1 className="text-3xl! font-black tracking-tight md:text-6xl! lg:text-7xl!">Faruk's EAFC 26 Masterclass 1.0</h1>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm! font-medium md:text-base!">
                        <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="h-5 w-5 fill-current" />
                            <span className="text-white">4.9</span>
                        </div>
                        <span>EA FC 26</span>
                        <span className="h-4 w-px bg-gray-500"></span>
                        <span>Beginner to Pro</span>
                        <span className="h-4 w-px bg-gray-500"></span>
                        <span>12 Modules</span>
                    </div>

                    {/* Description */}
                    <p className="max-w-xl text-lg leading-relaxed text-gray-200 md:text-xl">
                        Master EA FC with comprehensive tutorials covering skill moves, formations, tactics,
                        and pro-level strategies to dominate every match and climb the ranks.
                    </p>

                    {/* Starring */}
                    <div className="text-base font-medium text-gray-300 md:text-lg">
                        <span className="text-gray-400">Starring :</span> Faruk Manzo
                    </div>

                    {/* Buttons */}
                    <div className="mt-8 flex w-full max-w-xs flex-col max-md:items-center md:items-start gap-4">
                        {!loading && session !== null && !user?.isSubscribed && user?.emailVerified ?
                            <Button
                                className="h-14 w-full rounded-lg bg-green-600 text-lg font-semibold hover:bg-green-700"
                                size="lg"
                                onClick={() => {
                                    navigate({ to: "/pay" })
                                }}
                            >
                                Make Payment Now
                            </Button> : ""
                        }
                        {!loading && session !== null && !user?.emailVerified ?
                            <Button
                                className="h-14 w-full rounded-lg bg-green-600 text-lg font-semibold hover:bg-green-700"
                                size="lg"
                                onClick={() => {
                                    navigate({ to: "/verify-email" })
                                }}
                            >
                                Verify Email
                            </Button> : ""
                        }
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="secondary"
                                    className="group h-14 w-full justify-center rounded-lg bg-white/20 text-lg font-semibold text-white backdrop-blur-sm hover:bg-white/30"
                                >
                                    Modules
                                    <ChevronDown className="ml-2 h-5 w-5 transition-transform group-data-[state=open]:rotate-180" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-72 bg-black/90 border-gray-700 backdrop-blur-sm">
                                {courseModules.map((module) => (
                                    <DropdownMenuItem
                                        key={module.id}
                                        className="cursor-pointer text-white hover:bg-white/20 focus:bg-white/20 focus:text-white"
                                        onClick={() => {
                                            if (!user?.emailVerified) {
                                                navigate({ to: "/verify-email" })
                                            } else if (!user?.isSubscribed) {
                                                navigate({ to: "/pay" })
                                            }
                                        }}
                                    >
                                        <span className="mr-2 text-green-500">{module.id}.</span>
                                        {module.title}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </div>
    )
}
