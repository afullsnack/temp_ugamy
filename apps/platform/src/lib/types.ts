export interface ICourseDetails {
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
    totalVideos: number,
    totalWatchTime: number,
    isEnrolled: boolean;
    videos: IVideo[]
}

export interface IGetCourseResponse {
    success: true,
    data: ICourseDetails[]
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
    isFavorite: boolean;
    createdAt: string | Date
    updatedAt: string | Date
}

export interface IGetVideosResponse {
    success: boolean,
    data: IVideo[]
}
export interface IGetVideoByIdResponse {
    id: string,
    key: string,
    courseId: string,
    metadata: string,
    title: string,
    description: string,
    thumbnailUrl: string,
    duration: number,
    orderIndex: number,
    isPublished: true,
    createdAt: string,
    updatedAt: string,
    isFavorite: boolean
    // likes: []
}
