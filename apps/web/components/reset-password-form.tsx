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
import { useMemo, useState, useTransition } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "@workspace/ui/components/sonner";
import { useRouter, useSearchParams } from "next/navigation";

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = useMemo(() => searchParams.get("token"), [searchParams]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isPendingAction, startTransition] = useTransition();

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();

    if (!token) {
      toast.error("Missing token.");
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    startTransition(async () => {
      const { error } = await authClient.resetPassword({
        token,
        newPassword,
      });

      if (error) {
        toast.error(error.message ?? "Unable to reset password.");
        return;
      }

      toast.success("Password updated. You can now sign in.");
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>
            Enter your new password below to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="new-password">New Password</FieldLabel>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="********"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="confirm-password">
                  Confirm Password
                </FieldLabel>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="********"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
