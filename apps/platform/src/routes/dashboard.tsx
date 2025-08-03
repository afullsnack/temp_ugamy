import { createFileRoute, redirect } from '@tanstack/react-router'
import CourseDashboard from '@/components/dashboard/course-dashboard'
import { authClient } from '@/lib/auth-client'
import DashboardFallback from '@/components/dashboard/dashboard-fallback'

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent
  // loader: async () => {
  //   const { data: session } = await authClient.useSession()
  //   if (!session) {
  //     throw redirect({
  //       to: '/signin'
  //     })
  //   }
  //   return { session }
  // },
})

function RouteComponent() {
  return <DashboardFallback />
  // return <CourseDashboard />
}
