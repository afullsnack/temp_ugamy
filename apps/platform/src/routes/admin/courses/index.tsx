import { Button } from '@/components/ui/button'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { CourseList } from './-course-list'

export const Route = createFileRoute('/admin/courses/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link
                to="/admin/dashboard"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold mt-2">Course Management</h1>
            </div>
            <Link to="/admin/courses/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Course
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <CourseList />
      </main>
    </div>
  )
}
