import { useState } from 'react'
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react'
import { Button } from '../ui/button'
import VideoModal from "./video-modal"
import type { FC } from 'react'
import { Progress } from "@/components/ui/progress"
import ProfileImagePlaceholder from "/profile-image-placeholder.png"

interface IProps {
    viewMode: "grid" | "list"
}

const CoursesTemp: FC<IProps> = ({ viewMode }) => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [favorites, setFavorites] = useState(new Set([1]))

    const toggleFavorite = (episodeId: number) => {
        const newFavorites = new Set(favorites)
        if (newFavorites.has(episodeId)) {
            newFavorites.delete(episodeId)
        } else {
            newFavorites.add(episodeId)
        }
        setFavorites(newFavorites)
    }

    const episodes = [
        {
            id: 1,
            title: "Episode 1 – Introduction to Tactics",
            thumbnail: "/placeholder.svg?height=120&width=200&text=Episode+1",
        },
        {
            id: 2,
            title: "Episode 2 – Dribbling Like a Pro",
            thumbnail: "/placeholder.svg?height=120&width=200&text=Episode+2",
        },
        {
            id: 3,
            title: "Episode 3 – Mastering Defense & Formation",
            thumbnail: "/placeholder.svg?height=120&width=200&text=Episode+3",
        },
        {
            id: 4,
            title: "Episode 4 – Introduction to Tactics",
            thumbnail: "/placeholder.svg?height=120&width=200&text=Episode+4",
        },
        {
            id: 5,
            title: "Episode 5 – Dribbling Like a Pro",
            thumbnail: "/placeholder.svg?height=120&width=200&text=Episode+5",
        },
        {
            id: 6,
            title: "Episode 6 – Mastering Defense & Formation",
            thumbnail: "/placeholder.svg?height=120&width=200&text=Episode+6",
        },
        {
            id: 7,
            title: "Episode 7 – Introduction to Tactics",
            thumbnail: "/placeholder.svg?height=120&width=200&text=Episode+7",
        },
        {
            id: 8,
            title: "Episode 8 – Dribbling Like a Pro",
            thumbnail: "/placeholder.svg?height=120&width=200&text=Episode+8",
        },
        {
            id: 9,
            title: "Episode 9 – Mastering Defense & Formation",
            thumbnail: "/placeholder.svg?height=120&width=200&text=Episode+9",
        },
    ]

    return (
        <>
            <div className="w-full h-full flex-1 overflow-y-auto pt-40 lg:pt-40">
                <div className="p-4 lg:p-6">
                    {/* Episodes Grid */}
                    <div
                        className={`
                            grid gap-4 lg:gap-6 mb-8
                            ${viewMode === "grid"
                                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
                                : "grid-cols-1"
                            }
                        `}
                    >
                        {episodes.map((episode) => (
                            <div key={episode.id} className="bg-white rounded-lg overflow-hidden shadow-sm border cursor-pointer" onClick={() => setIsModalOpen(true)}>
                                <div className="relative">
                                    <img
                                        src={episode.thumbnail || ProfileImagePlaceholder}
                                        alt={episode.title}
                                        width={200}
                                        height={120}
                                        className="w-full h-32 object-cover bg-gray-200"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                                        onClick={() => toggleFavorite(episode.id)}
                                    >
                                        <Heart
                                            className={`w-4 h-4 ${favorites.has(episode.id) ? "fill-red-500 text-red-500" : "text-gray-400"}`}
                                        />
                                    </Button>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-medium text-gray-900 text-sm leading-tight">{episode.title}</h3>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
                        <p className="text-sm text-gray-600">Showing 1-9 of 50 pages</p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="icon">
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="bg-[hsla(160,84%,39%,1)] text-white hover:bg-teal-700">
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Course Progress */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Course Progress</h3>
                        <Progress value={25} className="h-2" />
                    </div>
                </div>
            </div>

            {/* Video Modal */}
            {/* TODO: Use EBAY-MODAL TO RENDER MODALS */}
            <VideoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    )
}

export default CoursesTemp