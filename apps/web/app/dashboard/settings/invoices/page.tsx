"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { authClient } from "@/lib/auth-client";
import { env } from "@/env";
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
import PageHeader from "@/components/page-header";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";

type InvoiceSettings = {
  prefixTemplate: string;
  numberPadding: number;
  defaultCurrency: string;
};

const invoiceSettingsSchema = z.object({
  prefixTemplate: z.string().min(1, "Prefix template is required."),
  numberPadding: z.number().int().min(1).max(10),
  defaultCurrency: z
    .string()
    .length(3, "Use a 3-letter currency code.")
    .transform((value) => value.toUpperCase()),
});

type InvoiceSettingsFormValues = z.infer<typeof invoiceSettingsSchema>;

const readClientError = (
  error: { message?: string; statusText?: string } | null | undefined,
  fallback: string
) => error?.message || error?.statusText || fallback;

export default function Page() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceSettingsFormValues>({
    resolver: zodResolver(invoiceSettingsSchema),
    defaultValues: {
      prefixTemplate: "INV-YYYY-",
      numberPadding: 4,
      defaultCurrency: "USD",
    },
  });

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await authClient.$fetch<{ settings: InvoiceSettings }>(
          `${env.NEXT_PUBLIC_API_URL}/invoice-settings`,
          { method: "GET" }
        );

        if (!isMounted) return;

        if (response.error) {
          setLoadError(
            readClientError(response.error, "Unable to load invoice settings.")
          );
          return;
        }

        const settings = response.data?.settings;
        if (settings) {
          reset({
            prefixTemplate: settings.prefixTemplate,
            numberPadding: settings.numberPadding,
            defaultCurrency: settings.defaultCurrency,
          });
        }
      } catch {
        if (!isMounted) return;
        setLoadError("Unable to load invoice settings.");
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    };

    void loadSettings();

    return () => {
      isMounted = false;
    };
  }, [reset]);

  const onSubmit = async (values: InvoiceSettingsFormValues) => {
    clearErrors("root");

    try {
      const response = await authClient.$fetch<{ settings: InvoiceSettings }>(
        `${env.NEXT_PUBLIC_API_URL}/invoice-settings`,
        {
          method: "PATCH",
          body: values,
        }
      );

      if (response.error) {
        setError("root", {
          message: readClientError(
            response.error,
            "Unable to update invoice settings."
          ),
        });
        return;
      }

      const settings = response.data?.settings;
      if (settings) {
        reset({
          prefixTemplate: settings.prefixTemplate,
          numberPadding: settings.numberPadding,
          defaultCurrency: settings.defaultCurrency,
        });
      }
    } catch {
      setError("root", {
        message: "Unable to update invoice settings.",
      });
    }
  };

  return (
    <>
      <PageHeader
        title="Invoice settings"
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard/invoices">Back to invoices</Link>
          </Button>
        }
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card>
          <CardHeader>
            <CardTitle>Invoice settings</CardTitle>
            <CardDescription>
              Configure numbering, currency defaults, and templates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadError ? (
              <div className="text-muted-foreground text-sm">{loadError}</div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="prefixTemplate">
                      Prefix template
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        id="prefixTemplate"
                        placeholder="INV-YYYY-"
                        disabled={isLoading}
                        aria-invalid={!!errors.prefixTemplate}
                        {...register("prefixTemplate")}
                      />
                      <FieldError errors={[errors.prefixTemplate]} />
                      <FieldDescription>
                        Use tokens like YYYY, YY, MM, or DD. Sequence resets
                        when the prefix changes.
                      </FieldDescription>
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="numberPadding">
                      Number padding
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        id="numberPadding"
                        type="number"
                        min={1}
                        max={10}
                        disabled={isLoading}
                        aria-invalid={!!errors.numberPadding}
                        {...register("numberPadding", { valueAsNumber: true })}
                      />
                      <FieldError errors={[errors.numberPadding]} />
                      <FieldDescription>
                        Controls how many digits appear after the prefix.
                      </FieldDescription>
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="defaultCurrency">
                      Default currency
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        id="defaultCurrency"
                        placeholder="USD"
                        disabled={isLoading}
                        aria-invalid={!!errors.defaultCurrency}
                        {...register("defaultCurrency")}
                      />
                      <FieldError errors={[errors.defaultCurrency]} />
                      <FieldDescription>
                        Three-letter ISO currency code, used when clients do not
                        specify one.
                      </FieldDescription>
                    </FieldContent>
                  </Field>
                </FieldGroup>

                {errors.root ? <FieldError errors={[errors.root]} /> : null}

                <div className="flex items-center gap-2">
                  <Button type="submit" disabled={isSubmitting || isLoading}>
                    {isSubmitting ? "Saving..." : "Save settings"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
