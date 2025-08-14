import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";

import db from "@/db";
import { videos } from "@/db/schema/schema";
import env from "@/env";
import { TigrisClient } from "@/lib/asset-storage";

import type { CreateVideoRoute, GetOneVideoRoute, ListVideosRoute, StreamVideoRoute } from "./videos.routes";

export const create: AppRouteHandler<CreateVideoRoute> = async (c) => {
  const body = await c.req.parseBody();
  const video = body.video;
  const title = body.title;
  const slug = body.slug;
  const description = body.description;
  const duration = body.duration;
  const { courseId } = c.req.valid("query");
  console.log(video, title, slug, description, duration, ":::Body");
  console.log(courseId, "Query");
  const key = `videos/${slug}`; // add slug to key

  // TODO: generate key to upload
  const tigrisClient = new TigrisClient({
    accessKeyId: env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY || "",
    endpoint: env.AWS_ENDPOINT_URL_S3,
    region: env.AWS_REGION,
  });

  if (video instanceof File) {
    const result = await tigrisClient.streamUpload(
      env.BUCKET_NAME || "",
      key,
      video.stream(),
      {
        contentType: video.type || "video/mp4",
      },
    );
    console.log("Video upload stream result", result);
  }

  const count = await db.$count(videos);

  const [newVideo] = await db.insert(videos)
    .values({
      // @ts-expect-error "Course ID exists"
      courseId,
      title,
      description,
      duration: Number(duration),
      key,
      orderIndex: count + 1,
      isPublished: true,
    })
    .returning();

  return c.json(newVideo, HttpStatusCodes.OK);
};

export const list: AppRouteHandler<ListVideosRoute> = async (c) => {
  const { id } = c.req.valid("query");
  console.log(id, "Id query");
  const videos = await db.query.videos.findMany({
    where(fields, ops) {
      return ops.eq(fields.courseId, id);
    },
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
    return c.json({
      success: false,
      message: "Video not found with provided id",
    }, HttpStatusCodes.BAD_REQUEST);
  }

  return c.json(video, HttpStatusCodes.OK);
};

export const stream: AppRouteHandler<StreamVideoRoute> = async (c) => {
  const { key } = c.req.valid("param");
  console.log("Key to video", key);

  if (!key) {
    return c.json({
      success: false,
      message: "Key not provided",
    }, HttpStatusCodes.BAD_REQUEST);
  }

  const isDownload = false;
  const tigrisClient = new TigrisClient({
    endpoint: env.AWS_ENDPOINT_URL_S3 || "",
    accessKeyId: env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY || "",
    region: env.AWS_REGION,
  });
  const { body: response, metadata } = await tigrisClient.downloadFile({
    bucket: env.BUCKET_NAME || "",
    key: `videos/${key}` || "",
  });

  if (isDownload) {
    c.header("Content-Type", "application/pdf");
    c.header("Content-Length", metadata.size?.toString() || "0");
    c.header("Content-Disposition", `attachment; filename=${key}.pdf`);
  }
  else {
    c.header("Content-Type", metadata.contentType || "application/octet-stream");
    c.header("Content-Length", metadata.size?.toString() || "0");
    c.header("Content-Disposition", `inline; filename=${key}`);
  }
  c.header("Access-Control-Allow-Origin", `http://localhost:3000, https://ugamy.com, https://www.ugamy.com`);
  c.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  c.header("Cache-Control", "public, max-age=3600");
  c.header("X-Content-Type-Options", "nosniff");
  c.header("X-Frame-Options", "DENY");
  c.header("Content-Security-Policy", "default-src 'self'");
  c.header("Cross-Origin-Embedder-Policy", "require-corp");
  c.header("Cross-Origin-Resource-Policy", "cross-origin");
  c.status(200);

  return c.body(response as ReadableStream, 200);
};
