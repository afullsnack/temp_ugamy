"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Play, Eye, Heart, AlertCircle, RefreshCw, ImageIcon } from "lucide-react"
import axios from "axios"
import { env } from '@/env'
import { useParams } from "@tanstack/react-router"
import type { IGetCourseResponse, IVideo } from "@/lib/types"
import { useQuery } from "@tanstack/react-query"
import { Alert, AlertDescription } from "../ui/alert"
import { CourseDetailsHeader } from "./course-details-header"


export const CourseDetailsTemplate = () => {
    const { id } = useParams({ from: '/course-details/$id' })

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

    const progressPercentage = (course?.videos?.length ?? 0) > 0 ? (watchedVideos.size / (course?.videos?.length ?? 1)) * 100 : 0

    const VideoSkeleton = () => (
        <Card className="bg-white border border-gray-200">
            <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex items-center gap-1">
                        <Skeleton className="h-6 w-6 rounded" />
                        <Skeleton className="h-6 w-6 rounded" />
                    </div>
                </div>
                <Skeleton className="h-3 w-1/2" />
            </CardContent>
        </Card>
    )

    return (
        <div className="relative bg-gray-50 w-full h-full flex-1 overflow-y-auto pt-40 lg:pt-40">
            <CourseDetailsHeader title={course?.title as string} />
            <div className="container mx-auto p-4 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
                    {/* Video/Thumbnail Section */}
                    <div className="lg:col-span-3">
                        <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center mx-auto mb-2">
                                    <ImageIcon className="h-6 w-6 text-gray-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">{course?.title}</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Category</span>
                                    <Badge variant="secondary" className="bg-teal-100 text-teal-700 hover:bg-teal-100">
                                        Gaming
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Episodes</span>
                                    <span className="text-sm font-semibold text-gray-900">0</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <p className="text-sm text-gray-700 leading-relaxed">{course?.description}</p>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Episodes</h3>

                    {error && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="flex items-center justify-between">
                                <span>{error instanceof Error ? error?.message : 'An error occurred'}</span>
                                <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="ml-2 bg-transparent">
                                    <RefreshCw className="h-4 w-4 mr-1" />
                                    Retry
                                </Button>
                            </AlertDescription>
                        </Alert>
                    )}

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <VideoSkeleton key={index} />
                            ))}
                        </div>
                    ) : course?.videos?.length === 0 && !error ? (
                        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <Play className="h-6 w-6 text-gray-400" />
                            </div>
                            <h4 className="text-base font-medium text-gray-900 mb-2">No Episodes Available</h4>
                            <p className="text-sm text-gray-500">This course doesn't have any episodes yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                            {course?.videos?.map?.((video) => (
                                <Card key={video?.id} className="bg-white border border-gray-200 hover:shadow-sm transition-shadow">
                                    <CardContent className="p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{video?.title}</h4>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleWatched(video?.id)}
                                                    className="h-6 w-6 p-0 hover:bg-gray-100"
                                                >
                                                    <Eye
                                                        className={`h-3.5 w-3.5 ${watchedVideos?.has(video.id) ? "text-blue-600 fill-current" : "text-gray-400"
                                                            }`}
                                                    />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleLiked(video?.id)}
                                                    className="h-6 w-6 p-0 hover:bg-gray-100"
                                                >
                                                    <Heart
                                                        className={`h-3.5 w-3.5 ${likedVideos?.has(video.id) ? "text-red-500 fill-current" : "text-gray-400"
                                                            }`}
                                                    />
                                                </Button>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500">Duration: {Math.floor(video?.duration / 60)} minutes</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {!isLoading && !error && (course?.videos?.length ?? 0) > 0 && (
                        <Button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 text-sm font-medium">
                            View All Episodes
                        </Button>
                    )}
                </div>

                {!isLoading && !error && (course?.videos?.length ?? 0) > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Course Progress</h3>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <Progress value={progressPercentage} className="h-2 mb-2" />
                            <p className="text-sm text-gray-600">
                                {watchedVideos.size} of {course?.videos?.length} episodes completed ({Math?.round?.(progressPercentage)}%)
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
