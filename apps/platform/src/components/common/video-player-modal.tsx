"use client"

import type React from "react"
import { create, useModal } from "@ebay/nice-modal-react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from "lucide-react"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

interface VideoPlayerModalProps {
    videoUrl: string
    title: string
}

export const VideoPlayerModal = create(({ videoUrl, title }: VideoPlayerModalProps) => {
    const { resolve, remove, visible } = useModal()

    const videoRef = useRef<HTMLVideoElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [isMuted, setIsMuted] = useState(false)
    const [showControls, setShowControls] = useState(true)
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const handleCloseModal = () => {
        resolve({ resolved: true })
        remove()
    }

    // Security: Disable right-click context menu
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault()
    }

    // Security: Disable keyboard shortcuts for downloading/sharing
    const handleKeyDown = (e: KeyboardEvent) => {
        // Disable common download/save shortcuts
        if (e.ctrlKey && (e.key === "s" || e.key === "S")) {
            e.preventDefault()
        }
        // Disable F12 (dev tools)
        if (e.key === "F12") {
            e.preventDefault()
        }
        // Disable Ctrl+Shift+I (dev tools)
        if (e.ctrlKey && e.shiftKey && e.key === "I") {
            e.preventDefault()
        }
        // Disable Ctrl+U (view source)
        if (e.ctrlKey && (e.key === "u" || e.key === "U")) {
            e.preventDefault()
        }
    }

    // Security: Detect screen recording attempts
    useEffect(() => {
        if (!visible) return

        const detectScreenRecording = () => {
            // Check for screen capture API usage
            if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
                const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia
                navigator.mediaDevices.getDisplayMedia = function (...args) {
                    console.warn("Screen recording detected - video paused for security")
                    if (videoRef.current) {
                        videoRef.current.pause()
                        setIsPlaying(false)
                    }
                    return originalGetDisplayMedia.apply(this, args)
                }
            }
        }

        // Security: Disable drag and drop
        const handleDragStart = (e: DragEvent) => {
            e.preventDefault()
        }

        // Security: Disable selection
        const handleSelectStart = (e: Event) => {
            e.preventDefault()
        }

        document.addEventListener("keydown", handleKeyDown)
        document.addEventListener("dragstart", handleDragStart)
        document.addEventListener("selectstart", handleSelectStart)
        detectScreenRecording()

        return () => {
            document.removeEventListener("keydown", handleKeyDown)
            document.removeEventListener("dragstart", handleDragStart)
            document.removeEventListener("selectstart", handleSelectStart)
        }
    }, [visible])

    // Auto-hide controls
    const resetControlsTimeout = () => {
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current)
        }
        setShowControls(true)
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) {
                setShowControls(false)
            }
        }, 3000)
    }

    const handleMouseMove = () => {
        resetControlsTimeout()
    }

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause()
            } else {
                videoRef.current.play()
            }
            setIsPlaying(!isPlaying)
        }
    }

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime)
        }
    }

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration)
        }
    }

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = Number.parseFloat(e.target.value)
        if (videoRef.current) {
            videoRef.current.currentTime = time
            setCurrentTime(time)
        }
    }

    const skipForward = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, duration)
        }
    }

    const skipBackward = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0)
        }
    }

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted
            setIsMuted(!isMuted)
        }
    }

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)
        return `${minutes}:${seconds.toString().padStart(2, "0")}`
    }

    if (!visible) return null

    return (
        <AlertDialog open={visible} onOpenChange={handleCloseModal}>
            <AlertDialogContent className="max-w-[95vw] sm:max-w-4xl w-full p-0 bg-black border-gray-800 overflow-hidden">
                <AlertDialogHeader className="sr-only">
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                </AlertDialogHeader>

                <Button
                    onClick={handleCloseModal}
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white hover:bg-white/20 z-20 h-8 w-8 sm:h-10 sm:w-10"
                >
                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>

                <div
                    className="relative bg-black overflow-hidden"
                    onContextMenu={handleContextMenu}
                    onMouseMove={handleMouseMove}
                    style={{ userSelect: "none", WebkitUserSelect: "none" }}
                >
                    <div className="absolute inset-0 z-10 pointer-events-none" />

                    <video
                        ref={videoRef}
                        src={videoUrl}
                        className="w-full aspect-video"
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        controlsList="nodownload nofullscreen noremoteplayback"
                        disablePictureInPicture
                        playsInline
                        onDragStart={(e) => e.preventDefault()}
                        style={{ pointerEvents: "none" }}
                    />

                    <div
                        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"
                            }`}
                        style={{ pointerEvents: showControls ? "auto" : "none" }}
                    >
                        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 right-12 sm:right-16">
                            <h3 className="text-white text-sm sm:text-lg font-semibold truncate">{title}</h3>
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center">
                            <Button
                                onClick={togglePlay}
                                variant="ghost"
                                size="icon"
                                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm border border-white/20"
                            >
                                {isPlaying ? (
                                    <Pause className="h-6 w-6 sm:h-8 sm:w-8" />
                                ) : (
                                    <Play className="h-6 w-6 sm:h-8 sm:w-8 ml-0.5" />
                                )}
                            </Button>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 space-y-2 sm:space-y-3">
                            <div className="w-full px-1">
                                <input
                                    type="range"
                                    min="0"
                                    max={duration || 0}
                                    value={currentTime}
                                    onChange={handleSeek}
                                    className="w-full h-1 sm:h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer video-slider"
                                    style={{
                                        background: `linear-gradient(to right, #22c55e 0%, #22c55e ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) 100%)`,
                                    }}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-1 sm:space-x-2">
                                    <Button
                                        onClick={skipBackward}
                                        variant="ghost"
                                        size="icon"
                                        className="text-white hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10 rounded-full backdrop-blur-sm"
                                    >
                                        <SkipBack className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </Button>

                                    <Button
                                        onClick={togglePlay}
                                        variant="ghost"
                                        size="icon"
                                        className="text-white hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10 rounded-full backdrop-blur-sm"
                                    >
                                        {isPlaying ? (
                                            <Pause className="h-4 w-4 sm:h-5 sm:w-5" />
                                        ) : (
                                            <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                                        )}
                                    </Button>

                                    <Button
                                        onClick={skipForward}
                                        variant="ghost"
                                        size="icon"
                                        className="text-white hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10 rounded-full backdrop-blur-sm"
                                    >
                                        <SkipForward className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </Button>

                                    <Button
                                        onClick={toggleMute}
                                        variant="ghost"
                                        size="icon"
                                        className="text-white hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10 rounded-full backdrop-blur-sm"
                                    >
                                        {isMuted ? (
                                            <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" />
                                        ) : (
                                            <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
                                        )}
                                    </Button>
                                </div>

                                <div className="text-white text-xs sm:text-sm font-medium bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
                                    {formatTime(currentTime)} / {formatTime(duration)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    )
})
