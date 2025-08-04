import { createFileRoute } from '@tanstack/react-router'
import CourseDashboard from '@/components/dashboard/dashboard-temp'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <CourseDashboard />
  )
}
