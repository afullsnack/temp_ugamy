"use client"

import AppLoadingSkeleton from '@/components/common/app-loading-skeleton'
import { CoursePoster } from '@/components/common/course-poster'
import Topbar from '@/components/common/topbar'
import { CourseDetailsTemplate } from '@/components/dashboard/course-details-template'
import DashboardFallback from '@/components/dashboard/dashboard-fallback'
import { useSession } from '@/lib/auth-hooks'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/courses/$id')({
    component: RouteComponent,
})

function RouteComponent() {
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
        <div className='relative bg-gray-100 w-full min-h-screen h-fit'>
            <Topbar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col">

                {!loading && session !== null && user?.isSubscribed && user?.emailVerified ?
                    <CourseDetailsTemplate /> : ""
                }

                {!loading && session !== null && (!user?.isSubscribed || !user?.emailVerified) ?
                    <CoursePoster /> : ""
                    // <DashboardFallback /> : ""
                }
            </div>
        </div>
    </>
}
