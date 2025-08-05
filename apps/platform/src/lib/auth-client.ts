import { createAuthClient } from "better-auth/react";
import { emailOTPClient, phoneNumberClient, usernameClient, customSessionClient } from "better-auth/client/plugins"
import { env } from "@/env";

export const authClient = createAuthClient({
  baseURL: env.VITE_API_URL,
  plugins: [
    usernameClient(),
    phoneNumberClient(),
    emailOTPClient(),
    customSessionClient()
  ]
})

export const $fetch = authClient.$fetch;
