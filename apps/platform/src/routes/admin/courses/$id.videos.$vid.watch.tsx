import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { VideoPlayer } from './-video-player'

export const Route = createFileRoute('/admin/courses/$id/videos/$vid/watch')({
  component: RouteComponent,
})

function RouteComponent() {
  const params = useParams({ from: '/admin/courses/$id/videos/$vid/watch' })
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link
                to={`/admin/courses/$id/videos`}
                params={{ id: params.id }}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ← Back to Videos
              </Link>
              <h1 className="text-2xl font-bold mt-2">Watch Video</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <VideoPlayer courseId={params.id} videoId={params.vid} />
      </main>
    </div>
  )
}
