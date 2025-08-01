import { createFileRoute, redirect } from '@tanstack/react-router'
import CourseDashboard from '@/components/dashboard/course-dashboard'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent,
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession()
    // if (!session) {
    //   throw redirect({ to: "/signin" })
    // }
  },
})

function RouteComponent() {
    return <CourseDashboard />
}
