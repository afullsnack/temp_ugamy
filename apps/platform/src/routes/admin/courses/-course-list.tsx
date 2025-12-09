'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Edit, LoaderCircle, Trash2, Video } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import { env } from '@/env'
import { useQuery } from '@tanstack/react-query'

export function CourseList() {
  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      return await fetchCourses()
    },
  })

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${env.VITE_API_URL}/courses`, {
        credentials: "include"
      })
      if (response.ok) {
        const result = await response.json()
        console.log('Courses data', result)
        return result?.data as any[];
      }
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to load courses',
      })
    }
  }

  if (isLoading) {
    return <LoaderCircle className="animate-spin size-6" />
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
      {courses.map((course: any, _: number, array: any[]) => (
        <Card key={course.id} className="flex flex-col">
          <CardHeader>
            <div className="aspect-video bg-muted rounded-md mb-4 overflow-hidden">
              <img
                src={
                  course.thumbnail_url ||
                  '/course-poster.png'
                }
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{course.title}</CardTitle>
                <CardDescription className="mt-1">
                  slug <i>/{course.slug}</i>
                </CardDescription>
              </div>
              <Badge variant={course.isPublished ? 'default' : 'secondary'}>
                {course.isPublished ? 'Published' : 'Draft'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
              {course.description}
            </p>
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
              <span>{array?.length || 0} videos</span>
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
              <Link to={`/admin/courses`} params={{ id: course.id }}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
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
