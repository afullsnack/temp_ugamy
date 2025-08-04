import { createFileRoute, redirect } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'
import DashboardFallback from '@/components/dashboard/dashboard-fallback'
import DashboardTemp from '@/components/dashboard/dashboard-temp'

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: session } = authClient.useSession()
  console.log("USER SESSION: ", session)

  return <DashboardTemp />
}
