import React, { type FC } from 'react'
import { Alert, AlertDescription } from '../ui/alert'
import { AlertCircle, BookOpen, Clock, RefreshCw } from 'lucide-react'
import { Button } from '../ui/button'
import { VideoSkeleton } from '../common/videos-skeleton'
import type { IVideo } from '@/lib/types'
import { Card, CardContent } from '../ui/card'
import LikeVideoWidget from '../common/like video-widget'
import { useNavigate } from '@tanstack/react-router'

interface IProps {
    title: string
    filter: string
    error: Error | null
    isLoading: boolean
    videos: IVideo[] | undefined | null
}

const FilteredVideosTemplate: FC<IProps> = (props) => {
    const navigate = useNavigate()

    const handleWatch = ({ vid, courseId }: { vid: string, courseId: string }) => {
        navigate({ to: "/watch/$id/videos/$vid/watch", params: { id: courseId, vid: vid } })
    }
    return (
        <div className="container h-fit mx-auto py-12 px-3 lg:px-0 max-w-4xl overflow-y-auto">
            <div>
                <h2 className="text-xl lg:text-2xl font-bold text-foreground mb-6">{props.title}</h2>

                {props.error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="flex items-center justify-between">
                            <span>{props.error?.message || "An error occurred"}</span>
                            <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="ml-2">
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Retry
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}

                {props.isLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <VideoSkeleton key={index} />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {!props?.videos || props?.videos?.length === 0 ? (
                            <Card className="bg-card border-border">
                                <CardContent className="p-12 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                                            <BookOpen className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-semibold text-foreground">
                                                    {props.filter === "Favorites" ? "You haven't liked any lesson" : "You haven't watched any lesson yet."}
                                                </h3>
                                            <p className="text-sm lg:text-base text-muted-foreground max-w-md">
                                                    {props.filter === "Favorites" ? "Every lesson you like will appear here." : "Your watch history will appear here."}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            props?.videos?.map?.((video, index) => (
                                <Card
                                    key={index}
                                    onClick={() => handleWatch({ courseId: video?.courseId, vid: video?.id })}
                                    className="bg-card border-border hover:shadow-lg hover:border-primary/20 transition-all duration-300 group cursor-pointer"
                                >
                                    <CardContent className="p-5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl text-primary font-bold text-base shadow-sm">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-foreground group-hover:text-primary transition-colors text-lg leading-tight">
                                                        {video?.title ?? "N/A"}
                                                    </h4>
                                                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground font-medium">
                                                        <span className="flex items-center gap-1.5">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            {Math.floor(video?.duration / 60)} minutes
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <LikeVideoWidget vid={video?.id} isFavourite={video?.isFavourite} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default FilteredVideosTemplate