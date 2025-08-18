"use client";

import { StreamVideoPlayer } from '@/components/common/stream-video-player'
import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'

export const Route = createFileRoute('/watch/$id/videos/$vid/watch')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id, vid } = useParams({ from: '/watch/$id/videos/$vid/watch' })

  return (
    <div className="relative min-h-screen h-fit bg-background overflow-y-auto">
      <div className="sticky top-0 left-0 right-0 bg-white bg-gradient-to-br from-primary/10 via-background to-accent/5 border-b border-border z-30">
        <div className="container mx-auto px-4 py-8">
          <Link
            to="/courses/$id"
            params={{ id: id }}
            className=" flex items-center text-lg text-muted-foreground hover:text-foreground mb-6"
          >
            <ChevronLeft /> Back to Course details
          </Link>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <StreamVideoPlayer courseId={id} videoId={vid} />
      </main>
    </div>
  )
}
