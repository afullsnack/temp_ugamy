"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Grid3X3, Heart, List, Play, Search, X } from "lucide-react"
import BrandLogo from "../common/brand-logo"
import VideoModal from "./video-modal"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import ProfileImage from "@/public/profile-image.png"
import ProfileImagePlaceholder from "@/public/profile-image-placeholder.png"

export default function CourseDashboard() {
    const [activeFilter, setActiveFilter] = useState("All")
    const [viewMode, setViewMode] = useState("grid")
    const [favorites, setFavorites] = useState(new Set([1]))
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const filters = ["All", "Watched", "Not Watched", "Favorite"]

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

    const toggleFavorite = (episodeId: number) => {
        const newFavorites = new Set(favorites)
        if (newFavorites.has(episodeId)) {
            newFavorites.delete(episodeId)
        } else {
            newFavorites.add(episodeId)
        }
        setFavorites(newFavorites)
    }

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Left Sidebar - Fixed */}
            <div
                className={`
                fixed left-0 top-0 h-full w-80 bg-[hsla(221,39%,11%,1)] flex flex-col items-center z-50 text-white p-6 transform transition-transform duration-300 ease-in-out
                lg:translate-x-0 lg:static lg:z-auto overflow-y-auto
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            `}
            >
                {/* Mobile Close Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 text-white hover:bg-slate-700 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                >
                    <X className="w-5 h-5" />
                </Button>

                {/* Logo */}
                <div className="w-[233px] h-[233px] flex items-center justify-center mb-[50px]">
                    <BrandLogo />
                </div>

                {/* Profile Section */}
                <div className="flex-1">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-[233px] h-[233px] rounded-full overflow-hidden mb-4 bg-gray-600">
                            <img
                                src={ProfileImage}
                                alt="Profile"
                                width={128}
                                height={128}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <h2 className="text-xl font-semibold mb-4">Dominic Emeka</h2>
                    </div>

                    <div className="space-y-3 text-sm text-center mb-8">
                        <div>
                            <span className="text-gray-400">Username: </span>
                            <span className="text-teal-400">@gamer_don</span>
                        </div>
                        <div>
                            <span className="text-gray-400">Email: </span>
                            <span className="text-teal-400">dom@ugamy.com</span>
                        </div>
                        <div>
                            <span className="text-gray-400">Phone: </span>
                            <span className="text-teal-400">1234567890</span>
                        </div>
                        <div>
                            <span className="text-gray-400">Join Date: </span>
                            <span className="text-teal-400">July 2025</span>
                        </div>
                    </div>

                    <Button className="w-full bg-[hsla(221,39%,11%,1)] hover:bg-[hsla(221,39%,11%,1)] text-[hsla(199,89%,48%,1)] font-bold mb-8 cursor-pointer">
                        <Play className="w-4 h-4 mr-2" />
                        Watch Intro Video
                    </Button>
                </div>

                {/* Bottom Actions */}
                <div className="space-y-[50px] mt-auto">
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1 border-[hsla(160,84%,39%,1)] text-teal-400 hover:bg-[hsla(160,84%,39%,1)] hover:text-white bg-transparent"
                        >
                            Edit Profile
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 border-[hsla(160,84%,39%,1)] text-teal-400 hover:bg-[hsla(160,84%,39%,1)] hover:text-white bg-transparent"
                        >
                            Password Reset
                        </Button>
                    </div>
                    <Button variant="link" className="w-full text-[hsla(199,89%,48%,1)] hover:text-[hsla(199,89%,48%,1)]">
                        Logout
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Fixed Header */}
                <div className="fixed top-0 right-0 left-0 lg:left-80 bg-white p-4 lg:p-6 border-b z-30">
                    <div className="flex items-center justify-between mb-4 lg:mb-6">
                        <div className="flex items-center gap-3">
                            {/* Mobile Menu Button */}
                            <Button
                                variant="outline"
                                size="icon"
                                className="lg:hidden bg-transparent"
                                onClick={() => setSidebarOpen(true)}
                            >
                                <div className="w-8 h-8 bg-teal-100 rounded flex items-center justify-center">
                                    <List className="w-4 h-4 text-[hsla(160,84%,39%,1)]" />
                                </div>
                            </Button>

                            <h1 className="text-xl lg:text-4xl font-bold text-gray-900">Course Episodes</h1>
                        </div>
                        <Button variant="outline" size="icon">
                            <Search className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Filters and View Toggle */}
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex gap-2 flex-wrap">
                            {filters.map((filter) => (
                                <Button
                                    key={filter}
                                    variant={activeFilter === filter ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setActiveFilter(filter)}
                                    className={activeFilter === filter ? "bg-primary rounded-[8px] hover:bg-teal-700" : ""}
                                >
                                    {filter}
                                </Button>
                            ))}
                        </div>
                        <div className="flex gap-1">
                            <Button
                                variant={viewMode === "list" ? "default" : "outline"}
                                size="icon"
                                onClick={() => setViewMode("list")}
                                className={viewMode === "list" ? "bg-[hsla(160,84%,39%,1)] hover:bg-teal-700" : ""}
                            >
                                <List className="w-4 h-4" />
                            </Button>
                            <Button
                                variant={viewMode === "grid" ? "default" : "outline"}
                                size="icon"
                                onClick={() => setViewMode("grid")}
                                className={viewMode === "grid" ? "bg-[hsla(160,84%,39%,1)] hover:bg-teal-700" : ""}
                            >
                                <Grid3X3 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto pt-40 lg:pt-40">
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
                <VideoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            </div>
        </div>
    )
}
