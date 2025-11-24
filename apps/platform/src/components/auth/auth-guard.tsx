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
  '/admin/login',
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
  const isAuthenticated = !!user

  useEffect(() => {
    if (loading) return

    // If user is not authenticated and trying to access a protected route
    if (!isAuthenticated && !isPublic && !isSemiProtected) {
      navigate({ to: '/signin' })
    }
  }, [loading, isAuthenticated, isPublic, isSemiProtected, navigate])

  if (loading) {
    return <GlobalLoadingWidget />
  }

  // Don't render protected content if not authenticated
  if (!isAuthenticated && !isPublic && !isSemiProtected) {
    return <GlobalLoadingWidget />
  }

  return <>{children}</>
}

export { PUBLIC_ROUTES, SEMI_PROTECTED_ROUTES, isPublicRoute, isSemiProtectedRoute }
