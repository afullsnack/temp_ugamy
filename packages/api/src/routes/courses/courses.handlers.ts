import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";

import db from "@/db";
import { courseEnrollments, courses } from "@/db/schema/schema";

import type { CreateCourseRoute, GetOneCourseRoute, ListCourseRoute, EnrollCourseROute } from "./courses.routes";

export const create: AppRouteHandler<CreateCourseRoute> = async (c) => {
  const body = await c.req.raw.json();
  console.log("BOdy data", body);
  const existingSlug = await db.query.courses.findFirst({
    where(fields, ops) {
      return ops.eq(fields.slug, body.slug);
    },
  });

  if (existingSlug) {
    return c.json({
      success: false,
      message: "Course with this slug already exists",
    }, HttpStatusCodes.BAD_REQUEST);
  }
  const [newCourse] = await db.insert(courses)
    .values({
      ...body,
    })
    .returning();

  return c.json({
    ...newCourse,
  }, HttpStatusCodes.OK);
};

export const list: AppRouteHandler<ListCourseRoute> = async (c) => {
  const { filter, page, limit } = c.req.valid("query");
  const session = c.get('session');

  if (filter && page && limit) {
    const offset = ((page || 1) - 1) * (limit || 10);
    const total = await db.$count(courses);
    const courseList = await db.query.courses.findMany({
      with: {
        enrollments: true,
        videos: {
          with: {
            likes: true
          }
        },
      },
      limit,
      offset,
    });
    const totalPages = Math.ceil(total / limit);
    const isLastPage = page >= totalPages;
    const nextPage = isLastPage ? null : page + 1;
    const previousPage = page > 1 ? page - 1 : null;

    const filteredCourses = filter === 'enrolled'
      ? courseList.filter((course) => course.enrollments.some(({ userId }) => userId === session.userId))
      : courseList;

    const data = filteredCourses.map((course) => ({
      ...course,
    enrollments: null,
    isEnrolled: course.enrollments.some((enroll) => enroll.courseId === course.id && enroll.userId === session.userId),
      videos: course.videos.map((vid) => ({
        ...vid,
        isFavorite: vid.likes.some((like) => like.userId === session.userId && like.videoId === vid.id)
      })),
      totalVideos: course.videos.length,
      totalWatchTime: course.videos.reduce((prevVal, curVal) => prevVal + curVal.duration, 0)
    }))

    return c.json({
      success: true,
      message: "Course list",
      data,
      ...(limit && page && {
        pagination: {
          pageSize: limit,
          page,
          total,
          nextPage,
          previousPage,
          isLastPage,
        }
      })
    }, HttpStatusCodes.OK);
  }

  const courseList = await db.query.courses.findMany({
    with: {
      enrollments: true,
      videos: {
        with: {
          likes: true,
        }
      },
    },
  });
  const data = courseList.map((course) => ({
    ...course,
    enrollments: null,
    isEnrolled: course.enrollments.some((enroll) => enroll.courseId === course.id && enroll.userId === session.userId),
    videos: course.videos.map((vid) => ({
      ...vid,
      isFavorite: vid.likes.some((like) => like.userId === session.userId && like.videoId === vid.id)
    })),
    totalVideos: course.videos.length,
    totalWatchTime: course.videos.reduce((prevVal, curVal) => prevVal + curVal.duration, 0)
  }))

  return c.json({
    success: true,
    data
  }, HttpStatusCodes.OK);
};

export const getOne: AppRouteHandler<GetOneCourseRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const session = c.get('session');
  const course = await db.query.courses.findFirst(({
    where(fields, ops) {
      return ops.eq(fields.id, id);
    },
    with: {
      enrollments: true,
      videos: {
        with: {
          likes: true
        }
      },
    },
  }));

  if (!course) {
    return c.json({
      success: false,
      message: "Course not found with id provided",
    }, HttpStatusCodes.BAD_REQUEST);
  }

  const data = {
    ...course,
    enrollments: null,
    isEnrolled: course.enrollments.some((enroll) => enroll.courseId === course.id && enroll.userId === session.userId),
    videos: course.videos.map((vid) => ({
      ...vid,
      isFavorite: vid.likes.some((like) => like.userId === session.userId && like.videoId === vid.id)
    })),
    totalVideos: course.videos.length,
    totalWatchTime: course.videos.reduce((prevVal, curVal) => prevVal+curVal.duration, 0)
  }

  return c.json(data, HttpStatusCodes.OK);
};


export const enroll: AppRouteHandler<EnrollCourseROute> = async (c) => {
  const body = c.req.valid("json")
  const session = c.get('session')

  await db.insert(courseEnrollments)
    .values({
      userId: session.userId,
      courseId: body.courseId
    });

  return c.json({
    success: false,
    message: 'Successfully enrolled in the course'
  }, HttpStatusCodes.OK)
}
