"use client";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { useState, useTransition } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "@workspace/ui/components/sonner";
import { useRouter } from "next/navigation";

export function InitateResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const [isPendingAction, startTransition] = useTransition();

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();

    startTransition(async () => {
      try {
        const result = await authClient.requestPasswordReset({
          email,
        });

        if (result?.error) {
          toast.error(result.error.message ?? "Invalid email.");
        }
      } catch {
        toast.error("Unable to sign in. Please try again.");
      }
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>
            Enter your email below to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => router.push("/login")}
                >
                  Back to Login
                </Button>
                <Button type="submit" disabled={isPendingAction}>
                  Reset Password
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
