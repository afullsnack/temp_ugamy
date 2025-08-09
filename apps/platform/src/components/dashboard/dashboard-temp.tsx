"use client"

import { useState } from "react"
import Sidebar from "../common/sidebar"
import Topbar from "../common/topbar"
import DashboardTempSkeleton from "../ui/skeletons/dashboard-temp-skeleton"
import DashboardFallback from "./dashboard-fallback"
import CoursesTemp from "./courses-temp"
import { authClient } from "@/lib/auth-client"

// TODO: Refactor component

const DashboardTemp = () => {
    const [activeFilter, setActiveFilter] = useState("All")
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const filters = ["All", "Watched", "Not Watched", "Favorite"]

    const { data: session, isPending: loading } = authClient.useSession();

    if (loading) {
        return <DashboardTempSkeleton />
    }


    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Left Sidebar - Fixed */}
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Fixed Header */}
                <Topbar viewMode={viewMode} setViewMode={setViewMode} setSidebarOpen={setSidebarOpen} filters={filters} activeFilter={activeFilter} setActiveFilter={setActiveFilter} />

                {!loading && session !== null && session?.user.isSubscribed && session.user.emailVerified ?
                    <CoursesTemp viewMode={viewMode} /> : ""
                }
                {!loading && session !== null && (!session?.user.isSubscribed || !session.user.emailVerified) ?
                    <DashboardFallback /> : ""
                }
            </div>
        </div>
    )
}

export default DashboardTemp
