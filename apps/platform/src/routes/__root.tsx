import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useNavigate
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { useEffect } from 'react'
import TanStackQueryLayout from '../integrations/tanstack-query/layout.tsx'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'
import { authClient } from '@/lib/auth-client'
import { Toaster } from '@/components/ui/sonner'

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

  component: () => {
    const { data: session, isLoading } = authClient.useSession()
    const navigate = useNavigate()

    useEffect(() => {
      if (!isLoading && !session) {
        navigate({ to: "/signin" })
      }
    }, [session, isLoading, navigate])

    return (
      <RootDocument>
        <Outlet />
        <TanStackRouterDevtools />

        <TanStackQueryLayout />
      </RootDocument>
    )
  },
  notFoundComponent: () => (
    <div>
      <h1>Not Found</h1>
      <p>The requested page could not be found.</p>
    </div>
  ),
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Toaster position='top-center' richColors />
        {children}
        <Scripts />
      </body>
    </html>
  )
}
