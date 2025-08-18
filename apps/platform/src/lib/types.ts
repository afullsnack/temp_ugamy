export interface IGetCourseResponse {
    id: string,
    title: string,
    description: string,
    slug: string,
    thumbnailUrl: string,
    difficulty: "beginner" | "intermediate" | "advanced",
    isPublished: boolean,
    createdAt: string | Date,
    updatedAt: string | Date,
    enrollments: Array<string>, // placeholder value
    videos: IVideo[]
}

export interface IVideo {
    id: string
    title: string
    description: string
    duration: number
    thumbnailUrl: string
    videoUrl: string
    order: number
    courseId: string
    isPublished: boolean
    createdAt: string | Date
    updatedAt: string | Date
}