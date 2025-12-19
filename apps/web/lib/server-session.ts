"use server"

import { headers } from "next/headers"
import { env } from "../env"

type SessionResponse = {
  session: {
    id: string
    userId: string
    createdAt: string
    updatedAt: string
    expiresAt: string
    token: string
    ipAddress?: string | null
    userAgent?: string | null
  } | null
  user: {
    id: string
    email: string
    name?: string | null
    role?: string | null
  } | null
}

export async function getServerSession() {
  const cookieHeader = (await headers()).get("cookie") ?? ""

  const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/auth/get-session`, {
    method: "GET",
    headers: {
      cookie: cookieHeader
    },
    cache: "no-store",
    credentials: "include"
  })

  if (!res.ok) {
    return null
  }

  const data: SessionResponse = await res.json()
  return data?.session && data?.user ? data : null
}
