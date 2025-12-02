import { useNavigate, useRouterState } from '@tanstack/react-router'
import { useEffect, type ReactNode } from 'react'
import { useSession } from '@/lib/auth-hooks'
import GlobalLoadingWidget from '@/components/common/global-loading-widget'

const ADMIN_TOKEN_KEY = 'admin_auth_token'

interface AdminAuthGuardProps {
  children: ReactNode
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const { user, isPending: loading } = useSession()
  const navigate = useNavigate()
  const location = useRouterState({ select: (s) => s.location })

  const pathname = location.pathname
  const isAdminLoginRoute = pathname === '/admin/login'
  const isAdminRoute = pathname.startsWith('/admin')
  const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY)

  useEffect(() => {
    if (loading) return

    // If on admin login page and already authenticated as admin, redirect to dashboard
    if (isAdminLoginRoute && user?.role === 'admin' && adminToken) {
      navigate({ to: '/admin/dashboard' })
      return
    }

    // If trying to access admin routes (except login) without admin auth
    if (isAdminRoute && !isAdminLoginRoute) {
      // Check if user is admin and has token
      if (!user || user.role !== 'admin' || !adminToken) {
        navigate({ to: '/admin/login' })
        return
      }
    }
  }, [loading, user, isAdminRoute, isAdminLoginRoute, adminToken, navigate])

  if (loading) {
    return <GlobalLoadingWidget />
  }

  // Don't render admin content if not authenticated as admin
  if (isAdminRoute && !isAdminLoginRoute && (!user || user.role !== 'admin' || !adminToken)) {
    return <GlobalLoadingWidget />
  }

  return <>{children}</>
}

// Helper functions for managing admin token
export const setAdminToken = (token: string) => {
  localStorage.setItem(ADMIN_TOKEN_KEY, token)
}

export const getAdminToken = () => {
  return localStorage.getItem(ADMIN_TOKEN_KEY)
}

export const clearAdminToken = () => {
  localStorage.removeItem(ADMIN_TOKEN_KEY)
}

export { ADMIN_TOKEN_KEY }
