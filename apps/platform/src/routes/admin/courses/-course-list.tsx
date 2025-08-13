'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Video } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { toast } from 'sonner'

interface Course {
  id: string
  title: string
  description: string
  instructor: string
  thumbnail_url: string
  price: number
  is_published: boolean
  created_at: string
  video_count?: number
}

export function CourseList() {
  const [courses, setCourses] = useState<Array<Course>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses')
      if (response.ok) {
        const data = await response.json()
        setCourses(data)
      }
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to load courses',
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteCourse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return

    try {
      const response = await fetch(`/api/courses/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setCourses(courses.filter((course) => course.id !== id))
        toast.success('Success', {
          description: 'Course deleted successfully',
        })
      }
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to delete course',
      })
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading courses...</div>
  }

  if (courses.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground mb-4">No courses found</p>
          <Link to="/admin/courses/new">
            <Button>Create Your First Course</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <Card key={course.id} className="flex flex-col">
          <CardHeader>
            <div className="aspect-video bg-muted rounded-md mb-4 overflow-hidden">
              <img
                src={
                  course.thumbnail_url ||
                  '/placeholder.svg?height=200&width=300'
                }
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{course.title}</CardTitle>
                <CardDescription className="mt-1">
                  by {course.instructor}
                </CardDescription>
              </div>
              <Badge variant={course.is_published ? 'default' : 'secondary'}>
                {course.is_published ? 'Published' : 'Draft'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
              {course.description}
            </p>
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
              <span>${course.price}</span>
              <span>{course.video_count || 0} videos</span>
            </div>
            <div className="flex gap-2">
              <Link
                to={`/admin/courses/$id/videos`}
                params={{ id: course.id }}
                className="flex-1"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-transparent"
                >
                  <Video className="mr-2 h-4 w-4" />
                  Videos
                </Button>
              </Link>
              <Link to={`/admin/courses/${course.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteCourse(course.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
