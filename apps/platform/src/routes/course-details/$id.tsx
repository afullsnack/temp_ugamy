"use client"

import AppLoadingSkeleton from '@/components/common/app-loading-skeleton'
import Sidebar from '@/components/common/sidebar'
import Topbar from '@/components/common/topbar'
import { CourseDetailsTemplate } from '@/components/dashboard/course-details-template'
import DashboardFallback from '@/components/dashboard/dashboard-fallback'
import { useSession } from '@/lib/auth-hooks'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/course-details/$id')({
    component: RouteComponent,
})

function RouteComponent() {
    const [activeFilter, setActiveFilter] = useState("All")
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const filters = ["All", "Watched", "Not Watched", "Favorite"]

    // Get user session
    const {
        user,
        session,
        isPending: loading
    } = useSession()

    if (loading) {
        return <AppLoadingSkeleton />
    }
    return <>
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            <div className="fixed top-0 left-0 z-50 w-fit h-full hidden lg:block">
                <Sidebar />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:ml-80">
                {!loading && session !== null && user?.isSubscribed && user?.emailVerified ?
                    <CourseDetailsTemplate /> : ""
                }

                {!loading && session !== null && (!user?.isSubscribed || !user?.emailVerified) ?
                    <DashboardFallback /> : ""
                }
            </div>
        </div>
    </>
}
