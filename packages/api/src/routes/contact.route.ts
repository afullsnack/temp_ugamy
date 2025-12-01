
import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";

import { createRouter } from "@/lib/create-app";
import { sendEmail } from "@/lib/email";

const router = createRouter()
  .openapi(
    createRoute({
      tags: ["Contact Us"],
      method: "post",
      path: "/contact-us",
      request: {
        body: jsonContent(
          z.object({
            name: z.string().min(10),
            email: z.string().email(),
            subject: z.string(),
            message: z.string().min(40)
          }),
          "Paylaod for the contact us"
        )
      },
      responses: {
        [HttpStatusCodes.OK]: jsonContent(
          z.object({ message: z.string() }),
          "Contact us response",
        ),
        [HttpStatusCodes.BAD_REQUEST]: jsonContent(
          z.object({ message: z.string() }),
          "Contact us bad request response",
        )
      },
    }),
    async (c) => {
      const body = c.req.valid("json")

      try {
        await sendEmail({
          to: `q.lifeee@gmail.com`, //'info@ugamy.io',
          subject: body.subject,
          body: `
            Contact enquiry sent by <b> ${body.name} with email address: ${body.email} </b> <br/><br/>
            ${body.message}
          `,
        })

        return c.json({
          message: "Email sent",
        }, HttpStatusCodes.OK);

      }
      catch (error: any) {
        console.log("Failed to send email", error)
        return c.json({
          message: 'Failed to send email'
        }, HttpStatusCodes.BAD_REQUEST)
      }
    },
  );

export default router;
