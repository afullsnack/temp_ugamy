import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { phoneNumber, username } from "better-auth/plugins";

import db from "@/db";
import * as authSchema from "@/db/schema/auth-schema";

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
    sendResetPassword: async (ctx, request) => { },
  },
  emailVerification: {
    sendVerificationEmail: async (ctx, request) => {

    },
    onEmailVerification: async (user, request) => {
      console.log(`${user.name} with email ${user.email} has been verified`);
    },
  },
  // hooks: {
  //   before: async (context) => {
  //   }
  // },
  plugins: [
    username({
      usernameValidator: (username) => {
        console.log('Username', username);
        if (username === "admin") {
          return false;
        }
        return true;
      },
    }),
    phoneNumber(),
  ],
  trustedOrigins: ["*", "http://localhost:3000"],
});
