import { Skeleton } from "@/components/ui/skeleton"

const PaySkeleton = () => {
    return (
        <div className='relative bg-white w-full min-h-screen flex items-center justify-center overflow-hidden'>
            <div className='min-h-screen h-fit container flex flex-col md:flex-row md:items-start justify-start md:justify-center gap-x-3 gap-y-5 mx-auto'>
                <div className="w-full md:w-1/2 flex items-center justify-center">
                    <div className="w-full max-w-md space-y-8">
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                </div>
                <div className="w-full md:w-1/2 flex items-center justify-center">
                    <div className="w-full max-w-md space-y-8">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PaySkeleton
