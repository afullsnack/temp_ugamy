import { and, eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";

import db from "@/db";
import { videoLikes, videos, videoWatchProgress } from "@/db/schema/schema";
import env from "@/env";
import { TigrisClient } from "@/lib/asset-storage";

import type { CreateVideoRoute, GetOneVideoRoute, LikeVideoRoute, ListVideosRoute, StreamVideoRoute, WatchedVideoRoute } from "./videos.routes";

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
  const { id: courseId, limit, page, filter } = c.req.valid("query");
  const session = c.get("session");

  if (limit && page && filter) {
    const offset = ((page || 1) - 1) * (limit || 10);
    const total = await db.$count(videos);
    const videoList = await db.query.videos.findMany({
      where(fields, ops) {
        return courseId ? ops.eq(fields.courseId, courseId) : undefined;
      },
      with: {
        likes: true,
        watchProgress: true,
      },
      limit,
      offset,
    });
    const totalPages = Math.ceil(total / limit);
    const isLastPage = page >= totalPages;
    const nextPage = isLastPage ? null : page + 1;
    const previousPage = page > 1 ? page - 1 : null;

    const filteredVideos = filter === "liked"
      ? videoList.filter(video => video.likes.some(({ userId, videoId }) => userId === session.userId && video.id === videoId))
      : filter === "watched"
        ? videoList.filter(video => video.watchProgress.some(({ userId, videoId }) => userId === session.userId && video.id === videoId))
        : videoList;

    console.log("Filtered Videos", filteredVideos);

    return c.json({
      success: true,
      message: "Video list gotten",
      data: filteredVideos.map(vid => ({
        ...vid,
        isFavorite: vid.likes.some(like => like.userId === session.userId && like.videoId === vid.id),
      })),
      ...(limit && page && {
        pagination: {
          pageSize: limit,
          page,
          total,
          nextPage,
          previousPage,
          isLastPage,
        },
      }),
    }, HttpStatusCodes.OK);
  }

  const videoList = await db.query.videos.findMany({
    where(fields, ops) {
      return courseId ? ops.eq(fields.courseId, courseId) : undefined;
    },
    with: {
      likes: true,
      watchProgress: true,
    },
  });

  return c.json({
    success: true,
    data: videoList.map(vid => ({
      ...vid,
      isFavorite: vid.likes.some(like => like.userId === session.userId && like.videoId === vid.id),
    })),
  });
};

export const getOne: AppRouteHandler<GetOneVideoRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const session = c.get("session");

  const video = await db.query.videos.findFirst({
    where(fields, ops) {
      return ops.eq(fields.id, id);
    },
    with: {
      likes: true,
      watchProgress: true,
    },
  });

  if (!video) {
    return c.json({
      success: false,
      message: "Video not found with provided id",
    }, HttpStatusCodes.BAD_REQUEST);
  }

  return c.json({
    ...video,
    isFavorite: video.likes.some(({
      videoId,
      userId,
    }) => videoId === id && userId === session.userId),
  }, HttpStatusCodes.OK);
};

export const stream: AppRouteHandler<StreamVideoRoute> = async (c) => {
  try {
    const { key } = c.req.valid("param");
    console.log("Key to video", key);

    if (!key) {
      return c.json({
        success: false,
        message: "Key not provided",
      }, HttpStatusCodes.BAD_REQUEST);
    }

    const tigrisClient = new TigrisClient({
      endpoint: env.AWS_ENDPOINT_URL_S3 || "",
      accessKeyId: env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY || "",
      region: env.AWS_REGION,
    });

    // Get file metadata first to determine file size
    const metadata = await tigrisClient.getFileMetadata(
      env.BUCKET_NAME || "",
      `videos/${key}` || "",
    );

    const fileSize = metadata.size || 0;
    const rangeHeader = c.req.header("range");

    // Set CORS and security headers
    c.header(
      "Access-Control-Allow-Origin",
      `https://staging.ugamy.io`
      // `http://localhost:3000, https://staging.ugamy.io, https://ugamy.io, https://www.ugamy.io`
    );
    c.header("Access-Control-Allow-Methods", "GET, OPTIONS, HEAD");
    c.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Range");
    c.header("Access-Control-Expose-Headers", "Content-Length, Content-Range, Accept-Ranges");
    c.header("Cache-Control", "public, max-age=3600");
    c.header("X-Content-Type-Options", "nosniff");
    c.header("X-Frame-Options", "DENY");
    c.header("Content-Security-Policy", "default-src 'self'");
    c.header("Cross-Origin-Resource-Policy", "cross-origin");
    c.header("Content-Type", metadata.contentType || "video/mp4");
    c.header("Content-Disposition", `inline; filename=${key}`);
    c.header("Accept-Ranges", "bytes");

    // Handle Range requests for video streaming
    if (rangeHeader) {
      const parts = rangeHeader.replace(/bytes=/, "").split("-");
      const start = Number.parseInt(parts[0], 10);
      const end = parts[1] ? Number.parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      // Validate range
      if (start >= fileSize || end >= fileSize) {
        c.status(HttpStatusCodes.REQUESTED_RANGE_NOT_SATISFIABLE);
        c.header("Content-Range", `bytes */${fileSize}`);
        return c.body(null);
      }

      // Download the specified range
      const { body: response } = await tigrisClient.downloadFile({
        bucket: env.BUCKET_NAME || "",
        key: `videos/${key}` || "",
        range: `bytes=${start}-${end}`,
      });

      // Set partial content headers
      c.header("Content-Range", `bytes ${start}-${end}/${fileSize}`);
      c.header("Content-Length", chunkSize.toString());
      c.status(HttpStatusCodes.PARTIAL_CONTENT);

      return c.body(response as ReadableStream, HttpStatusCodes.PARTIAL_CONTENT);
    }

    // No range request - send full file
    const { body: response } = await tigrisClient.downloadFile({
      bucket: env.BUCKET_NAME || "",
      key: `videos/${key}` || "",
    });

    c.header("Content-Length", fileSize.toString());
    c.status(HttpStatusCodes.OK);

    return c.body(response as ReadableStream, HttpStatusCodes.OK);
  }
  catch (error: any) {
    console.log(`Failed to stream video: `, { error })
    throw error;
  }
};

export const like: AppRouteHandler<LikeVideoRoute> = async (c) => {
  const body = c.req.valid("json");
  const session = c.get("session");

  try {
    const likeExist = await db.query.videoLikes.findFirst({
      where(fields, ops) {
        return ops.and(
          ops.eq(fields.userId, session.userId),
          ops.eq(fields.videoId, body.videoId),
        );
      },
    });

    if (likeExist) {
      // Toggle like if video already exists
      await db.delete(videoLikes).where(
        and(
          eq(
            videoLikes.videoId,
            body.videoId,
          ),
          eq(
            videoLikes.userId,
            session.userId,
          ),
        ),
      );
      return c.json({
        success: true,
        message: "Video unliked",
      });
    }

    await db.insert(videoLikes)
      .values({
        userId: session.userId,
        videoId: body.videoId,
      });

    return c.json({
      success: true,
      message: "Video like has been updated",
    }, HttpStatusCodes.OK);
  }
  catch (likeErr) {
    console.error("Like error", likeErr);
    return c.json({
      success: false,
      message: "Something went wrong making the request",
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const trackWatched: AppRouteHandler<WatchedVideoRoute> = async (c) => {
  const body = c.req.valid("json");
  const session = c.get("session");

  try {
    const watchExist = await db.query.videoWatchProgress.findFirst({
      where(fields, ops) {
        return ops.and(
          ops.eq(fields.userId, session.userId),
          ops.eq(fields.videoId, body.videoId),
        );
      },
    });

    if (watchExist) {
      await db.update(videoWatchProgress)
        .set({
          watchedSeconds: body.watchedSeconds,
          watchPercentage: body.watchPercentage,
          isCompleted: body.isCompleted,
        })
        .where(eq(videoWatchProgress.videoId, body.videoId));

      return c.json({
        success: true,
        message: "Video updated successfully",
      }, HttpStatusCodes.OK);
    }

    await db.insert(videoWatchProgress)
      .values({
        userId: session.userId,
        videoId: body.videoId,
        watchedSeconds: body.watchedSeconds,
        watchPercentage: body.watchPercentage,
        isCompleted: body.isCompleted,
      });

    return c.json({
      success: true,
      message: "Video watch progress tracked",
    }, HttpStatusCodes.OK);
  }
  catch (watchErr) {
    console.error("Failed to track watched", watchErr);
    return c.json({
      success: false,
      message: "Failed to track video watched",
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};
