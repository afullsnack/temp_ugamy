import { createFileRoute, Link } from '@tanstack/react-router'
import { CourseForm } from './-course-form'

export const Route = createFileRoute('/admin/courses/new')({
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
                to="/admin/courses"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ← Back to Courses
              </Link>
              <h1 className="text-2xl font-bold mt-2">Create New Course</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <CourseForm />
      </main>
    </div>
  )
}
