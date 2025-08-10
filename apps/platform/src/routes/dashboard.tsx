"use client";

import { createFileRoute } from '@tanstack/react-router'
import DashboardTemp from '@/components/dashboard/dashboard-temp'

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <DashboardTemp />
}
