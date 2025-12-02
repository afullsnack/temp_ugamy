import { createFileRoute, Outlet } from '@tanstack/react-router'
import { AdminAuthGuard } from '@/components/auth/admin-auth-guard'

export const Route = createFileRoute('/admin')({
  component: AdminLayout,
})

function AdminLayout() {
  return (
    <AdminAuthGuard>
      <Outlet />
    </AdminAuthGuard>
  )
}
