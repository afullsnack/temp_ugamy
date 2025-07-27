import { createFileRoute } from '@tanstack/react-router'
import CourseDashboard from '@/components/dashboard/course-dashboard'

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
    return <CourseDashboard />
}
