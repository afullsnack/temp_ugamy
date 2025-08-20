"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Clock, BookOpen, Globe, ChevronLeft } from "lucide-react"
import axios from "axios"
import { env } from '@/env'
import { useNavigate, useParams } from "@tanstack/react-router"
import type { ICourseDetails } from "@/lib/types"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import CourseEpisodesTemplate from "../common/course-episodes-templates"


export const CourseDetailsTemplate = () => {
    const { id } = useParams({ from: '/courses/$id' })
    const navigate = useNavigate()

    const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set())
    const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set())


    const getCourseDetails = async (): Promise<ICourseDetails> => {
        const response = await axios.get(`${env.VITE_API_URL}/courses/${id}/`, {
            withCredentials: true
        })
        return response.data
    }

    // Get Course details API query
    const { data: course, isLoading, error } = useQuery({
        queryKey: ['courses-details'],
        queryFn: getCourseDetails
    })

    const handleWatch = (vid: string) => {
        navigate({ to: "/watch/$id/videos/$vid/watch", params: { id: id, vid: vid } })
    }

    const progressPercentage =
        (course?.videos?.length ?? 0) > 0 ? (watchedVideos.size / (course?.videos?.length ?? 1)) * 100 : 0

    return (
        <div className="relative min-h-screen h-fit bg-background overflow-y-auto mt-[50px]">
            <div className="bg-white bg-gradient-to-br from-primary/20 via-background to-accent/5 border-b border-border">
                <div className="container mx-auto px-4 py-8">
                    <Link
                        to="/dashboard"
                        className=" flex items-center txt-base lg:text-lg text-muted-foreground hover:text-foreground mb-6"
                    >
                        <ChevronLeft /> Back to Courses
                    </Link>
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div className="space-y-4">
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                Gaming
                            </Badge>
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">{course?.title}</h1>
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
                                <span>{Math.floor(course?.totalWatchTime ?? 0 / 60)} minutes</span>
                            </div>
                            <div className="flex items-center gap-2 capitalize">
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
            <CourseEpisodesTemplate
                title="Course Content"
                course={course as ICourseDetails}
                error={error}
                handleWatch={handleWatch}
                isLoading={isLoading}
                likedVideos={likedVideos}
                progressPercentage={progressPercentage}
                watchedVideos={watchedVideos}
            />
        </div>
    )
}
