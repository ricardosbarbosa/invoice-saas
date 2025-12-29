"use client";
import { Card, CardContent } from "@workspace/ui/components/card";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import { toast } from "@workspace/ui/components/sonner";
import { z } from "zod";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { LoadingSwap } from "@workspace/ui/components/loading-swap";
import { useEffect } from "react";

const profileUpdateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().min(1),
  // favoriteNumber: z.number().int(),
});

type ProfileUpdateForm = z.infer<typeof profileUpdateSchema>;

export function ProfileUpdateForm() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileUpdateForm>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: user,
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
      });
    }
  }, [user, reset]);

  if (!user) {
    return <div>User not found</div>;
  }

  async function handleProfileUpdate(data: ProfileUpdateForm) {
    const promises = [
      authClient.updateUser({
        name: data.name,
        // favoriteNumber: data.favoriteNumber,
      }),
    ];

    if (data.email !== user?.email) {
      promises.push(
        authClient.changeEmail({
          newEmail: data.email,
          callbackURL: "/profile",
        })
      );
    }

    const res = await Promise.all(promises);

    const updateUserResult = res[0];
    const emailResult = res[1] ?? { error: false };

    if (updateUserResult?.error) {
      toast.error(
        updateUserResult.error?.message ?? "Failed to update profile"
      );
    } else if (emailResult.error) {
      toast.error(emailResult.error?.message ?? "Failed to change email");
    } else {
      if (data.email !== user?.email) {
        toast.success("Verify your new email address to complete the change.");
      } else {
        toast.success("Profile updated successfully");
      }
      router.refresh();
    }
  }

  return (
    <Card>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={handleSubmit(handleProfileUpdate)}
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <FieldContent>
                <Input
                  id="name"
                  placeholder="John Doe"
                  aria-invalid={!!errors.name}
                  {...register("name")}
                />
                <FieldError errors={[errors.name]} />
                <FieldDescription>Your full name.</FieldDescription>
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <FieldContent>
                <Input
                  id="email"
                  placeholder="Email"
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
                <FieldError errors={[errors.email]} />
                <FieldDescription>Your email address.</FieldDescription>
              </FieldContent>
            </Field>
          </FieldGroup>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            <LoadingSwap isLoading={isSubmitting}>Update Profile</LoadingSwap>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
