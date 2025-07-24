import { createAuthClient } from "better-auth/react";
import { phoneNumberClient, usernameClient} from "better-auth/client/plugins"
import { env } from "@/env";

export const authClient = createAuthClient({
  baseURL: env.VITE_API_URL,
  plugins: [
    usernameClient(),
    phoneNumberClient()
  ]
})

export const $fetch = authClient.$fetch;
