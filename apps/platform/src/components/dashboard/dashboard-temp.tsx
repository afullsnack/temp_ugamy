"use client"

import { useEffect, useState } from "react"
import DashboardFallback from "./dashboard-fallback"
import CoursesTemp from "./courses-temp"
import AppLoadingSkeleton from "../common/app-loading-skeleton"
import { useSession } from "@/lib/auth-hooks"
import { show } from "@ebay/nice-modal-react"
import { VideoPlayerModal } from "../common/video-player-modal"
import axios from "axios"
import { useQuery } from "@tanstack/react-query"
import { env } from '@/env'
import type { ICourseDetails, IGetCourseResponse, IGetVideosResponse } from "@/lib/types"
import { DashboardHeader } from "../common/dashboard-header"
import { useNavigate, useSearch } from "@tanstack/react-router"
import FilteredVideosTemplate from "./filtered-videos-template"
import { CoursePoster } from "../common/course-poster"

const getCourses = async (): Promise<IGetCourseResponse> => {
    const response = await axios.get(`${env.VITE_API_URL}/courses/`, {
        withCredentials: true,
    })
    return response?.data
}

const filters = ["All", "Watched", "Favourites"]

const DashboardTemp = () => {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

    const search = useSearch({ from: "/dashboard" })

    // if filter param missing, default to "All"
    const activeFilter = (search as { filter?: string }).filter ?? "All"

    const getVideos = async (): Promise<IGetVideosResponse> => {
        const response = await axios.get(`${env.VITE_API_URL}/videos/`, {
            withCredentials: true,
            params: {
                limit: 10000,
                page: 1,
                filter: activeFilter.toLowerCase() === "favourites" ? "liked" : activeFilter.toLowerCase(),
            },
        })
        return response?.data
    }

    const { user, session, isPending: loading } = useSession()

    const showIntroVideo = () => {
        show(VideoPlayerModal, {
            videoUrl: "/ugamy-intro-video.mp4",
            title: "Welcome to Ugamy - Intro video",
        })
    }

    const hasSeenIntro = localStorage.getItem("seenIntroVideo") === "true"

    useEffect(() => {
        if (!loading && user) {
            if (user.isSubscribed && !hasSeenIntro) {
                showIntroVideo()
                localStorage.setItem("seenIntroVideo", "true")
            } else if (!user.isSubscribed) {
                showIntroVideo()
            }
        }
    }, [loading, user])

    if (loading) {
        return <AppLoadingSkeleton />
    }

    // Get Courses API query
    const { data: courses, isLoading, error } = useQuery({
        queryKey: ["courses"],
        queryFn: getCourses,
    })

    // Get Videos API query
    const { data: videos, isLoading: loadingVideos, error: videosError } = useQuery({
        queryKey: ["videos", activeFilter],
        queryFn: getVideos,
    })

    return (
        <div className="bg-gray-100 min-h-screen h-fit overflow-x-hidden">
            {!loading && user?.isSubscribed && user?.emailVerified ? (
                <div className="w-full h-full flex-1 flex flex-col overflow-y-auto">
                    <DashboardHeader
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        filters={filters}
                    />
                </div>
            ) : null}

            <div className="relative w-full h-fit overflow-y-auto">
                {activeFilter.toLocaleLowerCase() === "all" ?
                    <> {!loading && session !== null && user?.isSubscribed && user?.emailVerified ? (
                        <CoursesTemp
                            data={courses?.data as ICourseDetails[]}
                            isLoading={isLoading}
                            error={error}
                            viewMode={viewMode}
                        />
                    ) : null}
                    </> :
                    <> {!loading && session !== null && user?.isSubscribed && user?.emailVerified ? (
                        <FilteredVideosTemplate
                            title={activeFilter === "Favourites" ? "Favourite Lessons" : "Watch History"}
                            filter={activeFilter}
                            videos={videos?.data}
                            isLoading={loadingVideos}
                            error={videosError}
                            canLike={activeFilter === "Watched" ? true : false}
                        />
                    ) : null}
                    </>
                }

                {!loading && session !== null && (!user?.isSubscribed || !user?.emailVerified) ? (
                    <CoursePoster />
                    // <DashboardFallback />
                ) : null}
            </div>
        </div>
        </div >
    )
}

export default DashboardTemp
