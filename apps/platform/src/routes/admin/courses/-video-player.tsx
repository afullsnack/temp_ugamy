'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { toast } from 'sonner'
import { Play, Pause, Volume2, VolumeX, Heart, Clock, Eye } from 'lucide-react'
import { env } from '@/env'

interface VideoPlayerProps {
  courseId: string
  videoId: string
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

export function VideoPlayer({ courseId, videoId }: VideoPlayerProps) {
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

  const videoRef = useRef<HTMLVideoElement>(null)
  const progressUpdateRef = useRef<NodeJS.Timeout>(null)

  // Mock user ID - in a real app, this would come from authentication
  const userId = 'user123'

  useEffect(() => {
    fetchVideo()
    fetchProgress()
    return () => {
      if (progressUpdateRef.current) {
        clearInterval(progressUpdateRef.current)
      }
    }
  }, [videoId])

  useEffect(() => {
    if (isPlaying) {
      // Update progress every 5 seconds while playing
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

  const fetchVideo = async () => {
    try {
      const response = await fetch(`${env.VITE_API_URL}/videos/${videoId}`, {
        credentials: "include"
      })
      if (response.ok) {
        const videoData = await response.json()
        setVideo(videoData)
      }
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to load video',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchProgress = async () => {
    try {
      const response = await fetch(
        `/api/videos/${videoId}/progress?userId=${userId}`,
        {credentials: "include"}
      )
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
    const watchedPercentage =
      totalDuration > 0 ? (watchTime / totalDuration) * 100 : 0
    const isWatched = watchedPercentage >= 80 // Mark as watched if 80% completed

    try {
      await fetch(`/api/videos/${videoId}/progress`, {
        method: 'POST',
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
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
        method: 'POST',
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
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

      toast.info(newLikedState ? 'Video liked!' : 'Like removed', {
        description: newLikedState
          ? 'Added to your liked videos'
          : 'Removed from liked videos',
      })
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to update like status',
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

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    setCurrentTime(videoRef.current.currentTime)
  }

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return
    setDuration(videoRef.current.duration)
  }

  const handleSeek = (value: number[]) => {
    if (!videoRef.current) return
    const newTime = value[0]
    videoRef.current.currentTime = newTime
    setCurrentTime(newTime)
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
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (loading) {
    return <div className="text-center py-8">Loading video...</div>
  }

  if (!video) {
    return <div className="text-center py-8">Video not found</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardContent className="p-0">
          <div className="relative bg-black rounded-t-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full aspect-video"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              poster={video.thumbnailUrl}
            >
              <source
                src={`${env.VITE_API_URL}/videos/stream/${video.key.split('/').pop()}`}
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>

            {/* Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="space-y-2">
                {/* Progress Bar */}
                <Slider
                  value={[currentTime]}
                  max={videoRef.current?.duration ?? duration}
                  step={1}
                  onValueChange={handleSeek}
                  className="w-full"
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={togglePlay}
                      className="text-white hover:text-white"
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMute}
                      className="text-white hover:text-white"
                    >
                      {isMuted ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>

                    <div className="w-20">
                      <Slider
                        value={[volume]}
                        max={1}
                        step={0.1}
                        onValueChange={handleVolumeChange}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="text-white text-sm">
                    {formatTime(currentTime)} /{' '}
                    {formatTime(videoRef.current?.duration ?? duration)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{video.title}</CardTitle>
                  <CardDescription className="mt-2">
                    {video.description}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {progress.watched && (
                    <Badge variant="default" className="bg-green-500">
                      <Eye className="mr-1 h-3 w-3" />
                      Watched
                    </Badge>
                  )}
                  <Button
                    variant={progress.liked ? 'default' : 'outline'}
                    size="sm"
                    onClick={toggleLike}
                    className={
                      progress.liked ? 'bg-red-500 hover:bg-red-600' : ''
                    }
                  >
                    <Heart
                      className={`mr-2 h-4 w-4 ${progress.liked ? 'fill-current' : ''}`}
                    />
                    {progress.liked ? 'Liked' : 'Like'}
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Watched: {formatTime(progress.watch_time)} /{' '}
                  {formatTime(video.duration)}
                </span>
              </div>

              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${video.duration > 0 ? (progress.watch_time / video.duration) * 100 : 0}%`,
                  }}
                />
              </div>

              <div className="text-xs text-muted-foreground">
                {video.duration > 0
                  ? `${Math.round((progress.watch_time / video.duration) * 100)}% complete`
                  : '0% complete'}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
