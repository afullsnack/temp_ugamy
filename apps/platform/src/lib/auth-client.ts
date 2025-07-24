import { createAuthClient } from "better-auth/react";
import { emailOTPClient, phoneNumberClient, usernameClient } from "better-auth/client/plugins"
import { env } from "@/env";

export const authClient = createAuthClient({
  baseURL: env.VITE_API_URL,
  plugins: [
    usernameClient(),
    phoneNumberClient(),
    emailOTPClient()
  ]
})

export const $fetch = authClient.$fetch;
