"use client"

import { useEffect, useState } from "react"
import Sidebar from "../common/sidebar"
import Topbar from "../common/topbar"
import DashboardTempSkeleton from "../ui/skeletons/dashboard-temp-skeleton"
import DashboardFallback from "./dashboard-fallback"
import CoursesTemp from "./courses-temp"
import type { ISession } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"

// TODO: Refactor component

const DashboardTemp = () => {
    const [activeFilter, setActiveFilter] = useState("All")
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const filters = ["All", "Watched", "Not Watched", "Favorite"]

    const [session, setSession] = useState<ISession | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const { data: sessionData, isPending: loading } = authClient.useSession();

    useEffect(() => {
        if (!loading) {
            setIsLoading(false);
            setSession(sessionData as ISession);
        }
    }, [sessionData, loading]);


    if (isLoading) {
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

                {session?.user.isSubscribed && session.user.emailVerified ?
                    <CoursesTemp viewMode={viewMode} /> : ""
                }
                {!session?.user.isSubscribed || !session.user.emailVerified ?
                    <DashboardFallback /> : ""
                }
            </div>
        </div>
    )
}

export default DashboardTemp
