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
      fetchCourseData(courseId)
    }
  }, [courseId])

  const fetchCourseData = async (id: string) => {
    try {
      const response = await fetch(`/api/courses/${id}`)
      if (response.ok) {
        const course = await response.json()
        setFormData({
          title: course.title || '',
          description: course.description || '',
          instructor: course.instructor || '',
          thumbnail_url: course.thumbnail_url || '',
          price: course.price?.toString() || '0.00',
          is_published: course.is_published || false,
        })
      }
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to load course data',
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = courseId ? `/api/courses/${courseId}` : '/api/courses'
      const method = courseId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: Number.parseFloat(formData.price),
        }),
      })

      if (response.ok) {
        toast.success('Success', {
          description: `Course ${courseId ? 'updated' : 'created'} successfully`,
        })
        router.navigate({ to: '/admin/courses' })
      } else {
        throw new Error('Failed to save course')
      }
    } catch (error) {
      toast.error('Error', {
        description: `Failed to ${courseId ? 'update' : 'create'} course`,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (
    field: keyof CourseData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Course Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter course title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter course description"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructor">Instructor</Label>
            <Input
              id="instructor"
              value={formData.instructor}
              onChange={(e) => handleInputChange('instructor', e.target.value)}
              placeholder="Enter instructor name"
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

          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_published"
              checked={formData.is_published}
              onCheckedChange={(checked) =>
                handleInputChange('is_published', checked)
              }
            />
            <Label htmlFor="is_published">Publish Course</Label>
          </div>

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
      </CardContent>
    </Card>
  )
}
