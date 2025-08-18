"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Heart, Clock } from "lucide-react"
import { Button } from "../ui/button"
import type { FC } from "react"
import { Badge } from "@/components/ui/badge"
import ProfileImagePlaceholder from "/profile-image-placeholder.png"
import type { IGetCourseResponse } from "@/lib/types"
import { CoursesSkeleton } from "./courses-skeleton"
import { CoursesEmptyStateWidget } from "./courses-empty-state-widget"
import { CoursesErrorStateWidget } from "./courses-error-state-widget"
import { useNavigate } from "@tanstack/react-router"

interface IProps {
    viewMode: "grid" | "list"
    data: IGetCourseResponse[]
    isLoading: boolean
    error: Error | null
}


const CoursesTemp: FC<IProps> = ({ viewMode, data, isLoading, error }) => {
    const navigate = useNavigate()

    const [favorites, setFavorites] = useState(new Set<string>())

    const showDetails = (id: string | number) => {
        navigate({ to: `/course-details/${id}` })
    }

    const toggleFavorite = (courseId: string) => {
        const newFavorites = new Set(favorites)
        if (newFavorites.has(courseId)) {
            newFavorites.delete(courseId)
        } else {
            newFavorites.add(courseId)
        }
        setFavorites(newFavorites)
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
            <div className="w-full h-full flex-1 overflow-y-auto pt-40 lg:pt-40">
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
                                    grid gap-4 lg:gap-6 mb-8
                                    ${viewMode === "grid"
                                        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
                                        : "grid-cols-1"
                                    }
                                `}
                            >
                                {data.map((course) => (
                                    <div
                                        key={course.id}
                                        className="bg-white rounded-lg overflow-hidden shadow-sm border cursor-pointer"
                                        onClick={() => showDetails(course?.id)}
                                    >
                                        <div className="relative">
                                            <img
                                                src={course.thumbnailUrl || ProfileImagePlaceholder}
                                                alt={course.title}
                                                width={200}
                                                height={120}
                                                className="w-full h-32 object-cover bg-gray-200"
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    toggleFavorite(course.id)
                                                }}
                                            >
                                                <Heart
                                                    className={`w-4 h-4 ${favorites.has(course.id) ? "fill-red-500 text-red-500" : "text-gray-400"}`}
                                                />
                                            </Button>
                                            <Badge className={`absolute bottom-2 left-2 text-xs ${getDifficultyColor(course.difficulty)}`}>
                                                {course.difficulty}
                                            </Badge>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-medium text-gray-900 text-sm leading-tight mb-2">{course.title}</h3>
                                            <p className="text-xs text-gray-600 line-clamp-2 mb-2">{course.description}</p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{new Date(course.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                {course.isPublished && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        Published
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
                                <p className="text-sm text-gray-600">
                                    Showing 1-{data?.length} of {data?.length} courses
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
