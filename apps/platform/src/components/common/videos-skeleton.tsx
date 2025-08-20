import { Card, CardContent } from '../ui/card'
import { Skeleton } from '../ui/skeleton'

export const VideoSkeleton = () => (
    <Card className="bg-card border-border">
        <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-4 w-3/4" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded" />
                    <Skeleton className="h-6 w-6 rounded" />
                </div>
            </div>
            <Skeleton className="h-3 w-1/2" />
        </CardContent>
    </Card>
)