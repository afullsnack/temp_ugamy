'use client'

import type React from 'react'

import { useState, useEffect } from 'react'
import { useRouter } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface VideoFormProps {
  courseId: string
  videoId?: string
}

interface VideoData {
  title: string
  description: string
  video_url: string
  thumbnail_url: string
  duration: string
  order_index: string
  is_published: boolean
}

export function VideoForm({ courseId, videoId }: VideoFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<VideoData>({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    duration: '0',
    order_index: '1',
    is_published: false,
  })

  useEffect(() => {
    if (videoId) {
      fetchVideoData(videoId)
    }
  }, [videoId])

  const fetchVideoData = async (id: string) => {
    try {
      const response = await fetch(`/api/videos/${id}`)
      if (response.ok) {
        const video = await response.json()
        setFormData({
          title: video.title || '',
          description: video.description || '',
          video_url: video.video_url || '',
          thumbnail_url: video.thumbnail_url || '',
          duration: video.duration?.toString() || '0',
          order_index: video.order_index?.toString() || '1',
          is_published: video.is_published || false,
        })
      }
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to load video data',
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = videoId ? `/api/videos/${videoId}` : '/api/videos'
      const method = videoId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          course_id: Number.parseInt(courseId),
          duration: Number.parseInt(formData.duration),
          order_index: Number.parseInt(formData.order_index),
        }),
      })

      if (response.ok) {
        toast.success('Success', {
          description: `Video ${videoId ? 'updated' : 'created'} successfully`,
        })
        router.navigate({ to: `/courses/${courseId}/videos` })
      } else {
        throw new Error('Failed to save video')
      }
    } catch (error) {
      toast('Error', {
        description: `Failed to ${videoId ? 'update' : 'create'} video`,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (
    field: keyof VideoData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{videoId ? 'Edit Video' : 'Add New Video'}</CardTitle>
        <CardDescription>
          {videoId
            ? 'Update video information'
            : 'Fill in the details to add a new video to the course'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Video Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter video title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter video description"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="video_url">Video URL</Label>
            <Input
              id="video_url"
              value={formData.video_url}
              onChange={(e) => handleInputChange('video_url', e.target.value)}
              placeholder="Enter video URL (e.g., YouTube, Vimeo, or direct link)"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
            <Input
              id="thumbnail_url"
              value={formData.thumbnail_url}
              onChange={(e) =>
                handleInputChange('thumbnail_url', e.target.value)
              }
              placeholder="Enter thumbnail image URL"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Input
                id="duration"
                type="number"
                min="0"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                placeholder="0"
              />
              {Number.parseInt(formData.duration) > 0 && (
                <p className="text-xs text-muted-foreground">
                  Duration: {formatDuration(Number.parseInt(formData.duration))}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="order_index">Order</Label>
              <Input
                id="order_index"
                type="number"
                min="1"
                value={formData.order_index}
                onChange={(e) =>
                  handleInputChange('order_index', e.target.value)
                }
                placeholder="1"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_published"
              checked={formData.is_published}
              onCheckedChange={(checked) =>
                handleInputChange('is_published', checked)
              }
            />
            <Label htmlFor="is_published">Publish Video</Label>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {videoId ? 'Update Video' : 'Add Video'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.navigate({ to: `/courses/${courseId}/videos` })
              }
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
