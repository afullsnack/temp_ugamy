import { betterAuth, BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { emailOTP, phoneNumber, username, customSession, admin } from "better-auth/plugins";

import db from "@/db";
import * as authSchema from "@/db/schema/auth-schema";

import { sendEmail } from "./email";
import env from "@/env";

const options = {
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
  trustedOrigins: ["*", "http://localhost:3000", "https://ugamy-backend-platform.vercel.app", "https://ugamy.io"],
  advanced: {
    cookies: {
      session_token: {
        attributes: {
          sameSite: env.NODE_ENV === "development" ? "Lax" : "None",
          secure: env.NODE_ENV !== "development",
          // domain: env.NODE_ENV === "development"? 'localhost' : 'passry.com',
          // path: "/",
          partitioned: env.NODE_ENV !== "development"
        },
      },
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
      sendVerificationOnSignUp: false,
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
        else if(type === "sign-in") {
          try {
            await sendEmail({
              to: email,
              subject: "Signin with OTP",
              body: `Use the OTP - ${otp} to sign into your account`,
              name: "Ugamy"
            })
          }
          catch(error: any) {
            console.error("Failed to send signin email");
            throw new APIError("INTERNAL_SERVER_ERROR", { message: "Failed to send password reset otp", code: error?.code || 500 });
          }
        }
      },
    }),
    admin({
      // adminUserIds: [], // fill with the default userIds that will be admins
      defaultBanReason: "Spamming",
      bannedUserMessage: "You have been banned from accessing this resource"
    })
  ]
} satisfies BetterAuthOptions

export const auth = betterAuth({
  ...options,
  plugins: [
    ...(options.plugins ?? []),
    customSession(async ({ user, session }) => {
      const findUser = await db.query.user.findFirst({
        where(fields, ops) {
          return ops.eq(fields.id, user.id)
        }
      })

      if (!findUser) {
        return {
          session,
          user,
        }
      }

      return {
        session: {
          ...session,
          isSubscribed: findUser?.isSubscribed
        },
        user: {
          ...user,
          isSubscribed: findUser?.isSubscribed,
        }
      }
    }, options),
  ],
});
