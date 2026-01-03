"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { toast } from "@workspace/ui/components/sonner";
import { authClient } from "@/lib/auth-client";

const signupFormSchema = z
  .object({
    name: z.string().trim().min(1, "Full name is required."),
    email: z.string().email("Enter a valid email address."),
    password: z.string().min(8, "Must be at least 8 characters."),
    confirmPassword: z.string().min(8, "Please confirm your password."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

type SignupFormValues = z.infer<typeof signupFormSchema>;

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: SignupFormValues) => {
    try {
      const result = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      if (result?.error) {
        const message = result.error.message ?? "Unable to create account.";
        setError("root", { message });
        toast.error(message);
        return;
      }

      toast.success("Account created. Redirecting...");
      router.push("/");
      router.refresh();
    } catch {
      const message = "Unable to create account. Please try again.";
      setError("root", { message });
      toast.error(message);
    }
  };

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <FieldContent>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  aria-invalid={!!errors.name}
                  {...register("name")}
                />
                <FieldError errors={[errors.name]} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <FieldContent>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
                <FieldError errors={[errors.email]} />
                <FieldDescription>
                  We&apos;ll use this to contact you. We will not share your
                  email with anyone else.
                </FieldDescription>
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <FieldContent>
                <Input
                  id="password"
                  type="password"
                  aria-invalid={!!errors.password}
                  {...register("password")}
                />
                <FieldError errors={[errors.password]} />
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirm Password
              </FieldLabel>
              <FieldContent>
                <Input
                  id="confirm-password"
                  type="password"
                  aria-invalid={!!errors.confirmPassword}
                  {...register("confirmPassword")}
                />
                <FieldError errors={[errors.confirmPassword]} />
                <FieldDescription>
                  Please confirm your password.
                </FieldDescription>
              </FieldContent>
            </Field>
            <Field>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating account..." : "Create Account"}
              </Button>
              <Button variant="outline" type="button" disabled={isSubmitting}>
                Sign up with Google
              </Button>
              <FieldDescription className="px-6 text-center">
                Already have an account? <a href="/login">Sign in</a>
              </FieldDescription>
            </Field>
          </FieldGroup>

          {errors.root ? <FieldError errors={[errors.root]} /> : null}
        </form>
      </CardContent>
    </Card>
  );
}
