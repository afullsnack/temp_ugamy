import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";

import env from "@/env";
import { TigrisClient, TigrisService } from "@/lib/asset-storage";
import { createRouter } from "@/lib/create-app";
import { auth } from "@/lib/auth";

const tags = ["Uploads"];
const router = createRouter()
  .openapi(
    createRoute({
      tags,
      method: "post",
      path: "/upload/{type}",
      request: {
        body: {
          content: {
            "multipart/form-data": {
              schema: z.object({
                file: z.instanceof(File).openapi({
                  description: "The file to upload",
                  type: "string", // OpenAPI requires 'string' for binary data
                  format: "binary",
                }),
              }),
            },
          },
        },
        params: z.object({
          type: z.enum(["profile", "video"]).default("profile").describe("Type of media being uploaded"),
        }),
        query: z.object({
          courseId: z.string().optional(),
        }),
      },
      responses: {
        [HttpStatusCodes.OK]: jsonContent(
          z.object({
            message: z.string(),
            key: z.string(),
          }),
          "Successful upload response",
        ),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
          z.object({
            message: z.string(),
          }),
          "Failed upload response",
        ),
      },
    }),
    async (c) => {
      const body = await c.req.parseBody();
      const { courseId } = c.req.valid("query");
      const { type } = c.req.valid("param");

      const data = await auth.api.getSession({
        headers: c.req.raw.headers
      })

      if(!data) {
        return c.json({
          message: "No session found"
        }, HttpStatusCodes.UNPROCESSABLE_ENTITY)
      }

      const file = body.file;

      console.log("Parse Body values, params and query", body, file, courseId, type);

      const tigrisService = new TigrisService({
        accessKeyId: env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY || "",
        endpoint: env.AWS_ENDPOINT_URL_S3,
        region: env.AWS_REGION,
      });

      if (file instanceof File) {
        if (type === "profile") {
          const keyToStore = `${type}/${data.session.userId}`;
          const keyToGet = `images/${keyToStore}`;

          const result = await tigrisService.uploadImageFile(
            env.BUCKET_NAME || "",
            keyToStore,
            Buffer.from(await file.arrayBuffer()),
            file.type,
          );
          console.log("Uploaded", result);

          // TODO: Store key to db, if profile - store inside of user table
          // TODO: Store key to file table of video

          return c.json({
            message: "Upload successful",
            key: keyToGet,
          }, HttpStatusCodes.OK);
        }
        else if (type === "video") {
          // TODO: get course
          const keyToStore = `${type}/`;
        }
      }

      return c.json({
        message: "Could not upload file",
      }, HttpStatusCodes.UNPROCESSABLE_ENTITY);
    },
  )
  .openapi(
    createRoute({
      tags,
      method: "get",
      path: "/upload/stream",
      request: {
        query: z.object({
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
          description: "Stream for object",
        },
      },
    }),
    async (c) => {
      const key = c.req.query("key");
      console.log("Key to object", key);

      const isDownload = false;
      const tigrisClient = new TigrisClient({
        endpoint: env.AWS_ENDPOINT_URL_S3 || "",
        accessKeyId: env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY || "",
        region: env.AWS_REGION,
      });
      const { body: response, metadata } = await tigrisClient.downloadFile({
        bucket: env.BUCKET_NAME || "",
        key: key || "",
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
    },
  );

export default router;
