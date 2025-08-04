import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { emailOTP, phoneNumber, username } from "better-auth/plugins";

import db from "@/db";
import * as authSchema from "@/db/schema/auth-schema";

import { sendEmail } from "./email";

export const auth = betterAuth({
  basePath: "/api/auth",
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: { ...authSchema },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 5,
    requireEmailVerification: false,
    revokeSessionsOnPasswordReset: false,
    sendResetPassword: async (ctx, _) => {
      try {
        await sendEmail({
          to: ctx.user.email,
          subject: "Reset your password",
          body: `Click the link to reset your password ${ctx.url}`,
          name: "Ugamy",
        });
      }
      catch (error: any) {
        console.error("Fail to send password reset email", error);
        throw new APIError("INTERNAL_SERVER_ERROR", { message: "Failed to send reset password email", code: error?.code || 500 });
      }
    },
  },
  plugins: [
    username({
      usernameValidator: (username) => {
        console.log("Username", username);
        if (username === "admin") {
          return false;
        }
        return true;
      },
    }),
    phoneNumber(),
    emailOTP({
      otpLength: 6,
      expiresIn: 60 * 5, // 5 minutes
      allowedAttempts: 5,
      sendVerificationOnSignUp: true,
      sendVerificationOTP: async ({ email, otp, type }) => {
        if (type === "email-verification") {
          try {
            await sendEmail({
              to: email,
              subject: "Verify your email",
              body: `Your verification code is ${otp}`,
              name: "Ugamy",
            });
          }
          catch (error: any) {
            console.error("Fail to send email verificaiton otp", error);
            throw new APIError("INTERNAL_SERVER_ERROR", { message: "Failed to send email verification otp", code: error?.code || 500 });
          }
        }
        else if (type === "forget-password") {
          try {
            await sendEmail({
              to: email,
              subject: "Reset your password",
              body: `Use the otp to reset your password ${otp}`,
              name: "Ugamy",
            });
          }
          catch (error: any) {
            console.error("Fail to send password reset otp", error);
            throw new APIError("INTERNAL_SERVER_ERROR", { message: "Failed to send password reset otp", code: error?.code || 500 });
          }
        }
      },
    }),
  ],
  trustedOrigins: ["*", "http://localhost:3000", "https://ugamy-backend-platform.vercel.app", "https://ugamy.io"],
});
