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
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { useState, useTransition } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "@workspace/ui/components/sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isPendingAction, startTransition] = useTransition();

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();

    startTransition(async () => {
      try {
        const result = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/organizations/select",
        });

        if (result?.error) {
          toast.error(result.error.message ?? "Invalid email or password.");
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
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
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
              <Field>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Link
                    href={`/request-reset-password`}
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </Field>
              <Field>
                <Button type="submit" disabled={isPendingAction}>
                  Login
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() =>
                    authClient.signIn.social(
                      {
                        provider: "google",
                        callbackURL: `${window.location.origin}/organizations/select`,
                      },
                      {
                        onSuccess: () => {
                          toast.success("Signed in with Google");
                          router.push("/");
                        },
                        onError: (error) => {
                          console.error(error);
                          toast.error(
                            error.error?.message ??
                              "Unable to sign in with Google"
                          );
                        },
                      }
                    )
                  }
                >
                  Login with Google
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <a href="/signup">Sign up</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
