"use client"

import { useState } from "react"
import Sidebar from "../common/sidebar"
import Topbar from "../common/topbar"
import DashboardFallback from "./dashboard-fallback"
import CoursesTemp from "./courses-temp"
import { authClient } from "@/lib/auth-client"

// TODO: Refactor component

const DashboardTemp = () => {
    const [activeFilter, setActiveFilter] = useState("All")
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const { data: session } = authClient.useSession()

    const filters = ["All", "Watched", "Not Watched", "Favorite"]

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

                {session?.user.isSubscribed ?
                    <CoursesTemp viewMode={viewMode} />
                    : <DashboardFallback />
                }
            </div>
        </div>
    )
}

export default DashboardTemp