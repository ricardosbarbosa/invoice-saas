"use client";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/sign-out-button";
import { authClient } from "@/lib/auth-client";

export default function DashboardPage() {
  const { data: session } = authClient.useSession();

  if (!session) {
    redirect("/login");
  } else {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-svh bg-gradient-to-br from-white via-slate-50 to-slate-100">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-12">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-500">Protected area</p>
            <h1 className="text-3xl font-semibold text-neutral-900">
              Dashboard
            </h1>
          </div>
          <div className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Signed in
          </div>
          <SignOutButton />
        </header>

        <section className="rounded-xl border bg-white/70 p-6 shadow-sm backdrop-blur">
          <h2 className="text-lg font-semibold text-neutral-900">Session</h2>
          <p className="text-sm text-neutral-600">
            Welcome back, {session?.user?.email ?? "user"}.
          </p>
          <dl className="mt-4 grid grid-cols-1 gap-4 text-sm text-neutral-700 sm:grid-cols-2">
            <div className="rounded-lg border border-neutral-100 bg-neutral-50/70 p-3">
              <dt className="font-semibold text-neutral-900">User ID</dt>
              <dd className="mt-1 break-all text-neutral-700">
                {session?.user?.id}
              </dd>
            </div>
            <div className="rounded-lg border border-neutral-100 bg-neutral-50/70 p-3">
              <dt className="font-semibold text-neutral-900">Email</dt>
              <dd className="mt-1 text-neutral-700">{session?.user?.email}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-neutral-500">
            This page is rendered on the server and redirects if no valid Better
            Auth session cookie is present.
          </p>
        </section>
      </div>
    </div>
  );
}
