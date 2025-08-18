"use client"

import { createFileRoute } from '@tanstack/react-router'
import DashboardTemp from '@/components/dashboard/dashboard-temp'
import Topbar from '@/components/common/topbar'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className='relative bg-gray-100 w-full min-h-screen h-fit'>
      <Topbar />
      <DashboardTemp />
    </div>
  )
}
