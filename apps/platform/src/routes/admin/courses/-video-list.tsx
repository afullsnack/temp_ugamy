'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Play, Clock, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { Link } from '@tanstack/react-router'

interface Video {
  id: number
  course_id: number
  title: string
  description: string
  video_url: string
  thumbnail_url: string
  duration: number
  order_index: number
  is_published: boolean
  created_at: string
}

interface VideoListProps {
  courseId: string
}

export function VideoList({ courseId }: VideoListProps) {
  const [videos, setVideos] = useState<Array<Video>>([])
  const [loading, setLoading] = useState(true)
  const [courseName, setCourseName] = useState('')

  useEffect(() => {
    fetchVideos()
    fetchCourseInfo()
  }, [courseId])

  const fetchVideos = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}/videos`)
      if (response.ok) {
        const data = await response.json()
        setVideos(data)
      }
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to load videos',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCourseInfo = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}`)
      if (response.ok) {
        const course = await response.json()
        setCourseName(course.title)
      }
    } catch (error) {
      // Silently fail - course name is not critical
    }
  }

  const deleteVideo = async (id: number) => {
    if (!confirm('Are you sure you want to delete this video?')) return

    try {
      const response = await fetch(`/api/videos/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setVideos(videos.filter((video) => video.id !== id))
        toast.success('Success', {
          description: 'Video deleted successfully',
        })
      }
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to delete video',
      })
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (loading) {
    return <div className="text-center py-8">Loading videos...</div>
  }

  return (
    <div className="space-y-6">
      {courseName && (
        <div className="bg-muted/50 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Course: {courseName}</h2>
          <p className="text-sm text-muted-foreground">
            {videos.length} video{videos.length !== 1 ? 's' : ''} in this course
          </p>
        </div>
      )}

      {videos.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Play className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              No videos found for this course
            </p>
            <Link to={`/admin/courses/${courseId}/videos/new`}>
              <Button>Add Your First Video</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {videos
            .sort((a, b) => a.order_index - b.order_index)
            .map((video) => (
              <Card key={video.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-32 h-20 bg-muted rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={
                          video.thumbnail_url ||
                          '/placeholder.svg?height=80&width=128'
                        }
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">
                            {video.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {video.description}
                          </p>
                        </div>
                        <Badge
                          variant={video.is_published ? 'default' : 'secondary'}
                          className="ml-2"
                        >
                          {video.is_published ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDuration(video.duration)}
                        </div>
                        <div className="flex items-center gap-1">
                          <span>Order: {video.order_index}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          to={`/courses/${courseId}/videos/${video.id}/watch`}
                        >
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                          </Button>
                        </Link>
                        <Link
                          to={`/courses/${courseId}/videos/${video.id}/edit`}
                        >
                          <Button variant="outline" size="sm">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteVideo(video.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  )
}
