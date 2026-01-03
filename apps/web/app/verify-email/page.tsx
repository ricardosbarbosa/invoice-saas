"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "../../lib/auth-client";
import { Button } from "@workspace/ui/components/button";

type Status = "idle" | "verifying" | "success" | "error";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = useMemo(() => searchParams.get("token"), [searchParams]);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing token.");
      return;
    }

    let cancelled = false;
    setStatus("verifying");
    setMessage(null);

    (async () => {
      const { error } = await authClient.verifyEmail({
        query: { token },
      });

      if (cancelled) return;

      if (error) {
        setStatus("error");
        setMessage(error.message ?? "Verification failed.");
        return;
      }

      setStatus("success");
      setMessage("Email verified successfully.");
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col justify-center gap-4 px-6 py-10">
      <div className="rounded-xl border bg-white/70 p-6 shadow-sm backdrop-blur">
        <h1 className="text-xl font-semibold text-neutral-900">
          Verify your email
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          {status === "verifying" && "Verifying…"}
          {status === "success" && (message ?? "Verified.")}
          {status === "error" && (message ?? "Something went wrong.")}
          {status === "idle" && "Waiting…"}
        </p>

        <div className="mt-5 flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/login")}
          >
            Go to login
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/")}>
            Home
          </Button>
        </div>
      </div>
    </div>
  );
}


