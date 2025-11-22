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

type PublicRoute = (typeof PUBLIC_ROUTES)[number]
type SemiProtectedRoute = (typeof SEMI_PROTECTED_ROUTES)[number]

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
  const { session, isPending: loading } = useSession()
  const navigate = useNavigate()
  const location = useRouterState({ select: (s) => s.location })

  useEffect(() => {
    if (loading) return

    const pathname = location.pathname
    const isPublic = isPublicRoute(pathname)
    const isSemiProtected = isSemiProtectedRoute(pathname)

    // If user is not authenticated and trying to access a protected route
    if (session === null && !isPublic && !isSemiProtected) {
      navigate({ to: '/signin' })
      return
    }

    // Optional: Redirect authenticated users away from auth pages (signin, register)
    // Uncomment if you want this behavior:
    // if (session && (pathname === '/signin' || pathname === '/register')) {
    //   navigate({ to: '/dashboard' })
    // }
  }, [loading, session, location.pathname, navigate])

  if (loading) {
    return <GlobalLoadingWidget />
  }

  return <>{children}</>
}

export { PUBLIC_ROUTES, SEMI_PROTECTED_ROUTES, isPublicRoute, isSemiProtectedRoute }
