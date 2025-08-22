"use client";
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import DashboardTemp from '@/components/dashboard/dashboard-temp'
import Topbar from '@/components/common/topbar';

const searchSchema = z.object({
  filter: z.enum(['All', 'Watched', 'Favourites']).optional(),
})

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent,
  validateSearch: searchSchema
})

function RouteComponent() {
  return (
    <div className='relative w-full min-h-screen h-fit'>
      <Topbar />
      <DashboardTemp />
    </div>
  )
}
