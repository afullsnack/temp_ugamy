import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  redirect,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import TanStackQueryLayout from '../integrations/tanstack-query/layout.tsx'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'
import { authClient } from '@/lib/auth-client'
import { Toaster } from '@/components/ui/sonner'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async ({ location }) => {
    const { data: session } = await authClient.getSession()

    const unauthenticatedRoutes = [
      '/signin',
      '/register',
      '/reset-password',
      '/verify-email',
      '/terms',
      '/privacy',
    ]

    if (!session && !unauthenticatedRoutes.includes(location.pathname)) {
      throw redirect({
        to: '/signin',
      })
    }
  },

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

  component: () => (
    <RootDocument>
      <Outlet />
      <TanStackRouterDevtools />

      <TanStackQueryLayout />
    </RootDocument>
  ),
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
