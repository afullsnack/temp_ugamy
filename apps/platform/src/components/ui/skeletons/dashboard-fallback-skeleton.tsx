import { Skeleton } from "@/components/ui/skeleton"

const DashboardFallbackSkeleton = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white mt-8 text-center">
            <div className="max-w-[370px] space-y-6 px-4 py-12">
                <Skeleton className="h-[150px] w-[200px] mx-auto" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-24 mx-auto" />
                    <Skeleton className="h-4 w-80 mx-auto" />
                </div>
                <Skeleton className="h-[50px] w-48 mx-auto" />
            </div>
        </div>
    )
}

export default DashboardFallbackSkeleton
