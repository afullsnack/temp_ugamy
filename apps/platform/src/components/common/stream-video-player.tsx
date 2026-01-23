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
    Eye,
    SkipBack,
    SkipForward,
    RotateCcw,
    Settings,
    Maximize,
    Minimize,
    Loader2,
} from "lucide-react"
import { env } from "@/env"
import LikeVideoWidget from "./like video-widget"
import VideoWatermark from "./video-watermark"
import type { IGetVideoByIdResponse } from "@/lib/types"

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
    loadingPercentage: number
    bufferingPercentage: number
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
        loadingPercentage: 0,
        bufferingPercentage: 0,
    })

    // Security protection state
    const [isProtectionActive, setIsProtectionActive] = useState(false)
    const [protectionReason, setProtectionReason] = useState("")

    const videoRef = useRef<HTMLVideoElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const progressUpdateRef = useRef<NodeJS.Timeout>(null)
    const controlsTimeoutRef = useRef<NodeJS.Timeout>(null)
    const wasPlayingBeforeProtection = useRef(false)

    const apiUrl = env.VITE_API_URL
    const playbackSpeeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

    const queryClient = useQueryClient()
    const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent)


    // Get Video by Id
    const {
        data: video,
        isLoading: videoLoading,
        error: videoError,
    } = useQuery({
        queryKey: ["video", videoId],
        queryFn: async (): Promise<IGetVideoByIdResponse> => {
            const response = await fetch(`${apiUrl}/videos/${videoId}`, {
                credentials: "include",
            })
            if (!response.ok) {
                throw new Error("Failed to fetch video")
            }
            return response.json()
        },
    })

    // Get Video progress
    const { data: progressData, isLoading: progressLoading } = useQuery({
        queryKey: ["video-progress", videoId, userId],
        queryFn: async () => {
            const response = await fetch(`/api/videos/${videoId}/progress?userId=${userId}`, {
                credentials: "include",
            })
            if (!response.ok) {
                // Progress not found is okay - user hasn't watched yet
                return { watched: false, liked: false, watch_time: 0 }
            }
            return response.json()
        },
    })

    // Update video progress
    const updateProgressMutation = useMutation({
        mutationFn: async (progressUpdate: Partial<VideoProgress>) => {
            const response = await fetch(`/api/videos/${videoId}/progress`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
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
        onSuccess: (_data, variables) => {
            setProgress((prev) => ({ ...prev, ...variables }))
            queryClient.invalidateQueries({ queryKey: ["video-progress", videoId, userId] })
        },
        onError: () => {
            // Silently fail - progress tracking is not critical
        },
    })

    const handleLoadStart = () => {
        setBufferingState((prev) => ({
            ...prev,
            isLoading: true,
            canPlay: false,
            loadingPercentage: 0,
        }))
    }

    const handleLoadedData = () => {
        setBufferingState((prev) => ({
            ...prev,
            isLoading: false,
            loadingPercentage: 100,
        }))
    }

    const handleCanPlay = () => {
        setBufferingState((prev) => ({
            ...prev,
            canPlay: true,
            isBuffering: false,
            loadingPercentage: 100,
        }))
    }

    const handleWaiting = () => {
        setBufferingState((prev) => ({
            ...prev,
            isBuffering: true,
            bufferingPercentage: 0,
        }))
    }

    const handlePlaying = () => {
        setBufferingState((prev) => ({
            ...prev,
            isBuffering: false,
            hasStarted: true,
            canPlay: true,
            bufferingPercentage: 100,
        }))
        setIsPlaying(true)
    }

    const handlePause = () => {
        setIsPlaying(false)
    }

    const handleSeeking = () => {
        setBufferingState((prev) => ({
            ...prev,
            isBuffering: true,
            bufferingPercentage: 0,
        }))
    }

    const handleSeeked = () => {
        setBufferingState((prev) => ({
            ...prev,
            isBuffering: false,
            bufferingPercentage: 100,
        }))
    }

    const handleProgress = () => {
        if (!videoRef.current) return

        const video = videoRef.current
        const duration = video.duration

        if (duration > 0) {
            // Calculate loading percentage based on buffered ranges
            let bufferedEnd = 0
            let totalBuffered = 0

            // Find the buffered range that contains current time
            for (let i = 0; i < video.buffered.length; i++) {
                totalBuffered += video.buffered.end(i) - video.buffered.start(i)
                if (video.buffered.start(i) <= video.currentTime && video.currentTime <= video.buffered.end(i)) {
                    bufferedEnd = video.buffered.end(i)
                }
            }

            // Calculate both loading percentages
            const currentBufferPercentage = Math.round((bufferedEnd / duration) * 100)
            const totalLoadingPercentage = video.buffered.length > 0 ? Math.round((totalBuffered / duration) * 100) : 0

            // Use the higher of the two calculations
            const loadingPercentage = Math.max(currentBufferPercentage, totalLoadingPercentage)

            // Update buffering percentage based on current playback position
            const bufferingPercentage = video.currentTime <= bufferedEnd ? 100 : 0

            setBufferingState((prev) => ({
                ...prev,
                loadingPercentage: Math.min(100, Math.max(prev.loadingPercentage, loadingPercentage)),
                bufferingPercentage: bufferingPercentage,
            }))
        }
    }

    // Helper function to activate protection and pause video
    const activateProtection = useCallback((reason: string) => {
        // Store if video was playing before protection
        if (videoRef.current && !videoRef.current.paused) {
            wasPlayingBeforeProtection.current = true
            videoRef.current.pause()
        }
        setIsProtectionActive(true)
        setProtectionReason(reason)
    }, [])

    // Helper function to deactivate protection
    const deactivateProtection = useCallback(() => {
        setIsProtectionActive(false)
        setProtectionReason("")
        // Resume playback if it was playing before protection
        if (wasPlayingBeforeProtection.current && videoRef.current) {
            videoRef.current.play()
            wasPlayingBeforeProtection.current = false
        }
    }, [])

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

            // Check for blocked screenshot/recording shortcuts
            const isBlocked =
                event.key === "PrintScreen" ||
                (event.metaKey && event.shiftKey && (event.key === "S" || event.key === "s")) ||
                (event.ctrlKey && event.shiftKey && (event.key === "S" || event.key === "s")) ||
                (event.metaKey && event.shiftKey && ["3", "4", "5", "6"].includes(event.key)) ||
                event.key === "F12" ||
                (event.ctrlKey && event.shiftKey && (event.key === "I" || event.key === "i")) ||
                (event.ctrlKey && event.shiftKey && (event.key === "J" || event.key === "j")) ||
                (event.ctrlKey && (event.key === "u" || event.key === "U")) ||
                (event.metaKey && event.altKey && (event.key === "i" || event.key === "I")) ||
                (event.metaKey && event.altKey && (event.key === "j" || event.key === "J"))

            if (isBlocked) {
                event.preventDefault()
                event.stopPropagation()
                activateProtection("Screenshot or recording shortcut detected")
                return
            }

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
        [isPlaying, volume, playbackRate, duration, playbackSpeeds, videoRef],
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
        const totalDuration = Math.floor(videoRef.current.duration || 0) ?? 0
        const watchedPercentage = totalDuration > 0 ? (watchTime / totalDuration) * 100 : 0
        const isWatched = watchedPercentage >= 80

        updateProgressMutation.mutate({
            watch_time: watchTime,
            watched: isWatched,
        })
    }

    // const toggleLike = async () => {
    //     const newLikedState = !progress.liked
    //     updateProgressMutation.mutate({ liked: newLikedState })

    //     toast.info(newLikedState ? "Video liked!" : "Like removed", {
    //         description: newLikedState ? "Added to your liked videos" : "Removed from liked videos",
    //     })
    // }

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
        return minutes || remainingSeconds ? `${minutes}:${remainingSeconds.toString().padStart(2, "0")}` : "0:00"
    }

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }

        document.addEventListener("fullscreenchange", handleFullscreenChange)

        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange)
        }
    }, [])

    // Security: Monitor visibility, focus, and context menu
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden") {
                activateProtection("Tab switched or screen sharing detected")
            }
        }

        const handleBlur = () => {
            activateProtection("Window focus lost - possible screen recording")
        }

        const handleContextMenu = (e: Event) => {
            e.preventDefault()
        }

        document.addEventListener("visibilitychange", handleVisibilityChange)
        if (!isiOS) {
            window.addEventListener("blur", handleBlur)
          }        
        document.addEventListener("contextmenu", handleContextMenu)

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange)
            window.removeEventListener("blur", handleBlur)
            document.removeEventListener("contextmenu", handleContextMenu)
        }
    }, [activateProtection])

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
        <div className="w-full max-w-6xl mx-auto lg:px-4 sm:px-6 space-y-6 bg-inherit">
            <div
                ref={containerRef}
                className="relative bg-black rounded-xl overflow-hidden shadow-2xl group mx-auto"
                style={{
                    userSelect: "none",
                    WebkitUserSelect: "none",
                    MozUserSelect: "none",
                    msUserSelect: "none",
                    WebkitTouchCallout: "none",
                }}
            >
                {/* Protection Overlay */}
                {isProtectionActive && (
                    <div className="absolute inset-0 bg-black z-50 flex items-center justify-center">
                        <div className="text-white text-center max-w-md px-6">
                            <div className="text-3xl mb-4">🔒</div>
                            <p className="text-xl mb-2 font-semibold">Content Protected</p>
                            <p className="text-sm opacity-75 mb-4">{protectionReason}</p>
                            <p className="text-xs opacity-60 mb-6">
                                Please return to this tab and click continue to resume watching.
                            </p>
                            <button
                                onClick={deactivateProtection}
                                className="px-6 py-3 rounded-lg bg-primary hover:bg-primary/90 text-white cursor-pointer transition-all duration-200 font-medium"
                            >
                                Continue Watching
                            </button>
                        </div>
                    </div>
                )}

                <video
                    ref={videoRef}
                    className={`w-full min-h-[400px] aspect-video object-contain mx-auto block ${isFullscreen ? "h-screen w-screen object-contain" : ""
                        }`}
                    style={{
                        pointerEvents: isProtectionActive ? "none" : "auto",
                    }}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onPlay={handlePlaying}
                    onPause={handlePause}
                    poster={video.thumbnailUrl}
                    preload="auto"
                    loop
                    autoplay
                    playsinline
                    onCanPlay={handleCanPlay}
                    onWaiting={handleWaiting}
                    onPlaying={handlePlaying}
                    onSeeking={handleSeeking}
                    onSeeked={handleSeeked}
                    onProgress={handleProgress}
                    onContextMenu={(e) => e.preventDefault()}
                    onDragStart={(e) => e.preventDefault()}
                    controls={isiOS}
                >
                    <source src={`${apiUrl}/videos/stream/${video.key.split("/").pop()}`} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>

                {/* Watermark */}
                <VideoWatermark />

                {(bufferingState.isBuffering || bufferingState.isLoading) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-4 bg-black/70 rounded-lg p-6 min-w-[200px]">
                            <Loader2 className="h-8 w-8 md:h-12 md:w-12 text-white animate-spin" />

                            <div className="text-center space-y-2">
                                <p className="text-white text-sm md:text-base font-medium">
                                    {bufferingState.isLoading ? "Loading video..." : "Buffering..."}
                                </p>

                                {/* Loading percentage display */}
                                {bufferingState.isLoading && (
                                    <div className="space-y-2">
                                        <div className="text-white text-xs md:text-sm opacity-80">
                                            {bufferingState.loadingPercentage}% loaded
                                        </div>
                                        <div className="w-32 md:w-40 bg-white/20 rounded-full h-1.5">
                                            <div
                                                className="bg-white rounded-full h-1.5 transition-all duration-300 ease-out"
                                                style={{ width: `${bufferingState.loadingPercentage}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Buffering percentage display */}
                                {bufferingState.isBuffering && !bufferingState.isLoading && (
                                    <div className="space-y-2">
                                        <div className="text-white text-xs md:text-sm opacity-80">
                                            {bufferingState.bufferingPercentage}% buffered
                                        </div>
                                        <div className="w-32 md:w-40 bg-white/20 rounded-full h-1.5">
                                            <div
                                                className="bg-blue-400 rounded-full h-1.5 transition-all duration-300 ease-out"
                                                style={{ width: `${bufferingState.bufferingPercentage}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div
                    className={`absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"
                        }`}
                >
                    {/* Center play button overlay */}
                    {/* <div className="absolute inset-0 flex items-center justify-center">
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
                    </div> */}

                    {/* Bottom controls */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 md:p-6 space-y-3 md:space-y-4" data-controls="true">
                        <div className="md:hidden">
                            {/* Row 1: Primary playback controls */}
                            <div className="flex items-center justify-center gap-4 mb-3">
                                {/* Rewind */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={rewind}
                                    className={`text-white hover:text-white hover:bg-white/20 p-3 touch-manipulation transition-opacity ${bufferingState.isLoading ? "opacity-0 pointer-events-none" : "opacity-100"
                                        }`}
                                >
                                    <RotateCcw className="h-5 w-5" />
                                </Button>

                                {/* Pause / play */}
                                <Button
                                    variant="ghost"
                                    size="lg"
                                    onClick={togglePlay}
                                    className={`text-white hover:text-white hover:bg-primary/20 bg-primary/10 p-4 touch-manipulation transition-opacity ${bufferingState.isLoading ? "opacity-0 pointer-events-none" : "opacity-100"
                                        }`}
                                >
                                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                                </Button>

                                {/* Fast forward */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={fastForward}
                                    className={`text-white hover:text-white hover:bg-white/20 p-3 touch-manipulation transition-opacity ${bufferingState.isLoading ? "opacity-0 pointer-events-none" : "opacity-100"
                                        }`}
                                >
                                    <SkipForward className="h-5 w-5" />
                                </Button>
                            </div>

                            {/* Row 3: Secondary controls */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <LikeVideoWidget vid={videoId} isFavourite={video?.isFavorite} />
                                </div>

                                <div className="flex items-center gap-1">
                                    {/* Settings */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="relative text-white hover:text-white hover:bg-white/20 p-1 touch-manipulation"
                                            >
                                                <Settings className="h-5 w-5" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            className={`bg-card border-border w-48 ${isFullscreen ? "z-[9999]" : "z-50"}`}
                                            align="end"
                                            side="top"
                                        >
                                            <DropdownMenuItem
                                                onClick={goToPreviousVideo}
                                                disabled={playlist.length === 0 || currentVideoIndex === 0}
                                                className="text-sm py-3"
                                            >
                                                <SkipBack className="h-4 w-4 mr-2" />
                                                Previous Video
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={goToNextVideo}
                                                disabled={playlist.length === 0 || currentVideoIndex === playlist.length - 1}
                                                className="text-sm py-3"
                                            >
                                                <SkipForward className="h-4 w-4 mr-2" />
                                                Next Video
                                            </DropdownMenuItem>
                                            <div className="px-2 py-2 text-xs text-muted-foreground border-t font-medium">Playback Speed</div>
                                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                                                <DropdownMenuItem
                                                    key={speed}
                                                    onClick={() => changePlaybackSpeed(speed)}
                                                    className={`text-sm pl-6 py-2 ${playbackRate === speed ? "bg-accent" : ""}`}
                                                >
                                                    {speed}x {speed === 1 ? "(Normal)" : ""}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    {/* Toggle full screen */}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={toggleFullscreen}
                                        className="text-white hover:text-white hover:bg-white/20 p-1 touch-manipulation"
                                    >
                                        {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Desktop controls - original layout with z-index fix */}
                        <div className="hidden md:flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {/* Previous video */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={goToPreviousVideo}
                                    disabled={playlist.length === 0 || currentVideoIndex === 0 || bufferingState.isLoading}
                                    className="text-white hover:text-white hover:bg-white/20 disabled:opacity-50"
                                >
                                    <SkipBack className="h-5 w-5" />
                                </Button>

                                {/* Rewind */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={rewind}
                                    disabled={bufferingState.isLoading}
                                    className="text-white hover:text-white hover:bg-white/20 disabled:opacity-50"
                                >
                                    <RotateCcw className="h-5 w-5" />
                                </Button>

                                {/* Play/Pause */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={togglePlay}
                                    disabled={bufferingState.isLoading}
                                    className="text-white hover:text-white hover:bg-primary/20 bg-primary/10 disabled:opacity-50"
                                >
                                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                                </Button>

                                {/* Fast forward */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={fastForward}
                                    disabled={bufferingState.isLoading}
                                    className="text-white hover:text-white hover:bg-white/20 disabled:opacity-50"
                                >
                                    <SkipForward className="h-5 w-5" />
                                </Button>

                                {/* Next video */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={goToNextVideo}
                                    disabled={
                                        playlist.length === 0 || currentVideoIndex === playlist.length - 1 || bufferingState.isLoading
                                    }
                                    className="text-white hover:text-white hover:bg-white/20 disabled:opacity-50"
                                >
                                    <SkipForward className="h-5 w-5" />
                                </Button>

                                {/* Like button */}
                                <LikeVideoWidget vid={videoId} isFavourite={video?.isFavorite} />
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Corner volume control */}
                                <div
                                    className="flex items-center gap-2 bg-black/1 backdrop-blur-sm rounded-lg p-2"
                                    data-controls="true"
                                >
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={toggleMute}
                                        className="text-white hover:text-white hover:bg-white/20 p-1.5 touch-manipulation flex-shrink-0"
                                    >
                                        {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                                    </Button>
                                    <div className="w-16 md:w-20 min-w-0">
                                        <Slider
                                            value={[isMuted ? 0 : volume]}
                                            max={1}
                                            step={0.1}
                                            onValueChange={handleVolumeChange}
                                            className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-white [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 touch-manipulation"
                                        />
                                    </div>
                                    <span className="text-white text-xs min-w-[2rem] text-right font-medium">
                                        {Math.round((isMuted ? 0 : volume) * 100)}%
                                    </span>
                                </div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="text-white hover:text-white hover:bg-white/20">
                                            <Settings className="h-4 w-4 mr-1" />
                                            {playbackRate}x
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className={`bg-card border-border ${isFullscreen ? "z-[9999]" : "z-50"}`}>
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
                                            <span className="hidden sm:inline">
                                                Buffering{" "}
                                                {bufferingState.bufferingPercentage > 0 ? `${bufferingState.bufferingPercentage}%` : ""}
                                            </span>
                                            <span className="sm:hidden">Buf</span>
                                        </Badge>
                                    )}
                                    {bufferingState.isLoading && (
                                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                            <span className="hidden sm:inline">Loading {bufferingState.loadingPercentage}%</span>
                                            <span className="sm:hidden">{bufferingState.loadingPercentage}%</span>
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
                    </div>
                </div>
            </div>
        </div>
    )
}
