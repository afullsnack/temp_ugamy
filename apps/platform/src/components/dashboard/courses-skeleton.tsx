import { type FC } from 'react'
import { Skeleton } from '../ui/skeleton'


export const CoursesSkeleton: FC<{ viewMode: "grid" | "list" }> = () => (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm border">
        <Skeleton className="w-full h-32" />
        <div className="p-4">
            <Skeleton className="bg-white h-4 w-3/4 mb-2" />
            <Skeleton className="bg-white h-3 w-1/2 mb-2" />
            <Skeleton className="bg-white h-5 w-20" />
        </div>
    </div>
)