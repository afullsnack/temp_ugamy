"use client"

import { useEffect, useState } from "react"
import Topbar from "../common/topbar"
import DashboardFallback from "./dashboard-fallback"
import CoursesTemp from "./courses-temp"
import AppLoadingSkeleton from "../common/app-loading-skeleton"
import { useSession } from "@/lib/auth-hooks"
import Sidebar from "../common/sidebar"
import { show } from "@ebay/nice-modal-react"
import { VideoPlayerModal } from "../common/video-player-modal"

// TODO: Refactor component
const DashboardTemp = () => {
    const [activeFilter, setActiveFilter] = useState("All")
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const filters = ["All", "Watched", "Not Watched", "Favorite"]
    useEffect(() => {
        const hasSeenIntro = localStorage.getItem("seenIntroVideo") === "true"
        
        if (!hasSeenIntro) {
            show(VideoPlayerModal, {
                videoUrl: '../../../public/ugamy-intro-video.mp4',
                title: "Welcome to Ugamy - Intro video",
            })
            localStorage.setItem("seenIntroVideo", "true")
        }
    }, [])

    const {
        session,
        user,
        isPending: loading
    } = useSession()

    if (loading) {
        return <AppLoadingSkeleton />
    }

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            <div className="fixed top-0 left-0 z-50 w-fit h-full hidden lg:block">
                <Sidebar />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:ml-80">
                {/* Fixed Header */}
                <Topbar viewMode={viewMode} setViewMode={setViewMode} filters={filters} activeFilter={activeFilter} setActiveFilter={setActiveFilter} />

                {!loading && session !== null && user?.isSubscribed && user?.emailVerified ?
                    <CoursesTemp viewMode={viewMode} /> : ""
                }

                {!loading && session !== null && (!user?.isSubscribed || !user?.emailVerified) ?
                    <DashboardFallback /> : ""
                }
            </div>
        </div>
    )
}

export default DashboardTemp
