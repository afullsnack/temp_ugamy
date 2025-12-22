import { useNavigate, useRouterState } from '@tanstack/react-router'
import { useEffect, type ReactNode } from 'react'
import { useSession } from '@/lib/auth-hooks'
import GlobalLoadingWidget from '@/components/common/global-loading-widget'

const PUBLIC_ROUTES = [
  '/signin',
  '/register',
  '/reset-password',
  '/verify-email',
  '/terms',
  '/privacy',
  '/change-password',
] as const

const ADMIN_ROUTES = [
  '/admin',
] as const

const SEMI_PROTECTED_ROUTES = [
  '/pay',
  '/payment-successful',
] as const

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

function isSemiProtectedRoute(pathname: string): boolean {
  return SEMI_PROTECTED_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

interface AuthGuardProps {
  children: ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isPending: loading } = useSession()
  const navigate = useNavigate()
  const location = useRouterState({ select: (s) => s.location })

  const pathname = location.pathname
  const isPublic = isPublicRoute(pathname)
  const isSemiProtected = isSemiProtectedRoute(pathname)
  const isAdmin = isAdminRoute(pathname)
  const isAuthenticated = !!user

  useEffect(() => {
    if (loading) return

    // Skip auth guard for admin routes - they have their own guard
    if (isAdmin) return

    // If user is not authenticated and trying to access a protected route
    if (!isAuthenticated && !isPublic && !isSemiProtected) {
      navigate({ to: '/signin' })
    }
  }, [loading, isAuthenticated, isPublic, isSemiProtected, isAdmin, navigate])

  // Skip auth guard for admin routes - they have their own guard
  if (isAdmin) {
    return <>{children}</>
  }

  if (loading) {
    return <GlobalLoadingWidget />
  }

  // Don't render protected content if not authenticated
  if (!isAuthenticated && !isPublic && !isSemiProtected) {
    return <GlobalLoadingWidget />
  }

  return <>{children}</>
}

export { PUBLIC_ROUTES, SEMI_PROTECTED_ROUTES, ADMIN_ROUTES, isPublicRoute, isSemiProtectedRoute, isAdminRoute }
