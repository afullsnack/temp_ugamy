import { createFileRoute } from '@tanstack/react-router'
import CourseDashboard from '@/components/dashboard/course-dashboard'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <CourseDashboard />
  )
}
