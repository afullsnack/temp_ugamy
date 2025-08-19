"use client"

import CourseEpisodesTemplate from "@/components/common/course-episodes-templates"
import { StreamVideoPlayer } from "@/components/common/stream-video-player"
import Topbar from "@/components/common/topbar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { env } from "@/env"
import { useSession } from "@/lib/auth-hooks"
import type { IGetCourseResponse, IGetVideoByIdResponse } from "@/lib/types"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router"
import axios from "axios"
import { ChevronLeft, Clock, Globe } from "lucide-react"
import { useState } from "react"

export const Route = createFileRoute("/watch/$id/videos/$vid/watch")({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { id, vid } = useParams({ from: "/watch/$id/videos/$vid/watch" })

  const videoId = vid ?? ""

  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set())
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set())

  // Get user session
  const { user, isPending } = useSession()

  const getVideoById = async (): Promise<IGetVideoByIdResponse> => {
    const response = await axios.get(`${env.VITE_API_URL}/videos/${videoId}`)
    return response.data
  }

  // Get video by Id
  const {
    data: video,
    isLoading: videoLoading,
    error: videoError,
  } = useQuery({
    queryKey: ["video", videoId],
    queryFn: getVideoById,
  })

  const getCourseDetails = async (): Promise<IGetCourseResponse> => {
    const response = await axios.get(`${env.VITE_API_URL}/courses/${id}`)
    return response.data
  }

  // Get Course details API query
  const { data: course, isLoading, error } = useQuery({
    queryKey: ['courses-details'],
    queryFn: getCourseDetails
  })

  const toggleLiked = (videoId: string) => {
    const newLiked = new Set(likedVideos)
    if (newLiked.has(videoId)) {
      newLiked.delete(videoId)
    } else {
      newLiked.add(videoId)
    }
    setLikedVideos(newLiked)
  }

  const handleWatch = (vid: string) => {
    navigate({ to: "/watch/$id/videos/$vid/watch", params: { id: id, vid: vid } })
  }

  const progressPercentage =
    (course?.videos?.length ?? 0) > 0 ? (watchedVideos.size / (course?.videos?.length ?? 1)) * 100 : 0

  return (
    <div className="relative bg-gray-100 w-full min-h-screen h-fit space-y-[24px] lg:space-y-[36px]">
      <Topbar />
      <div className="bg-white bg-gradient-to-br from-primary/20 via-background to-accent/5 mt-[50px] border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <Link
            to="/courses/$id"
            params={{ id: id }}
            className=" flex items-center text-base lg:text-lg text-muted-foreground hover:text-foreground mb-6"
          >
            <ChevronLeft /> Go back
          </Link>
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="space-y-4">
              {videoLoading || isPending ? (
                <Skeleton className="h-6 w-20 rounded-full" />
              ) : (
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  Gaming
                </Badge>
              )}

              {videoLoading || isPending ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-3/4" />
                </div>
              ) : (
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                  {video?.title ?? "N/A"}
                </h1>
              )}

              {videoLoading || isPending ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-5/6" />
                  <Skeleton className="h-6 w-4/5" />
                </div>
              ) : (
                <p className="text-sm lg:text-lg text-muted-foreground leading-relaxed">{video?.description ?? "N/A"}</p>
              )}
            </div>

            {/* Course Stats */}
            {videoLoading || isPending ? (
              <div className="flex flex-wrap items-center gap-6">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-20" />
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground font-medium">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{video?.duration ? `${Math.floor(video.duration / 60)} min` : "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>English</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-2 lg:px-4 py-8">
        {videoLoading || isPending ? (
          <Skeleton className="w-full aspect-video rounded-lg" />
        ) : (
          <StreamVideoPlayer userId={user?.id as string} courseId={id} videoId={vid} />
        )}

        {/* Other episodes */}
        <section>
          <CourseEpisodesTemplate
            title="Other lessons in this course"
            course={course ? {
              ...course,
              videos: course?.videos?.filter(v => v.id !== videoId) ?? []
            } : null}
            error={error}
            handleWatch={handleWatch}
            isLoading={isLoading}
            likedVideos={likedVideos}
            progressPercentage={progressPercentage}
            toggleLiked={toggleLiked}
            watchedVideos={watchedVideos}
          />
        </section>
      </main>
    </div>
  )
}

export default RouteComponent
