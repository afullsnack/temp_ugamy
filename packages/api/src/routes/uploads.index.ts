import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";

import env from "@/env";
import { TigrisService } from "@/lib/asset-storage";
import { createRouter } from "@/lib/create-app";

const router = createRouter()
  .openapi(
    createRoute({
      tags: ["Uploads"],
      method: "post",
      path: "/upload",
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
                type: z.string(),
                identifier: z.string(),
              }),
            },
          },
        },
      },
      responses: {
        [HttpStatusCodes.OK]: jsonContent(
          z.object({
            message: z.string(),
            link: z.string(),
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
      // const body = c.req.valid("form");
      const file = body.file;
      const type = body.type;
      const identifier = body.identifier;

      console.log("Parse Body values", body, file);

      const tigrisService = new TigrisService({
        accessKeyId: env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY || "",
        endpoint: env.AWS_ENDPOINT_URL_S3,
        region: env.AWS_REGION,
      });

      if (file instanceof File) {
        const keyToStore = `${type}/${identifier}`;
        const keyToGet = `images/${keyToStore}`;

        const result = await tigrisService.uploadImageFile(
          env.BUCKET_NAME || "",
          keyToStore,
          Buffer.from(await file.arrayBuffer()),
          file.type,
        );
        console.log("Uploaded", result);

        // TODO: store link in db
        const link = await tigrisService.createDownloadLink(env.BUCKET_NAME || "", keyToGet);
        console.log("Signed link", link);
        return c.json({
          message: "Upload successful",
          link,
          key: keyToGet,
        }, HttpStatusCodes.OK);
      }

      return c.json({
        message: "Could not upload file",
      }, HttpStatusCodes.UNPROCESSABLE_ENTITY);
    },
  );

export default router;
