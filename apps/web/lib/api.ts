import "server-only"

import { cookies } from "next/headers"

import { env } from "@/env"

export async function apiFetch(path: string, init: RequestInit = {}) {
  const cookieHeader = (await cookies()).toString()
  const headers = new Headers(init.headers)

  if (cookieHeader) {
    headers.set("cookie", cookieHeader)
  }

  return fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
    credentials: "include",
  })
}
