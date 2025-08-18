"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Heart,
    Eye,
    SkipBack,
    SkipForward,
    RotateCcw,
    Settings,
    Maximize,
    Minimize,
    MoreHorizontal,
    Loader2,
} from "lucide-react"
import { env } from "@/env"

interface VideoPlayerProps {
    courseId: string
    userId: string
    videoId: string
    playlist?: Video[]
}

interface Video {
    id: number
    courseId: number
    title: string
    description: string
    key: string
    thumbnailUrl: string
    duration: number
    orderIndex: number
    isPublished: boolean
}

interface VideoProgress {
    watched: boolean
    liked: boolean
    watch_time: number
}

interface BufferingState {
    isBuffering: boolean
    isLoading: boolean
    canPlay: boolean
    hasStarted: boolean
}

const VideoPlayerSkeleton = () => (
    <div className="max-w-6xl mx-auto space-y-6 bg-background">
        <div className="relative bg-card rounded-xl overflow-hidden shadow-2xl">
            <Skeleton className="w-full aspect-video" />
            <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
                <Skeleton className="h-2 w-full" />
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-16 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                    </div>
                </div>
            </div>
        </div>
    </div>
)

export const StreamVideoPlayer = ({ videoId, userId, playlist = [] }: VideoPlayerProps) => {
    const [progress, setProgress] = useState<VideoProgress>({
        watched: false,
        liked: false,
        watch_time: 0,
    })
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(1)
    const [playbackRate, setPlaybackRate] = useState(1)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [showControls, setShowControls] = useState(true)
    const [isMobile, setIsMobile] = useState(false)
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0)

    const [bufferingState, setBufferingState] = useState<BufferingState>({
        isBuffering: false,
        isLoading: true,
        canPlay: false,
        hasStarted: false,
    })

    const videoRef = useRef<HTMLVideoElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const progressUpdateRef = useRef<NodeJS.Timeout>(null)
    const controlsTimeoutRef = useRef<NodeJS.Timeout>(null)

    const apiUrl = env.VITE_API_URL
    const playbackSpeeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

    const queryClient = useQueryClient()

    // Get Video by Id
    const {
        data: video,
        isLoading: videoLoading,
        error: videoError,
    } = useQuery({
        queryKey: ["video", videoId],
        queryFn: async () => {
            const response = await fetch(`${apiUrl}/videos/${videoId}`)
            if (!response.ok) {
                throw new Error("Failed to fetch video")
            }
            return response.json()
        },
    })

    const { data: progressData, isLoading: progressLoading } = useQuery({
        queryKey: ["video-progress", videoId, userId],
        queryFn: async () => {
            const response = await fetch(`/api/videos/${videoId}/progress?userId=${userId}`)
            if (!response.ok) {
                // Progress not found is okay - user hasn't watched yet
                return { watched: false, liked: false, watch_time: 0 }
            }
            return response.json()
        },
    })

    const updateProgressMutation = useMutation({
        mutationFn: async (progressUpdate: Partial<VideoProgress>) => {
            const response = await fetch(`/api/videos/${videoId}/progress`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId,
                    ...progress,
                    ...progressUpdate,
                }),
            })
            if (!response.ok) {
                throw new Error("Failed to update progress")
            }
            return response.json()
        },
        onSuccess: (data, variables) => {
            setProgress((prev) => ({ ...prev, ...variables }))
            queryClient.invalidateQueries({ queryKey: ["video-progress", videoId, userId] })
        },
        onError: () => {
            // Silently fail - progress tracking is not critical
        },
    })

    const handleLoadStart = () => {
        setBufferingState((prev) => ({ ...prev, isLoading: true, canPlay: false }))
    }

    const handleLoadedData = () => {
        setBufferingState((prev) => ({ ...prev, isLoading: false }))
    }

    const handleCanPlay = () => {
        setBufferingState((prev) => ({ ...prev, canPlay: true, isBuffering: false }))
    }

    const handleWaiting = () => {
        setBufferingState((prev) => ({ ...prev, isBuffering: true }))
    }

    const handlePlaying = () => {
        setBufferingState((prev) => ({
            ...prev,
            isBuffering: false,
            hasStarted: true,
            canPlay: true,
        }))
        setIsPlaying(true)
    }

    const handlePause = () => {
        setIsPlaying(false)
    }

    const handleSeeking = () => {
        setBufferingState((prev) => ({ ...prev, isBuffering: true }))
    }

    const handleSeeked = () => {
        setBufferingState((prev) => ({ ...prev, isBuffering: false }))
    }

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (!videoRef.current) return

            // Prevent default behavior for video controls
            const activeElement = document.activeElement
            const isInputFocused =
                activeElement?.tagName === "INPUT" ||
                activeElement?.tagName === "TEXTAREA" ||
                (activeElement as HTMLElement)?.isContentEditable === true

            if (isInputFocused) return

            switch (event.code) {
                case "Space":
                    event.preventDefault()
                    togglePlay()
                    break
                case "KeyK":
                    event.preventDefault()
                    togglePlay()
                    break
                case "KeyM":
                    event.preventDefault()
                    toggleMute()
                    break
                case "KeyF":
                    event.preventDefault()
                    toggleFullscreen()
                    break
                case "ArrowLeft":
                    event.preventDefault()
                    rewind()
                    break
                case "ArrowRight":
                    event.preventDefault()
                    fastForward()
                    break
                case "ArrowUp":
                    event.preventDefault()
                    handleVolumeChange([Math.min(1, volume + 0.1)])
                    break
                case "ArrowDown":
                    event.preventDefault()
                    handleVolumeChange([Math.max(0, volume - 0.1)])
                    break
                case "Comma":
                    if (event.shiftKey) {
                        event.preventDefault()
                        const currentIndex = playbackSpeeds.indexOf(playbackRate)
                        const newIndex = Math.max(0, currentIndex - 1)
                        changePlaybackSpeed(playbackSpeeds[newIndex])
                    }
                    break
                case "Period":
                    if (event.shiftKey) {
                        event.preventDefault()
                        const currentIndex = playbackSpeeds.indexOf(playbackRate)
                        const newIndex = Math.min(playbackSpeeds.length - 1, currentIndex + 1)
                        changePlaybackSpeed(playbackSpeeds[newIndex])
                    }
                    break
                case "Digit0":
                case "Digit1":
                case "Digit2":
                case "Digit3":
                case "Digit4":
                case "Digit5":
                case "Digit6":
                case "Digit7":
                case "Digit8":
                case "Digit9":
                    event.preventDefault()
                    const digit = Number.parseInt(event.code.slice(-1))
                    const seekTime = (digit / 10) * duration
                    videoRef.current.currentTime = seekTime
                    setCurrentTime(seekTime)
                    break
            }
        },
        [isPlaying, volume, playbackRate, duration, playbackSpeeds],
    )

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown)
        return () => {
            document.removeEventListener("keydown", handleKeyDown)
        }
    }, [handleKeyDown])

    useEffect(() => {
        if (progressData) {
            setProgress(progressData)
        }
    }, [progressData])

    useEffect(() => {
        // Find current video index in playlist
        const index = playlist.findIndex((v) => v.id.toString() === videoId)
        if (index !== -1) {
            setCurrentVideoIndex(index)
        }

        return () => {
            if (progressUpdateRef.current) {
                clearInterval(progressUpdateRef.current)
            }
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current)
            }
        }
    }, [videoId, playlist])

    useEffect(() => {
        if (isPlaying) {
            progressUpdateRef.current = setInterval(() => {
                updateWatchProgress()
            }, 5000)
        } else {
            if (progressUpdateRef.current) {
                clearInterval(progressUpdateRef.current)
            }
        }

        return () => {
            if (progressUpdateRef.current) {
                clearInterval(progressUpdateRef.current)
            }
        }
    }, [isPlaying, currentTime])

    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < 768) // md breakpoint
        }

        checkIsMobile()
        window.addEventListener("resize", checkIsMobile)

        return () => window.removeEventListener("resize", checkIsMobile)
    }, [])

    useEffect(() => {
        const showControlsTemporarily = () => {
            setShowControls(true)
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current)
            }

            // Different timeout durations based on device type
            if (isPlaying) {
                const timeout = isMobile ? 3000 : 3000 // 3 seconds for both, but can be customized
                controlsTimeoutRef.current = setTimeout(() => {
                    setShowControls(false)
                }, timeout)
            }
        }

        const handleUserActivity = (e: Event) => {
            // Prevent showing controls when clicking on control elements themselves
            const target = e.target as HTMLElement
            if (target.closest("[data-controls]")) {
                return
            }
            showControlsTemporarily()
        }

        const handleMouseMove = () => {
            if (!isMobile) {
                showControlsTemporarily()
            }
        }

        const handleTouchStart = () => {
            if (isMobile) {
                showControlsTemporarily()
            }
        }

        const handleClick = () => {
            showControlsTemporarily()
        }

        const handleMouseLeave = () => {
            if (!isMobile && isPlaying) {
                setShowControls(false)
            }
        }

        const container = containerRef.current
        if (container) {
            // Mouse events for desktop/tablet
            container.addEventListener("mousemove", handleMouseMove)
            container.addEventListener("mouseleave", handleMouseLeave)

            // Touch events for mobile
            container.addEventListener("touchstart", handleTouchStart)

            // Click/tap events for all devices
            container.addEventListener("click", handleClick)
        }

        return () => {
            if (container) {
                container.removeEventListener("mousemove", handleMouseMove)
                container.removeEventListener("mouseleave", handleMouseLeave)
                container.removeEventListener("touchstart", handleTouchStart)
                container.removeEventListener("click", handleClick)
            }
        }
    }, [isPlaying, isMobile])

    const updateWatchProgress = async () => {
        if (!videoRef.current) return

        const watchTime = Math.floor(videoRef.current.currentTime)
        const totalDuration = Math.floor(videoRef.current.duration || 0)
        const watchedPercentage = totalDuration > 0 ? (watchTime / totalDuration) * 100 : 0
        const isWatched = watchedPercentage >= 80

        updateProgressMutation.mutate({
            watch_time: watchTime,
            watched: isWatched,
        })
    }

    const toggleLike = async () => {
        const newLikedState = !progress.liked
        updateProgressMutation.mutate({ liked: newLikedState })

        toast.info(newLikedState ? "Video liked!" : "Like removed", {
            description: newLikedState ? "Added to your liked videos" : "Removed from liked videos",
        })
    }

    const togglePlay = () => {
        if (!videoRef.current) return

        if (isPlaying) {
            videoRef.current.pause()
        } else {
            videoRef.current.play()
        }
    }

    const toggleMute = () => {
        if (!videoRef.current) return

        videoRef.current.muted = !isMuted
        setIsMuted(!isMuted)
    }

    const handleSeek = (value: number[]) => {
        if (!videoRef.current) return
        const newTime = value[0]
        videoRef.current.currentTime = newTime
        setCurrentTime(newTime)
    }

    const rewind = () => {
        if (!videoRef.current) return
        const newTime = Math.max(0, videoRef.current.currentTime - 10)
        videoRef.current.currentTime = newTime
        setCurrentTime(newTime)
    }

    const fastForward = () => {
        if (!videoRef.current) return
        const newTime = Math.min(duration, videoRef.current.currentTime + 10)
        videoRef.current.currentTime = newTime
        setCurrentTime(newTime)
    }

    const goToPreviousVideo = () => {
        if (playlist.length === 0 || currentVideoIndex === 0) return
        const prevVideo = playlist[currentVideoIndex - 1]
        window.location.href = `/video/${prevVideo.id}`
    }

    const goToNextVideo = () => {
        if (playlist.length === 0 || currentVideoIndex === playlist.length - 1) return
        const nextVideo = playlist[currentVideoIndex + 1]
        window.location.href = `/video/${nextVideo.id}`
    }

    const changePlaybackSpeed = (speed: number) => {
        if (!videoRef.current) return
        videoRef.current.playbackRate = speed
        setPlaybackRate(speed)
        toast.info(`Playback speed: ${speed}x`)
    }

    const toggleFullscreen = () => {
        if (!containerRef.current) return

        if (!isFullscreen) {
            if (containerRef.current.requestFullscreen) {
                containerRef.current.requestFullscreen()
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen()
            }
        }
        setIsFullscreen(!isFullscreen)
    }

    const handleTimeUpdate = () => {
        if (!videoRef.current) return
        setCurrentTime(videoRef.current.currentTime)
    }

    const handleLoadedMetadata = () => {
        if (!videoRef.current) return
        setDuration(videoRef.current.duration)
        videoRef.current.playbackRate = playbackRate
    }

    const handleVolumeChange = (value: number[]) => {
        if (!videoRef.current) return
        const newVolume = value[0]
        videoRef.current.volume = newVolume
        setVolume(newVolume)
        setIsMuted(newVolume === 0)
    }

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = Math.floor(seconds % 60)
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
    }

    if (videoLoading || progressLoading) {
        return <VideoPlayerSkeleton />
    }

    if (videoError || !video) {
        return (
            <div className="flex items-center justify-center min-h-[400px] bg-card rounded-lg">
                <p className="text-muted-foreground">{videoError ? "Error loading video" : "Video not found"}</p>
            </div>
        )
    }

    return (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 space-y-6 bg-inherit">
            <div ref={containerRef} className="relative bg-black rounded-xl overflow-hidden shadow-2xl group mx-auto">
                <video
                    ref={videoRef}
                    className="w-full aspect-video object-contain mx-auto block"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onPlay={handlePlaying}
                    onPause={handlePause}
                    poster={video.thumbnailUrl}
                    preload="metadata"
                    playsInline
                    onLoadStart={handleLoadStart}
                    onLoadedData={handleLoadedData}
                    onCanPlay={handleCanPlay}
                    onWaiting={handleWaiting}
                    onPlaying={handlePlaying}
                    onSeeking={handleSeeking}
                    onSeeked={handleSeeked}
                >
                    <source src={`${apiUrl}/videos/stream/${video.key.split("/").pop()}`} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>

                {(bufferingState.isBuffering || bufferingState.isLoading) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="h-8 w-8 md:h-12 md:w-12 text-white animate-spin" />
                            <p className="text-white text-sm md:text-base font-medium">
                                {bufferingState.isLoading ? "Loading video..." : "Buffering..."}
                            </p>
                        </div>
                    </div>
                )}

                <div
                    className={`absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"
                        }`}
                >
                    {/* Center play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Button
                            variant="ghost"
                            size="lg"
                            onClick={togglePlay}
                            data-controls="true"
                            disabled={bufferingState.isBuffering || bufferingState.isLoading}
                            className="bg-black/50 hover:bg-black/70 text-white border-2 border-white/20 rounded-full p-4 md:p-6 transition-all duration-200 hover:scale-110 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPlaying ? (
                                <Pause className="h-6 w-6 md:h-8 md:w-8" />
                            ) : (
                                <Play className="h-6 w-6 md:h-8 md:w-8 ml-1" />
                            )}
                        </Button>
                    </div>

                    {/* Bottom controls */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 md:p-6 space-y-3 md:space-y-4" data-controls="true">
                        {/* Progress bar */}
                        <div className="space-y-2">
                            <div className="py-2">
                                <Slider
                                    value={[currentTime]}
                                    max={videoRef.current?.duration ?? duration}
                                    step={0.1}
                                    onValueChange={handleSeek}
                                    disabled={bufferingState.isBuffering || bufferingState.isLoading}
                                    className="w-full [&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 md:[&_[role=slider]]:h-4 md:[&_[role=slider]]:w-4 [&_.bg-primary]:bg-primary touch-manipulation"
                                />
                            </div>

                            <div className="flex items-center justify-between text-white text-xs md:text-sm">
                                <span>
                                    {formatTime(currentTime)} / {formatTime(videoRef.current?.duration ?? duration)}
                                </span>
                                <div className="flex items-center gap-2">
                                    {bufferingState.isBuffering && (
                                        <Badge
                                            variant="secondary"
                                            className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs"
                                        >
                                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                            <span className="hidden sm:inline">Buffering</span>
                                        </Badge>
                                    )}
                                    {progress.watched && (
                                        <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                            <Eye className="mr-1 h-3 w-3" />
                                            <span className="hidden sm:inline">Watched</span>
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Mobile controls - simplified layout */}
                        <div className="md:hidden">
                            <div className="flex items-center justify-between mb-4">
                                {/* Primary controls */}
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={rewind}
                                        className="text-white hover:text-white hover:bg-white/20 p-2 touch-manipulation"
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={togglePlay}
                                        className="text-white hover:text-white hover:bg-primary/20 bg-primary/10 p-2 mx-1 touch-manipulation"
                                    >
                                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={fastForward}
                                        className="text-white hover:text-white hover:bg-white/20 p-2 touch-manipulation"
                                    >
                                        <SkipForward className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Secondary controls */}
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={toggleLike}
                                        className={`text-white hover:text-white hover:bg-white/20 p-2 touch-manipulation ${progress.liked ? "text-red-400" : ""}`}
                                    >
                                        <Heart className={`h-4 w-4 ${progress.liked ? "fill-current" : ""}`} />
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={toggleFullscreen}
                                        className="text-white hover:text-white hover:bg-white/20 p-2 touch-manipulation"
                                    >
                                        {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                                    </Button>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-white hover:text-white hover:bg-white/20 p-2 touch-manipulation"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="bg-card border-border w-48" align="end">
                                            <DropdownMenuItem
                                                onClick={goToPreviousVideo}
                                                disabled={playlist.length === 0 || currentVideoIndex === 0}
                                                className="text-sm"
                                            >
                                                <SkipBack className="h-4 w-4 mr-2" />
                                                Previous
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={goToNextVideo}
                                                disabled={playlist.length === 0 || currentVideoIndex === playlist.length - 1}
                                                className="text-sm"
                                            >
                                                <SkipForward className="h-4 w-4 mr-2" />
                                                Next
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={toggleMute} className="text-sm">
                                                {isMuted || volume === 0 ? (
                                                    <VolumeX className="h-4 w-4 mr-2" />
                                                ) : (
                                                    <Volume2 className="h-4 w-4 mr-2" />
                                                )}
                                                {isMuted || volume === 0 ? "Unmute" : "Mute"}
                                            </DropdownMenuItem>
                                            <div className="px-2 py-1 text-xs text-muted-foreground border-t">Speed</div>
                                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                                                <DropdownMenuItem
                                                    key={speed}
                                                    onClick={() => changePlaybackSpeed(speed)}
                                                    className={`text-sm pl-6 ${playbackRate === speed ? "bg-accent" : ""}`}
                                                >
                                                    {speed}x
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 bg-black/30 rounded-lg p-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={toggleMute}
                                    className="text-white hover:text-white hover:bg-white/20 p-2 touch-manipulation flex-shrink-0"
                                >
                                    {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                                </Button>
                                <div className="flex-1 min-w-0">
                                    <Slider
                                        value={[isMuted ? 0 : volume]}
                                        max={1}
                                        step={0.1}
                                        onValueChange={handleVolumeChange}
                                        className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-white [&_[role=slider]]:h-4 [&_[role=slider]]:w-4 touch-manipulation"
                                    />
                                </div>
                                <span className="text-white text-xs min-w-[2rem] text-right">
                                    {Math.round((isMuted ? 0 : volume) * 100)}%
                                </span>
                            </div>
                        </div>

                        {/* Desktop controls - original layout */}
                        <div className="hidden md:flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {/* Previous video */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={goToPreviousVideo}
                                    disabled={playlist.length === 0 || currentVideoIndex === 0}
                                    className="text-white hover:text-white hover:bg-white/20 disabled:opacity-50"
                                >
                                    <SkipBack className="h-5 w-5" />
                                </Button>

                                {/* Rewind */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={rewind}
                                    className="text-white hover:text-white hover:bg-white/20"
                                >
                                    <RotateCcw className="h-5 w-5" />
                                </Button>

                                {/* Play/Pause */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={togglePlay}
                                    className="text-white hover:text-white hover:bg-primary/20 bg-primary/10"
                                >
                                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                                </Button>

                                {/* Fast forward */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={fastForward}
                                    className="text-white hover:text-white hover:bg-white/20"
                                >
                                    <SkipForward className="h-5 w-5" />
                                </Button>

                                {/* Next video */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={goToNextVideo}
                                    disabled={playlist.length === 0 || currentVideoIndex === playlist.length - 1}
                                    className="text-white hover:text-white hover:bg-white/20 disabled:opacity-50"
                                >
                                    <SkipForward className="h-5 w-5" />
                                </Button>

                                {/* Volume controls */}
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={toggleMute}
                                        className="text-white hover:text-white hover:bg-white/20"
                                    >
                                        {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                                    </Button>

                                    <div className="w-24">
                                        <Slider
                                            value={[isMuted ? 0 : volume]}
                                            max={1}
                                            step={0.1}
                                            onValueChange={handleVolumeChange}
                                            className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-white [&_[role=slider]]:h-3 [&_[role=slider]]:w-3"
                                        />
                                    </div>
                                </div>

                                {/* Like button */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={toggleLike}
                                    className={`text-white hover:text-white hover:bg-white/20 ${progress.liked ? "text-red-400" : ""}`}
                                >
                                    <Heart className={`h-5 w-5 ${progress.liked ? "fill-current" : ""}`} />
                                </Button>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Speed control */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="text-white hover:text-white hover:bg-white/20">
                                            <Settings className="h-4 w-4 mr-1" />
                                            {playbackRate}x
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="bg-card border-border">
                                        {playbackSpeeds.map((speed) => (
                                            <DropdownMenuItem
                                                key={speed}
                                                onClick={() => changePlaybackSpeed(speed)}
                                                className={`${playbackRate === speed ? "bg-accent" : ""}`}
                                            >
                                                {speed}x
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {/* Fullscreen */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={toggleFullscreen}
                                    className="text-white hover:text-white hover:bg-white/20"
                                >
                                    {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
