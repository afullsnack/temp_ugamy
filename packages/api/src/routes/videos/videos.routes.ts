import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { IdUUIDParamsSchema } from "stoker/openapi/schemas";

const tags = ["Videos"];
export const create = createRoute({
  tags,
  path: "/videos",
  method: "post",
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: z.object({
            video: z.instanceof(File).openapi({
              description: "The video file to upload",
              type: "string", // OpenAPI requires 'string' for binary data
              format: "binary",
            }),
            title: z.string(),
            slug: z.string(),
            description: z.string(),
            duration: z.coerce.number(),
          }),
        },
      },
    },
    query: z.object({
      courseId: z.string().uuid(),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({}),
      "Video created",
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string().optional(),
      }),
      "Invalid video data",
    ),
  },
});

export const list = createRoute({
  tags,
  path: "/videos",
  method: "get",
  request: {
    query: z.object({
      id: z.string().uuid().optional().describe("Course of videos to fetch"),
      limit: z.coerce.number().default(10).optional(),
      page: z.coerce.number().default(1).optional(),
      filter: z.enum(['liked', 'watched', 'all']).default('all').optional()
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string().optional(),
        data: z.array(z.any()),
        pagination: z.object({
          pageSize: z.number(),
          page: z.number(),
          total: z.number(),
          nextPage: z.number().nullable(),
          previousPage: z.number().nullable(),
          isLastPage: z.boolean()
        }).optional()
      }),
      "Videos list",
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string().optional(),
      }),
      "Invalid video data",
    ),
  },
});

export const getOne = createRoute({
  tags,
  path: "/videos/{id}",
  method: "get",
  request: {
    params: IdUUIDParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({}),
      "Video",
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string().optional(),
      }),
      "Invalid video id param",
    ),
  },
});

export const stream = createRoute({
  tags,
  method: "get",
  path: "/videos/stream/{key}",
  request: {
    params: z.object({
      key: z.string(),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: {
      content: {
        "video/mp4": {
          schema: z.any(),
        },
      },
      description: "Video stream",
    },
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string().optional(),
      }),
      "Invalid video key param",
    ),
  },
});

export const like = createRoute({
  tags,
  method: 'post',
  path: '/videos/like',
  request: {
    body: jsonContent(
      z.object({
        videoId: z.string()
      }),
      "Video ID to like"
    )
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string()
      }),
      "Video like response"
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string()
      }),
      "Failed response"
    )
  }
});

export const trackWatched = createRoute({
  tags,
  method: 'post',
  path: '/videos/watched',
  request: {
    body: jsonContent(
      z.object({
        videoId: z.string().uuid(),
        watchedSeconds: z.number().default(0),
        watchPercentage: z.number().default(0).describe('100% = 1, 20% = 0.2, and so on'),
        isCompleted: z.boolean().default(false).describe('Pass true once user reaches end of video'),
      }),
      "Video ID to track watched"
    )
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string()
      }),
      "Response of watched tracking"
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string()
      }),
      "Response of watched tracking"
    )
  }
})

export type CreateVideoRoute = typeof create;
export type GetOneVideoRoute = typeof getOne;
export type ListVideosRoute = typeof list;
export type StreamVideoRoute = typeof stream;
export type LikeVideoRoute = typeof like;
export type WatchedVideoRoute = typeof trackWatched;
