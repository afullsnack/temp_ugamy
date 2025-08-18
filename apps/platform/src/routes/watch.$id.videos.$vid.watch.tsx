"use client"

import { StreamVideoPlayer } from "@/components/common/stream-video-player"
import Topbar from "@/components/common/topbar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { env } from "@/env"
import { useSession } from "@/lib/auth-hooks"
import type { IGetVideoByIdResponse } from "@/lib/types"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link, useParams } from "@tanstack/react-router"
import axios from "axios"
import { ChevronLeft, Clock, Globe } from "lucide-react"

export const Route = createFileRoute("/watch/$id/videos/$vid/watch")({
  component: RouteComponent,
})

function RouteComponent() {
  const { id, vid } = useParams({ from: "/watch/$id/videos/$vid/watch" })

  const videoId = vid ?? ""

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

  return (
    <div className="relative bg-gray-100 w-full min-h-screen h-fit">
      <Topbar />
      <div className="bg-white bg-gradient-to-br from-primary/10 via-background to-accent/5 mt-[50px] border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <Link
            to="/courses/$id"
            params={{ id: id }}
            className=" flex items-center text-lg text-muted-foreground hover:text-foreground mb-6"
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
                <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
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
                <p className="text-lg text-muted-foreground leading-relaxed">{video?.description ?? "N/A"}</p>
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

      <main className="container mx-auto px-4 py-8">
        {videoLoading || isPending ? (
          <Skeleton className="w-full aspect-video rounded-lg" />
        ) : (
          <StreamVideoPlayer userId={user?.id as string} courseId={id} videoId={vid} />
        )}
      </main>
    </div>
  )
}

export default RouteComponent
