"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Play, Heart, AlertCircle, RefreshCw, Clock, BookOpen, Globe, CheckCircle2, ChevronLeft } from "lucide-react"
import axios from "axios"
import { env } from '@/env'
import { useNavigate, useParams } from "@tanstack/react-router"
import type { IGetCourseResponse } from "@/lib/types"
import { useQuery } from "@tanstack/react-query"
import { Alert, AlertDescription } from "../ui/alert"
import { Link } from "@tanstack/react-router"


export const CourseDetailsTemplate = () => {
    const { id } = useParams({ from: '/courses/$id' })
    const navigate = useNavigate()

    const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set())
    const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set())


    const getCourseDetails = async (): Promise<IGetCourseResponse> => {
        const response = await axios.get(`${env.VITE_API_URL}/courses/${id}`)
        return response.data
    }

    // Get Course details API query
    const { data: course, isLoading, error } = useQuery({
        queryKey: ['courses-details'],
        queryFn: getCourseDetails
    })

    const toggleWatched = (videoId: string) => {
        const newWatched = new Set(watchedVideos)
        if (newWatched.has(videoId)) {
            newWatched.delete(videoId)
        } else {
            newWatched.add(videoId)
        }
        setWatchedVideos(newWatched)
    }

    const toggleLiked = (videoId: string) => {
        const newLiked = new Set(likedVideos)
        if (newLiked.has(videoId)) {
            newLiked.delete(videoId)
        } else {
            newLiked.add(videoId)
        }
        setLikedVideos(newLiked)
    }

    const handleWatch = (vid: string) => {
        navigate({ to: "/watch/$id/videos/$vid/watch", params: { id: id, vid: vid } })
    }

    const progressPercentage =
        (course?.videos?.length ?? 0) > 0 ? (watchedVideos.size / (course?.videos?.length ?? 1)) * 100 : 0

    const VideoSkeleton = () => (
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

    return (
        <div className="relative min-h-screen h-fit bg-background overflow-y-auto mt-[50px]">
            <div className=" bg-white bg-gradient-to-br from-primary/10 via-background to-accent/5 border-b border-border">
                <div className="container mx-auto px-4 py-8">
                    <Link
                        to="/dashboard"
                        className=" flex items-center text-lg text-muted-foreground hover:text-foreground mb-6"
                    >
                        <ChevronLeft /> Back to Courses
                    </Link>
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div className="space-y-4">
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                Gaming
                            </Badge>
                            <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">{course?.title}</h1>
                            <p className="text-lg text-muted-foreground leading-relaxed">{course?.description}</p>
                        </div>

                        {/* Course Stats */}
                        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground font-medium">
                            {/* <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-semibold text-foreground">{course?.rating}</span>
                                <span>({course?.studentsCount?.toLocaleString()} students)</span>
                            </div> */}
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {/* <span>{course?.duration}</span> */}
                            </div>
                            <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4" />
                                <span>{course?.difficulty}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                <span>English</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container h-fit mx-auto px-4 py-12 max-w-4xl overflow-y-auto">
                <div className="space-y-8">
                    {/* Course Curriculum */}
                    <div>
                        <h2 className="text-2xl font-bold text-foreground mb-6">Course Content</h2>

                        {error && (
                            <Alert variant="destructive" className="mb-6">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="flex items-center justify-between">
                                    <span>{error?.message || 'An error occurred'}</span>
                                    <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="ml-2">
                                        <RefreshCw className="h-4 w-4 mr-1" />
                                        Retry
                                    </Button>
                                </AlertDescription>
                            </Alert>
                        )}

                        {isLoading ? (
                            <div className="space-y-3">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <VideoSkeleton key={index} />
                                ))}
                            </div>
                        ) : course?.videos?.length === 0 && !error ? (
                            <Card className="bg-card border-border">
                                <CardContent className="text-center py-12">
                                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Play className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground mb-2">No Lessons Available</h3>
                                    <p className="text-muted-foreground">This course doesn't have any lessons yet.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {course?.videos?.map?.((video, index) => (
                                    <Card
                                        key={video?.id}
                                        onClick={() => handleWatch(video?.id)}
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
                                                            {video?.title}
                                                        </h4>
                                                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground font-medium">
                                                            <span className="flex items-center gap-1.5">
                                                                <Clock className="h-3.5 w-3.5" />
                                                                {Math.floor(video?.duration / 60)} min
                                                            </span>
                                                            {watchedVideos.has(video.id) && (
                                                                <span className="flex items-center gap-1.5 text-green-600 font-semibold">
                                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                                    Completed
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleLiked(video?.id)}
                                                        className="h-9 w-9 p-0 hover:bg-red-50 rounded-xl"
                                                    >
                                                        <Heart
                                                            className={`h-7 w-7 ${likedVideos?.has(video.id) ? "text-red-500 fill-current" : "text-muted-foreground"
                                                                }`}
                                                        />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Progress Section */}
                    {!isLoading && !error && (course?.videos?.length ?? 0) > 0 && (
                        <Card className="bg-card border-border">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-foreground mb-4">Your Progress</h3>
                                <div className="space-y-3">
                                    <Progress value={progressPercentage} className="h-3" />
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            {watchedVideos.size} of {course?.videos?.length} lessons completed
                                        </span>
                                        <span className="font-semibold text-foreground">{Math.round(progressPercentage)}%</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Course Details */}
                    <Card className="bg-card border-border shadow-sm">
                        <CardContent className="p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <BookOpen className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground">Course Information</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <BookOpen className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <span className="font-medium text-foreground">Skill Level</span>
                                        </div>
                                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                                            {course?.difficulty}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                <Clock className="h-4 w-4 text-green-600" />
                                            </div>
                                            <span className="font-medium text-foreground">Total Duration</span>
                                        </div>
                                        <span className="font-semibold text-foreground text-lg">N/A</span>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                                <Play className="h-4 w-4 text-purple-600" />
                                            </div>
                                            <span className="font-medium text-foreground">Total Lessons</span>
                                        </div>
                                        <span className="font-semibold text-foreground text-lg">{course?.videos?.length}</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                                <Globe className="h-4 w-4 text-orange-600" />
                                            </div>
                                            <span className="font-medium text-foreground">Language</span>
                                        </div>
                                        <span className="font-semibold text-foreground">English</span>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                                <RefreshCw className="h-4 w-4 text-emerald-600" />
                                            </div>
                                            <span className="font-medium text-foreground">Last Updated</span>
                                        </div>
                                        <span className="font-semibold text-foreground">
                                            {course?.updatedAt ? new Date(course.updatedAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            }) : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
