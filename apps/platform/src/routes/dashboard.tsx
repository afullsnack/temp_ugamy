"use client";

import { createFileRoute } from '@tanstack/react-router'
import DashboardTemp from '@/components/dashboard/dashboard-temp'
import Topbar from '@/components/common/topbar';

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='relative w-full min-h-screen h-fit'>
      <Topbar />
      <DashboardTemp />
    </div>
  )
}
