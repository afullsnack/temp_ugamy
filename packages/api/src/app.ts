import { auth } from "@/lib/auth";
import configureOpenAPI from "@/lib/configure-open-api";
import createApp from "@/lib/create-app";
import index from "@/routes/index.route";
import payments from "@/routes/payments/payments.index"
import webhooks from "@/routes/webhooks/webhooks.index"
import uploads from "@/routes/uploads.index"
// import { TigrisClient } from "@/lib/asset-storage";
// import env from "@/env";

const app = createApp();

configureOpenAPI(app);

const routes = [
  index,
  payments,
  webhooks,
  uploads
  // tasks,
] as const;

app.on(["POST", "GET", "DELETE", "PUT"], "/api/auth/*", async c => await auth.handler(c.req.raw));

routes.forEach((route) => {
  app.route("/", route);
});

// app.get("/stream-media", async (c) => {
//   const key = c.req.query("key")
//   console.log("Key to object", key)

//   const isDownload = false
//   const tigrisClient = new TigrisClient({
//     endpoint: env.AWS_ENDPOINT_URL_S3 || "",
//     accessKeyId: env.AWS_ACCESS_KEY_ID || "",
//     secretAccessKey: env.AWS_SECRET_ACCESS_KEY || "",
//     region: env.AWS_REGION,
//   })
//   const { body: response, metadata } = await tigrisClient.downloadFile({
//     bucket: env.BUCKET_NAME || "",
//     key: key || "",
//   })

//   if (isDownload) {
//     c.header("Content-Type", "application/pdf");
//     c.header("Content-Length", metadata.size?.toString() || "0");
//     c.header("Content-Disposition", `attachment; filename=${key}.pdf`);
//   } else {
//     c.header("Content-Type", metadata.contentType || "application/octet-stream");
//     c.header("Content-Length", metadata.size?.toString() || "0");
//     c.header("Content-Disposition", `inline; filename=${key}`);
//   }
//   c.header('Access-Control-Allow-Origin', `http://localhost:3000, https://ugamy.com, https://www.ugamy.com`);
//   c.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
//   c.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//   c.header('Cache-Control', 'public, max-age=3600');
//   c.header('X-Content-Type-Options', 'nosniff');
//   c.header('X-Frame-Options', 'DENY');
//   c.header('Content-Security-Policy', "default-src 'self'");
//   c.header('Cross-Origin-Embedder-Policy', 'require-corp');
//   c.header('Cross-Origin-Resource-Policy', 'cross-origin');
//   c.status(200)

//   return c.body(response as ReadableStream, 200)
// })

export type AppType = typeof routes[number];

export default app;
