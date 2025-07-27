"use client"

import { useState } from "react"
import { Pause, Play, X } from "lucide-react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface VideoModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function VideoModal({ isOpen, onClose }: VideoModalProps) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [progress, setProgress] = useState(25)

    const togglePlay = () => {
        setIsPlaying(!isPlaying)
    }

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const clickX = e.clientX - rect.left
        const newProgress = (clickX / rect.width) * 100
        setProgress(Math.max(0, Math.min(100, newProgress)))
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white max-w-[700px] w-[90vw] h-[50vh] lg:h-[70vh] flex flex-col gap-0 p-0">
                <DialogHeader className="px-6 py-4 border-b">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-lg font-medium text-gray-900">
                            Welcome to Udemy - Master the Game, One Tutorial at a Time!
                        </DialogTitle>
                    </div>
                </DialogHeader>
                <div className="w-full h-full">
                    <div className="w-full h-full bg-[hsla(221,39%,11%,1)] flex-1 relative flex items-center justify-center">
                        {/* Video placeholder area */}
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4 mx-auto">
                                    <Play className="h-8 w-8 text-white ml-1" />
                                </div>
                                <p className="text-gray-300 text-sm">Video content would appear here</p>
                            </div>
                        </div>
                    </div>

                    {/* Video controls */}
                    <div className="bg-gray-900 px-6 py-4 rounded-b-[8px]">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={togglePlay} className="h-8 w-8 text-white hover:bg-gray-800">
                                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                            </Button>

                            <div className="flex-1 relative">
                                <div className="h-1 bg-gray-600 rounded-full cursor-pointer" onClick={handleProgressClick}>
                                    <div
                                        className="h-full bg-green-500 rounded-full transition-all duration-150"
                                        style={{ width: `${progress}%` }}
                                    />
                                    <div
                                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full cursor-pointer"
                                        style={{ left: `${progress}%`, transform: "translateX(-50%) translateY(-50%)" }}
                                    />
                                </div>
                            </div>

                            <div className="text-white text-sm font-mono">2:30 / 10:00</div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
