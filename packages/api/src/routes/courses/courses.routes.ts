import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";

import { insertCourseSchema, selectCourseSchema } from "@/db/schema/schema";

const tags = ["Courses"];
export const create = createRoute({
  tags,
  path: "/courses",
  method: "post",
  request: {
    body: jsonContent(
      insertCourseSchema,
      "New course payload",
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectCourseSchema,
      "New course created payload",
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string().optional(),
      }),
      "Bad request",
    ),
  },
});

export const list = createRoute({
  tags,
  path: "/courses",
  method: "get",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(selectCourseSchema),
      "List of courses",
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string().optional(),
      }),
      "Bad request",
    ),
  },
});

export const getOne = createRoute({
  tags,
  path: "/courses/{id}",
  method: "get",
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectCourseSchema,
      "Course details",
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string().optional(),
      }),
      "Bad request",
    ),
  },
});

export const enroll = createRoute({
  tags,
  method: "post",
  path: "/courses/enroll",
  request: {
    body: jsonContent(
      z.object({
        courseId: z.string().uuid()
      }),
      "Request body"
    )
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string().optional()
      }),
      "Enroll response"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string().optional()
      }),
      "Bad request response"
    )
  }
})

export type CreateCourseRoute = typeof create;
export type ListCourseRoute = typeof list;
export type GetOneCourseRoute = typeof getOne;
export type EnrollCourseROute = typeof enroll;
