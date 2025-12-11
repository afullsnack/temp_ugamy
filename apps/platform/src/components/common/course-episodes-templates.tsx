"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
// import { Progress } from "@/components/ui/progress"
import { Play, AlertCircle, RefreshCw, Clock, BookOpen, Globe, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { ICourseDetails } from "@/lib/types"
import LikeVideoWidget from "./like video-widget"
import { VideoSkeleton } from "./videos-skeleton"

interface CourseEpisodesTemplateProps {
    title: string
    error: Error | null
    isLoading: boolean
    course: ICourseDetails | undefined | null
    likedVideos: Set<string>
    watchedVideos: Set<string>
    progressPercentage: number
    handleWatch: (videoId: string) => void
}

// Add to component definition
export const CourseEpisodesTemplate = (props: CourseEpisodesTemplateProps) => {
    return (
        <div className="container h-fit mx-auto py-12 px-3 lg:px-0 max-w-4xl overflow-y-auto">
            <div className="space-y-8">
                <div>
                    <h2 className="text-xl lg:text-2xl font-bold text-foreground mb-6">{props.title}</h2>

                    {props.error && (
                        <Alert variant="destructive" className="mb-6 w-full h-fit flex items-center justify-between">
                            <AlertDescription className="flex items-center justify-between">
                                <AlertCircle className="h-4 w-4" />
                                <span>{props.error?.message || "An error occurred"}</span>
                            </AlertDescription>
                            <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="ml-2">
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Retry
                            </Button>
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
                            {!props.error && !props.course?.videos || props?.course?.videos.length === 0 ? (
                                <Card className="bg-card border-border">
                                    <CardContent className="p-12 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                                                <BookOpen className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-lg font-semibold text-foreground">No Lessons Available</h3>
                                                <p className="text-muted-foreground max-w-md">
                                                    This course doesn't have any lesson.
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                props.course?.videos?.map?.((video, index) => (
                                    <Card
                                        key={video?.id}
                                        onClick={() => props.handleWatch(video?.id)}
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
                                                                {Math.floor((video?.duration ?? 0) / 60)} minutes
                                                            </span>
                                                            {props.watchedVideos.has(video.id) && (
                                                                <span className="flex items-center gap-1.5 text-green-600 font-semibold">
                                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                                    Completed
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <LikeVideoWidget vid={video?.id} isFavourite={video?.isFavorite} />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Progress Section */}
                {/* {!props.isLoading && !props.error && (props.course?.videos?.length ?? 0) > 0 && (
                    <Card className="bg-card border-border">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold text-foreground mb-4">Your Progress</h3>
                            <div className="space-y-3">
                                <Progress value={props.progressPercentage} className="h-3" />
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        {props.watchedVideos.size} of {props.course?.videos?.length} lessons completed
                                    </span>
                                    <span className="font-semibold text-foreground">{Math.round(props.progressPercentage)}%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )} */}

                {/* Course Details */}
                <Card className="bg-card border-border shadow-sm">
                    <CardContent className="py-4 lg:py-8 px-2 lg:px-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <BookOpen className="h-5 w-5 text-primary" />
                            </div>
                            <h3 className="text-lg lg:text-xl font-bold text-foreground">Course Information</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <BookOpen className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <span className="font-medium text-foreground text-sm lg:text-base">Skill Level</span>
                                    </div>
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 capitalize border-blue-200">
                                        {props.course?.difficulty}
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                            <Clock className="h-4 w-4 text-green-600" />
                                        </div>
                                        <span className="font-medium text-foreground text-sm lg:text-base">Total Duration</span>
                                    </div>
                                    <span className="font-semibold text-foreground text-sm lg:text-base">{Math.floor((props.course?.totalWatchTime ?? 0) / 60)} min</span>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                            <Play className="h-4 w-4 text-purple-600" />
                                        </div>
                                        <span className="font-medium text-foreground text-sm lg:text-base">Total Lessons</span>
                                    </div>
                                    <span className="font-semibold text-foreground text-sm lg:text-base">{props.course?.totalVideos}</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                            <Globe className="h-4 w-4 text-orange-600" />
                                        </div>
                                        <span className="font-medium text-foreground text-sm lg:text-base">Language</span>
                                    </div>
                                    <span className="font-semibold text-foreground text-sm lg:text-base">English</span>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                            <RefreshCw className="h-4 w-4 text-emerald-600" />
                                        </div>
                                        <span className="font-medium text-foreground text-sm lg:text-base">Last Updated</span>
                                    </div>
                                    <span className="font-semibold text-foreground text-sm lg:text-base">
                                        {props.course?.updatedAt
                                            ? new Date(props.course.updatedAt).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })
                                            : "N/A"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default CourseEpisodesTemplate
