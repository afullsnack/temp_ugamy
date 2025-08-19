"use client"

import { useEffect, useState } from "react"
import DashboardFallback from "./dashboard-fallback"
import CoursesTemp from "./courses-temp"
import AppLoadingSkeleton from "../common/app-loading-skeleton"
import { useSession } from "@/lib/auth-hooks"
import Sidebar from "../common/sidebar"
import { show } from "@ebay/nice-modal-react"
import { VideoPlayerModal } from "../common/video-player-modal"
import axios from "axios"
import { useQuery } from "@tanstack/react-query"
import { env } from '@/env'
import type { IGetCourseResponse } from "@/lib/types"
import { DashboardHeader } from "../common/dashboard-header"

const getCourses = async (): Promise<IGetCourseResponse[]> => {
    const response = await axios.get(`${env.VITE_API_URL}/courses`)
    return response.data
}

// TODO: Refactor component
const DashboardTemp = () => {
    const [activeFilter, setActiveFilter] = useState("All")
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const filters = ["All", "Watched", "Not Watched", "Favorite"]

    // Get user session
    const {
        user,
        session,
        isPending: loading
    } = useSession()

    const showIntroVideo = () => {
        show(VideoPlayerModal, {
            videoUrl: "/ugamy-intro-video.mp4",
            title: "Welcome to Ugamy - Intro video",
        })
    }

    const hasSeenIntro = localStorage.getItem("seenIntroVideo") === "true"

    useEffect(() => {
        if (!loading && user?.isSubscribed && !hasSeenIntro) {
            showIntroVideo()
            localStorage.setItem("seenIntroVideo", "true")
        } else if (!loading && !user?.isSubscribed) {
            showIntroVideo()
        }
    }, [loading, user])

    if (loading) {
        return <AppLoadingSkeleton />
    }

    // Get Courses API query
    const { data, isLoading, error } = useQuery({
        queryKey: ['courses'],
        queryFn: getCourses
    })

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            <div className="flex-1 flex flex-col">
                {/* Fixed Header */}
                <DashboardHeader viewMode={viewMode} setViewMode={setViewMode} filters={filters} activeFilter={activeFilter} setActiveFilter={setActiveFilter} />

                <div className="relative w-full h-full overflow-y-auto">
                    {!loading && session !== null && user?.isSubscribed && user?.emailVerified ?
                        <CoursesTemp data={data!} isLoading={isLoading} error={error} viewMode={viewMode} /> : ""
                    }

                    {!loading && session !== null && (!user?.isSubscribed || !user?.emailVerified) ?
                        <DashboardFallback /> : ""
                    }
                </div>
            </div>
        </div>
    )
}

export default DashboardTemp
