'use client'

import type React from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import z from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { env } from '@/env'

interface CourseFormProps {
  courseId?: string
}

interface CourseData {
  title: string
  description: string
  instructor: string
  thumbnail_url: string
  price: string
  is_published: boolean
}

const courseSchema = z.object({
  title: z.string(),
  description: z.string(),
  slug: z.string(),
})
type CourseFormData = z.infer<typeof courseSchema>

export function CourseForm({ courseId }: CourseFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CourseData>({
    title: '',
    description: '',
    instructor: '',
    thumbnail_url: '',
    price: '0.00',
    is_published: false,
  })

  useEffect(() => {
    if (courseId) {
      // Load existing course data
      // fetchCourseData(courseId)
    }
  }, [courseId])

  // const fetchCourseData = async (id: string) => {
  //   try {
  //     const response = await fetch(`/api/courses/${id}`)
  //     if (response.ok) {
  //       const course = await response.json()
  //       setFormData({
  //         title: course.title || '',
  //         description: course.description || '',
  //         instructor: course.instructor || '',
  //         thumbnail_url: course.thumbnail_url || '',
  //         price: course.price?.toString() || '0.00',
  //         is_published: course.is_published || false,
  //       })
  //     }
  //   } catch (error) {
  //     toast.error('Error', {
  //       description: 'Failed to load course data',
  //     })
  //   }
  // }

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault()
  //   setLoading(true)

  //   try {
  //     const url = courseId ? `/api/courses/${courseId}` : '/api/courses'
  //     const method = courseId ? 'PUT' : 'POST'

  //     const response = await fetch(url, {
  //       method,
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         ...formData,
  //         price: Number.parseFloat(formData.price),
  //       }),
  //     })

  //     if (response.ok) {
  //       toast.success('Success', {
  //         description: `Course ${courseId ? 'updated' : 'created'} successfully`,
  //       })
  //       router.navigate({ to: '/admin/courses' })
  //     } else {
  //       throw new Error('Failed to save course')
  //     }
  //   } catch (error) {
  //     toast.error('Error', {
  //       description: `Failed to ${courseId ? 'update' : 'create'} course`,
  //     })
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      description: '',
      slug: '',
    },
  })

  const [watchedTitle] = useWatch({
    control: form.control,
    name: ['title'],
  })

  console.log('watched', watchedTitle)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{courseId ? 'Edit Course' : 'Create New Course'}</CardTitle>
        <CardDescription>
          {courseId
            ? 'Update course information'
            : 'Fill in the details to create a new course'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(async (values) => {
              setLoading(true)
              try {
                // Call submit
                const response = await fetch(`${env.VITE_API_URL}/courses`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    ...values,
                    slug: watchedTitle.toLowerCase().split(' ').join('-'),
                    thumbnailUrl: '/course-poster.png',
                  }),
                })
                if (response.ok) {
                  const result = await response.json()
                  toast.success('Success', {
                    description: 'Course created successfully',
                  })
                  router.navigate({ to: '/admin/courses' })
                } else {
                  const error = await response.json()
                  toast.error('Error', {
                    description: error.message || 'Failed to create course',
                  })
                }
              } catch (error) {
                toast.error('Error', {
                  description: 'Failed to create course',
                })
              } finally {
                setLoading(false)
              }
            })}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Course Title:
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className="border-teal-400 focus:border-teal-500 focus:ring-teal-500"
                      {...field}
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
                    Description:
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={6}
                      className="border-teal-400 focus:border-teal-500 focus:ring-teal-500"
                      {...field}
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
                    Course Slug:
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className="border-teal-400 focus:border-teal-500 focus:ring-teal-500"
                      value={watchedTitle.toLowerCase().split(' ').join('-')}
                      onChange={() =>
                        field.onChange(
                          watchedTitle.toLowerCase().split(' ').join('-'),
                        )
                      }
                      // {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/*<div className="flex items-center space-x-2">
              <Switch
                id="is_published"
                checked={formData.is_published}
                onCheckedChange={(checked) =>
                  handleInputChange('is_published', checked)
                }
              />
              <Label htmlFor="is_published">Publish Course</Label>
            </div>*/}

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {courseId ? 'Update Course' : 'Create Course'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.navigate({ to: '/admin/courses' })}
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
