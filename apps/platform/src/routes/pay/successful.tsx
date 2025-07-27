import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/pay/successful')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/signup/pay/successful"!</div>
}
