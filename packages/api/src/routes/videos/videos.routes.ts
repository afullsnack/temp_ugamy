import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { createErrorSchema } from "stoker/openapi/schemas";

import { insertVideoSchema, selectVideoSchema } from "@/db/schema/schema";

const tags = ["Videos"];
export const create = createRoute({
  tags,
  path: "/videos",
  method: "post",
  request: {
    body: jsonContent(
      insertVideoSchema,
      "Video create payload",
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectVideoSchema,
      "Video created",
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      createErrorSchema(insertVideoSchema),
      "Invalid video data",
    ),
  },
});

export const list = createRoute({
  tags,
  path: "/videos",
  method: "get",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(selectVideoSchema),
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
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectVideoSchema,
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

export type CreateVideoRoute = typeof create;
export type GetOneVideoRoute = typeof getOne;
export type ListVideosRoute = typeof list;
