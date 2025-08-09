import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useNavigate,
  useRouterState,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { useEffect } from 'react'
import TanStackQueryLayout from '../integrations/tanstack-query/layout.tsx'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'
import { authClient } from '@/lib/auth-client'
import { Toaster } from '@/components/ui/sonner'
import AppLoadingSkeleton from '@/components/common/app-loading-skeleton.tsx'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  component: RootComponent,
  notFoundComponent: () => (
    <div>
      <h1>Not Found</h1>
      <p>The requested page could not be found.</p>
    </div>
  ),
})

function RootComponent() {
  const { data: session, isPending: loading } = authClient.useSession()
  const navigate = useNavigate()
  const location = useRouterState({ select: (s) => s.location })

  useEffect(() => {
    if (loading) return

    const unauthenticatedRoutes = [
      '/signin',
      '/register',
      '/reset-password',
      '/verify-email',
      '/pay',
      '/terms',
      '/privacy',
      '/payment-successful',
    ]

    const isUnauthRoute = unauthenticatedRoutes.includes(location.pathname)

    if (!loading && session === null && !isUnauthRoute) {
      navigate({ to: '/signin' })
    }
  }, [session, loading, location.pathname, navigate])
  

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Toaster position='top-center' richColors />
        {loading ? (
          <AppLoadingSkeleton />
        ) : (
          <>
            <Outlet />
            <TanStackRouterDevtools />
            <TanStackQueryLayout />
          </>
        )}
        <Scripts />
      </body>
    </html>
  )
}
