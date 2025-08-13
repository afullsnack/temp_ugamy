import { Button } from '@/components/ui/button'
import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { VideoList } from './-video-list'

export const Route = createFileRoute('/admin/courses/$id/videos')({
  component: RouteComponent,
})

function RouteComponent() {
  const params = useParams({ from: '/admin/courses/$id/videos' })
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link
                to="/admin/courses"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ← Back to Courses
              </Link>
              <h1 className="text-2xl font-bold mt-2">Course Videos</h1>
            </div>
            <Link to={`/admin/courses/${params.id}/videos/new`}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Video
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <VideoList courseId={params.id} />
      </main>
    </div>
  )
}
