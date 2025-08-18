"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Heart,
    Clock,
    Eye,
    SkipBack,
    SkipForward,
    RotateCcw,
    Settings,
    Maximize,
    Minimize,
} from "lucide-react"
import { env } from "@/env"

interface VideoPlayerProps {
    courseId: string
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

export const StreamVideoPlayer = ({ courseId, videoId, playlist = [] }: VideoPlayerProps) => {
    const [video, setVideo] = useState<Video | null>(null)
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
    const [loading, setLoading] = useState(true)
    const [playbackRate, setPlaybackRate] = useState(1)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [showControls, setShowControls] = useState(true)
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0)

    const videoRef = useRef<HTMLVideoElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const progressUpdateRef = useRef<NodeJS.Timeout>(null)
    const controlsTimeoutRef = useRef<NodeJS.Timeout>(null)

    // Mock user ID - in a real app, this would come from authentication
    const userId = "user123"

    const apiUrl = env.VITE_API_URL

    const playbackSpeeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

    useEffect(() => {
        fetchVideo()
        fetchProgress()

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
    }, [videoId])

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
        const handleMouseMove = () => {
            setShowControls(true)
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current)
            }
            if (isPlaying) {
                controlsTimeoutRef.current = setTimeout(() => {
                    setShowControls(false)
                }, 3000)
            }
        }

        const container = containerRef.current
        if (container) {
            container.addEventListener("mousemove", handleMouseMove)
            container.addEventListener("mouseleave", () => {
                if (isPlaying) setShowControls(false)
            })
        }

        return () => {
            if (container) {
                container.removeEventListener("mousemove", handleMouseMove)
                container.removeEventListener("mouseleave", () => {
                    if (isPlaying) setShowControls(false)
                })
            }
        }
    }, [isPlaying])

    const fetchVideo = async () => {
        try {
            const response = await fetch(`${apiUrl}/videos/${videoId}`)
            if (response.ok) {
                const videoData = await response.json()
                setVideo(videoData)
            }
        } catch (error) {
            toast.error("Error", {
                description: "Failed to load video",
            })
        } finally {
            setLoading(false)
        }
    }

    const fetchProgress = async () => {
        try {
            const response = await fetch(`/api/videos/${videoId}/progress?userId=${userId}`)
            if (response.ok) {
                const progressData = await response.json()
                setProgress(progressData)
            }
        } catch (error) {
            // Progress not found is okay - user hasn't watched yet
        }
    }

    const updateWatchProgress = async () => {
        if (!videoRef.current) return

        const watchTime = Math.floor(videoRef.current.currentTime)
        const totalDuration = Math.floor(videoRef.current.duration || 0)
        const watchedPercentage = totalDuration > 0 ? (watchTime / totalDuration) * 100 : 0
        const isWatched = watchedPercentage >= 80

        try {
            await fetch(`/api/videos/${videoId}/progress`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId,
                    watch_time: watchTime,
                    watched: isWatched,
                    liked: progress.liked,
                }),
            })

            setProgress((prev) => ({
                ...prev,
                watch_time: watchTime,
                watched: isWatched,
            }))
        } catch (error) {
            // Silently fail - progress tracking is not critical
        }
    }

    const toggleLike = async () => {
        try {
            const newLikedState = !progress.liked
            await fetch(`/api/videos/${videoId}/progress`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId,
                    watch_time: progress.watch_time,
                    watched: progress.watched,
                    liked: newLikedState,
                }),
            })

            setProgress((prev) => ({
                ...prev,
                liked: newLikedState,
            }))

            toast.info(newLikedState ? "Video liked!" : "Like removed", {
                description: newLikedState ? "Added to your liked videos" : "Removed from liked videos",
            })
        } catch (error) {
            toast.error("Error", {
                description: "Failed to update like status",
            })
        }
    }

    const togglePlay = () => {
        if (!videoRef.current) return

        if (isPlaying) {
            videoRef.current.pause()
        } else {
            videoRef.current.play()
        }
        setIsPlaying(!isPlaying)
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px] bg-card rounded-lg">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground">Loading video...</p>
                </div>
            </div>
        )
    }

    if (!video) {
        return (
            <div className="flex items-center justify-center min-h-[400px] bg-card rounded-lg">
                <p className="text-muted-foreground">Video not found</p>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 bg-background">
            <div ref={containerRef} className="relative bg-black rounded-xl overflow-hidden shadow-2xl group">
                <video
                    ref={videoRef}
                    className="w-full aspect-video"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    poster={video.thumbnailUrl}
                    onClick={togglePlay}
                >
                    <source src={`${apiUrl}/videos/stream/${video.key.split("/").pop()}`} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>

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
                            className="bg-black/50 hover:bg-black/70 text-white border-2 border-white/20 rounded-full p-6 transition-all duration-200 hover:scale-110"
                        >
                            {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
                        </Button>
                    </div>

                    {/* Bottom controls */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
                        {/* Progress bar */}
                        <div className="space-y-2">
                            <Slider
                                value={[currentTime]}
                                max={videoRef.current?.duration ?? duration}
                                step={0.1}
                                onValueChange={handleSeek}
                                className="w-full [&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary [&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_.bg-primary]:bg-primary"
                            />

                            <div className="flex items-center justify-between text-white text-sm">
                                <span>
                                    {formatTime(currentTime)} / {formatTime(videoRef.current?.duration ?? duration)}
                                </span>
                                <div className="flex items-center gap-2">
                                    {progress.watched && (
                                        <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                                            <Eye className="mr-1 h-3 w-3" />
                                            Watched
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Control buttons */}
                        <div className="flex items-center justify-between">
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
