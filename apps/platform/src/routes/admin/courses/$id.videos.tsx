// import { Button } from '@/components/ui/button'
import {
  createFileRoute,
  // Link,
  // useParams,
  Outlet,
} from '@tanstack/react-router'
// import { Plus } from 'lucide-react'
// import { VideoList } from './-video-list'

export const Route = createFileRoute('/admin/courses/$id/videos')({
  component: RouteComponent,
})

function RouteComponent() {
  // const params = useParams({ from: '/admin/courses/$id/videos' })
  return <Outlet />
}
