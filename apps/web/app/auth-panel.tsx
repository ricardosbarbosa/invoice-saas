"use client"

import React, { useState, useTransition } from "react"
import { authClient } from "../lib/auth-client"
import { Button } from "@workspace/ui/components/button"

export function AuthPanel() {
  const { signIn, signOut, signUp, useSession } = authClient
  const { data: session, isPending } = useSession()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPendingAction, startTransition] = useTransition()

  const resetMessages = () => {
    setError(null)
    setSuccess(null)
  }

  const handleSignIn = (event: React.FormEvent) => {
    event.preventDefault()
    resetMessages()

    startTransition(async () => {
      await signIn.email(
        { email, password },
        {
          onError: (ctx) => setError(ctx.error.message),
          onSuccess: () => setSuccess("Signed in successfully")
        }
      )
    })
  }

  const handleSignUp = (event: React.FormEvent) => {
    event.preventDefault()
    resetMessages()

    startTransition(async () => {
      await signUp.email(
        {
          name,
          email,
          password
        },
        {
          onError: (ctx) => setError(ctx.error.message),
          onSuccess: () => setSuccess("Account created. Check your email if verification is enabled.")
        }
      )
    })
  }

  if (isPending) {
    return (
      <div className="rounded-xl border bg-white/70 p-8 shadow-sm backdrop-blur">
        <p className="text-neutral-600">Loading session...</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-xl rounded-xl border bg-white/70 p-8 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-500">Fastify + Better Auth</p>
          <h2 className="text-2xl font-semibold text-neutral-900">Sign in or create an account</h2>
        </div>
        {session ? (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            Signed in
          </span>
        ) : (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            Guest
          </span>
        )}
      </div>

      <div className="mt-6 space-y-4 text-neutral-700">
        <form className="space-y-3" onSubmit={handleSignIn}>
          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-700" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm shadow-sm outline-none ring-offset-2 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-300"
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm shadow-sm outline-none ring-offset-2 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-300"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-700" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm shadow-sm outline-none ring-offset-2 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-300"
              placeholder="********"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isPendingAction} className="w-1/2 justify-center">
              {isPendingAction ? "Working..." : "Sign in"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isPendingAction}
              className="w-1/2 justify-center"
              onClick={handleSignUp}
            >
              {isPendingAction ? "Working..." : "Sign up"}
            </Button>
          </div>
        </form>

        {session && (
          <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-4">
            <p className="text-sm font-semibold text-emerald-900">Session</p>
            <p className="text-sm text-emerald-800">User ID: {session.user.id}</p>
            <p className="text-sm text-emerald-800">Email: {session.user.email}</p>
            <div className="mt-3">
              <Button variant="secondary" onClick={() => signOut()} className="justify-center">
                Sign out
              </Button>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50/70 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        {!session && (
          <p className="text-xs text-neutral-500">
            We use Better Auth over Fastify at <code className="rounded bg-neutral-100 px-1 py-0.5">/api/auth</code>.
            Requests include credentials so sessions persist across refreshes.
          </p>
        )}
      </div>
    </div>
  )
}
