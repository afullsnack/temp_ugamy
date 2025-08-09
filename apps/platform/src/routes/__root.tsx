import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useNavigate,
  useRouterState,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { useEffect, useState } from 'react'
import TanStackQueryLayout from '../integrations/tanstack-query/layout.tsx'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'
import type { ISession } from '@/lib/utils.ts'
import { authClient } from '@/lib/auth-client'
import { Toaster } from '@/components/ui/sonner'
import { Skeleton } from '@/components/ui/skeleton'

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
  const { data: session, isPending } = authClient.useSession()
  const navigate = useNavigate()
  const location = useRouterState({ select: (s) => s.location })

  useEffect(() => {
    if (isPending) return // Don't run until session state is resolved

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

    if (!session && !isUnauthRoute) {
      navigate({ to: '/signin' })
    }
  }, [session, isPending, location.pathname, navigate])
  

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Toaster position='top-center' richColors />
        {isPending ? (
          <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Left Sidebar - Fixed */}
            <div className="w-80 bg-[hsla(221,39%,11%,1)] p-6">
              <div className="flex flex-col h-full">
                <Skeleton className="h-32 w-full mb-8" />
                <Skeleton className="h-8 w-full mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-8" />
                <Skeleton className="h-12 w-full mt-auto" />
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              {/* Fixed Header */}
              <div className="bg-white shadow-md p-4">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-8 w-48" />
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-64 w-full" />
                </div>
              </div>
            </div>
          </div>
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
