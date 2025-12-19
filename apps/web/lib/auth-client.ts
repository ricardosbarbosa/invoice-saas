"use client"

import { createAuthClient } from "better-auth/react"
import { adminClient, organizationClient } from "better-auth/client/plugins"
import { env } from "../env"

export const authClient = createAuthClient({
  baseURL: `${env.NEXT_PUBLIC_API_URL}/api/auth`,
  fetchOptions: {
    credentials: "include"
  },
  plugins: [
    adminClient(),
    organizationClient()
  ]
})
