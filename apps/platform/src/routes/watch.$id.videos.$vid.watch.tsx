"use client";

import { StreamVideoPlayer } from '@/components/common/stream-video-player'
import { Badge } from '@/components/ui/badge';
import { env } from '@/env';
import { useSession } from '@/lib/auth-hooks';
import type { IGetVideoByIdResponse } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import axios from 'axios';
import { BookOpen, ChevronLeft, Clock, Globe } from 'lucide-react'

export const Route = createFileRoute('/watch/$id/videos/$vid/watch')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id, vid } = useParams({ from: '/watch/$id/videos/$vid/watch' })

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
    queryFn: getVideoById
  })

  return (
    <div className="relative min-h-screen h-fit bg-background overflow-y-auto">
      <div className="sticky top-0 left-0 right-0 bg-white bg-gradient-to-br from-primary/10 via-background to-accent/5 border-b border-border z-30">
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
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                Gaming
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">{video?.title ?? "N/A"}</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">{video?.description ?? "N/A"}</p>
            </div>

            {/* Course Stats */}
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
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <StreamVideoPlayer userId={user?.id as string} courseId={id} videoId={vid} />
      </main>
    </div>
  )
}
