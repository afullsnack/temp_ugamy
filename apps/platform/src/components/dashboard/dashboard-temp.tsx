"use client"

import { useEffect, useState } from "react"
import Sidebar from "../common/sidebar"
import Topbar from "../common/topbar"
import DashboardFallback from "./dashboard-fallback"
import CoursesTemp from "./courses-temp"
import AppLoadingSkeleton from "../common/app-loading-skeleton"
import { authClient } from "@/lib/auth-client"
import type { ISession } from "@/lib/utils"

// TODO: Refactor component

const DashboardTemp = () => {
    const [activeFilter, setActiveFilter] = useState("All")
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const filters = ["All", "Watched", "Not Watched", "Favorite"]

    const [session, setSession] = useState<ISession | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSession() {
            const { data, error } = await authClient.getSession();
            if (error) {
                console.error('Failed to fetch session:', error);
            }
            setSession(data as ISession);
            setLoading(false);
        }

        fetchSession();
    }, []);

    if (loading) {
        return <AppLoadingSkeleton />
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
