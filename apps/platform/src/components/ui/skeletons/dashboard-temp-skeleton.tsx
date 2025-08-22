import { Skeleton } from "@/components/ui/skeleton"

const DashboardTempSkeleton = () => {
    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Left Sidebar - Fixed */}
            <div className="w-80 bg-[hsla(221,39%,11%,1)] p-6">
                <div className="flex flex-col h-full">
                    <Skeleton className="h-32 w-full mb-8" />
                    <Skeleton className="h-8 w-full mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-8" />
                    <Skeleton className="h-12 w-full mt-auto" />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Fixed Header */}
                <div className="bg-white shadow-md p-4">
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-8 w-48" />
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-8 w-24" />
                            <Skeleton className="h-8 w-8" />
                            <Skeleton className="h-8 w-8" />
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashboardTempSkeleton
