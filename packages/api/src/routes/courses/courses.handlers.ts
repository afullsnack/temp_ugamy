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
  const courseList = await db.query.courses.findMany({
    with: {
      enrollments: true,
      videos: true,
    },
  });
  return c.json(courseList, HttpStatusCodes.OK);
};

export const getOne: AppRouteHandler<GetOneCourseRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const course = await db.query.courses.findFirst(({
    where(fields, ops) {
      return ops.eq(fields.id, id);
    },
    with: {
      enrollments: true,
      videos: true,
    },
  }));

  if (!course) {
    return c.json({
      success: false,
      message: "Course not found with id provided",
    }, HttpStatusCodes.BAD_REQUEST);
  }

  return c.json(course, HttpStatusCodes.OK);
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
