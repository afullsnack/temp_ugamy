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
      id: z.string().uuid(),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(z.any()),
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
        "application/octet-stream": {
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

export type CreateVideoRoute = typeof create;
export type GetOneVideoRoute = typeof getOne;
export type ListVideosRoute = typeof list;
export type StreamVideoRoute = typeof stream;
