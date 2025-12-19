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
import { env } from '@/env'
import { useForm } from 'react-hook-form'
import z from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { formatDuration } from '@/lib/utils'

interface VideoFormProps {
  courseId: string
  videoId?: string
}

const videoFormSchema = z.object({
  video: z.instanceof(FileList),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  duration: z.number(),
})
type VideoFormData = z.infer<typeof videoFormSchema>

export function VideoForm({ courseId, videoId }: VideoFormProps) {
  const router = useRouter()

  const form = useForm<VideoFormData>({
    defaultValues: {
      video: undefined,
      title: '',
      slug: '',
      description: '',
      duration: 0,
    },
  })
  const watchTitle = form.watch('title')
  const slug = watchTitle.toLowerCase().split(' ').join('-')

  useEffect(() => {
    if (videoId) {
      fetchVideoData(videoId)
    }
  }, [videoId])

  const fetchVideoData = async (id: string) => {
    try {
      const response = await fetch(`${env.VITE_API_URL}/videos/${id}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const video = await response.json()
        return video?.data;
      }
    } catch (error) {
      console.log('Failed video fetch', error)
      toast.error('Error', {
        description: 'Failed to load video data',
      })
    }
  }

  const handleSubmit = async (values: VideoFormData) => {
    // Validation
    console.log('Values', values)
    const video = values.video[0]
    console.log('Video', video)

    if (video.type !== 'video/mp4') {
      toast.error('Error', {
        description: 'Invalid video format',
      })
      return
    }

    const formData = new FormData()
    formData.append('video', video)
    formData.append('title', values.title)
    formData.append('slug', slug)
    formData.append('description', values.description)
    // Duration is already in seconds
    formData.append('duration', values.duration.toString())

    try {
      const url = videoId ? `/videos/${videoId}` : '/videos'
      const method = videoId ? 'PUT' : 'POST'

      const response = await fetch(
        `${env.VITE_API_URL}${url}?courseId=${courseId}`,
        {
          method,
          body: formData,
          credentials: 'include',
        },
      )

      if (response.ok) {
        toast.success('Success', {
          description: `Video ${videoId ? 'updated' : 'created'} successfully`,
        })
        router.navigate({
          to: `/admin/courses/$id/videos`,
          params: { id: courseId },
        })
      } else {
        throw new Error('Failed to save video')
      }
    } catch (error) {
      toast('Error', {
        description: `Failed to ${videoId ? 'update' : 'create'} video`,
      })
    }
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
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => handleSubmit(values))}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Video Title
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter video title"
                      className="border-teal-400 focus:border-teal-500 focus:ring-teal-500"
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              disabled
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Slug
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={slug}
                      onChange={() => field.onChange(slug)}
                      placeholder="Video slug"
                      className="border-teal-400 focus:border-teal-500 focus:ring-teal-500"
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Video Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter video description"
                      className="border-teal-400 focus:border-teal-500 focus:ring-teal-500"
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Duration (seconds)
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter video duration"
                      className="border-teal-400 focus:border-teal-500 focus:ring-teal-500"
                      required
                    />
                  </FormControl>
                  {field.value > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Formatted: {formatDuration(field.value)}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="video"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Select video
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...form.register('video')}
                      type="file"
                      placeholder="Select video"
                      className="border-teal-400 focus:border-teal-500 focus:ring-teal-500"
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button type="submit" disabled={form.formState.isLoading}>
                {form.formState.isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {videoId ? 'Update Video' : 'Add Video'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  router.navigate({ to: `/admin/courses/${courseId}/videos` })
                }
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
