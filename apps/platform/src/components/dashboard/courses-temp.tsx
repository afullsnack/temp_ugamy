"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { Button } from "../ui/button"
import type { FC } from "react"
import { Badge } from "@/components/ui/badge"
import ProfileImagePlaceholder from "/profile-image-placeholder.png"
import type { ICourseDetails } from "@/lib/types"
import { CoursesSkeleton } from "./courses-skeleton"
import { CoursesEmptyStateWidget } from "./courses-empty-state-widget"
import { CoursesErrorStateWidget } from "./courses-error-state-widget"
import { useNavigate } from "@tanstack/react-router"
import axios from "axios"
import { env } from "@/env"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface IProps {
    viewMode: "grid" | "list"
    data: ICourseDetails[]
    isLoading: boolean
    error: Error | null
}

const enrollCourse = async (payload: Record<string, string>): Promise<{
    success: boolean,
    message: string
}> => {
    const response = await axios.post(`${env.VITE_API_URL}/courses/enroll/`, payload, {
        withCredentials: true
    })
    return response.data
}


const CoursesTemp: FC<IProps> = ({ viewMode, data = [], isLoading, error }) => {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    // Course Enroll API mutation
    // Update mutation to track course ID
    const { mutateAsync, isPending, variables } = useMutation({
        mutationFn: enrollCourse,
        onError: (error) => {
            toast.error(error.message || 'Error enrolling for this course, kindly try again ')
        },
    })

    const showDetails = (id: string | number) => {
        navigate({ to: `/courses/${id}` })
    }

    const handlEnroll = async ({ courseId }: { courseId: string }) => {
        await mutateAsync({
            courseId: courseId
        }).then(() => {
            queryClient.invalidateQueries({ queryKey: ["courses"] });
            navigate({ to: `/courses/${courseId}` })
        })
    }

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case "beginner":
                return "bg-green-100 text-green-800"
            case "intermediate":
                return "bg-yellow-100 text-yellow-800"
            case "advanced":
                return "bg-red-100 text-red-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    return (
        <>
            <div className="w-full h-full flex-1 overflow-y-auto">
                <div className="p-4 lg:p-6">
                    {error && <CoursesErrorStateWidget error={error} />}

                    {!error && isLoading && (
                        <div
                            className={`
                                grid gap-4 lg:gap-6 mb-8
                                ${viewMode === "grid"
                                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
                                    : "grid-cols-1"
                                }
                            `}
                        >
                            {Array.from({ length: 6 }).map((_, index) => (
                                <CoursesSkeleton key={index} viewMode={viewMode} />
                            ))}
                        </div>
                    )}

                    {!error && !isLoading && data?.length === 0 && <CoursesEmptyStateWidget />}

                    {!error && !isLoading && data?.length > 0 && (
                        <>
                            {/* Courses Grid */}
                            <div
                                className={`
                                    grid gap-6 lg:gap-6 mb-8
                                    ${viewMode === "grid"
                                        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
                                        : "grid-cols-1"
                                    }
                                `}
                            >
                                {data?.map((course, idx) => (
                                    <div
                                        key={idx}
                                        className={cn("bg-white rounded-[8px] overflow-hidden shadow-sm border", !course?.isEnrolled ? "cursor-default" : "cursor-pointer pointer-events-auto")}
                                        onClick={() => { course?.isEnrolled && showDetails(course?.id) }}
                                    >
                                        <div className="relative">
                                            <img
                                                src={course?.thumbnailUrl || ProfileImagePlaceholder}
                                                alt={course?.title || "Course thumbnail"}
                                                width={200}
                                                height={120}
                                                className="w-full h-32 object-cover bg-gray-200"
                                            />
                                            <Badge className={`absolute bottom-2 left-2 text-sm capitalize ${getDifficultyColor(course?.difficulty)}`}>
                                                {course?.difficulty ?? "N/A"}
                                            </Badge>
                                        </div>
                                        
                                        <div className="p-4">
                                            {/* Title */}
                                            <h3 className="font-medium text-gray-900 text-lg leading-tight mb-2">{course?.title ?? "N/A"}</h3>

                                            {/* Description */}
                                            <p className="text-base text-gray-600 line-clamp-2 mb-2">{course?.description ?? "N/A"}</p>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1 text-xs md:text-sm text-gray-500">
                                                    <Clock className="w-3 h-3" />
                                                    last updated:
                                                    <span>{new Date(course?.createdAt)?.toLocaleDateString()}</span>
                                                </div>

                                                {/* Enroll */}
                                                <Button
                                                    disabled={isPending && variables?.courseId === course.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handlEnroll({ courseId: course.id })
                                                    }}
                                                >
                                                    {(isPending && variables?.courseId === course.id) ? "Enrolling..." : "Enroll"}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
                                <p className="text-sm text-gray-600">
                                    Showing 1-{data?.length ?? 0} of {data?.length ?? 0} courses
                                </p>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="icon">
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="bg-[hsla(160,84%,39%,1)] text-white hover:bg-teal-700"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    )
}

export default CoursesTemp
