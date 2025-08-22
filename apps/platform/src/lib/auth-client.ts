import { createAuthClient } from "better-auth/react";
import { adminClient, customSessionClient, emailOTPClient, phoneNumberClient, usernameClient } from "better-auth/client/plugins"
import type {auth} from "@ugamy/api/auth-types"
import { env } from "@/env";

export const authClient = createAuthClient({
  baseURL: env.VITE_API_URL,
  plugins: [
    usernameClient(),
    phoneNumberClient(),
    emailOTPClient(),
    customSessionClient<typeof auth>(),
    adminClient()
  ]
})

export const $fetch = authClient.$fetch;
