import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";

import db from "@/db";
import { videos } from "@/db/schema/schema";

import type { CreateVideoRoute, GetOneVideoRoute, ListVideosRoute } from "./videos.routes";

export const create: AppRouteHandler<CreateVideoRoute> = async (c) => {
  const body = c.req.valid("json");

  const [newVideo] = await db.insert(videos)
    .values(body)
    .returning();

  return c.json(newVideo, HttpStatusCodes.OK);
};

export const list: AppRouteHandler<ListVideosRoute> = async (c) => {
  const videos = await db.query.videos.findMany({
    with: {
      likes: true,
    },
  });

  return c.json(videos, HttpStatusCodes.OK);
};

export const getOne: AppRouteHandler<GetOneVideoRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const video = await db.query.videos.findFirst({
    where(fields, ops) {
      return ops.eq(fields.id, id);
    },
    with: {
      likes: true,
    },
  });

  if (!video) {
    // @ts-expect-error "Deep type nesting"
    return c.json({
      success: false,
      message: "Video not found with provided id",
    }, HttpStatusCodes.BAD_REQUEST);
  }

  return c.json(video, HttpStatusCodes.OK);
};
