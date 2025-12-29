"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  invoiceBaseSchema,
  invoiceItemSchema,
} from "@workspace/types";

import { authClient } from "@/lib/auth-client";
import { env } from "@/env";
import { Button } from "@workspace/ui/components/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { Separator } from "@workspace/ui/components/separator";

// Frontend-specific helpers for form handling (using transform for better form UX)
const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z
    .union([z.literal(""), schema])
    .optional()
    .transform((value) =>
      value === "" || value === undefined ? undefined : value
    );

const numericString = z
  .string()
  .min(1, "Required")
  .refine((value) => !Number.isNaN(Number(value)), "Must be a number");

const optionalNumericString = emptyToUndefined(numericString);
const optionalString = emptyToUndefined(z.string());
const optionalDate = emptyToUndefined(z.string());
const optionalCurrency = emptyToUndefined(z.string().length(3));

// Frontend-specific invoice item schema with custom messages
const invoiceItemFormSchema = z.object({
  description: z.string().min(1, "Description is required."),
  quantity: numericString,
  unitPrice: numericString,
  taxRate: optionalNumericString,
});

// Frontend-specific invoice form schema with custom messages
const invoiceFormSchema = z
  .object({
    clientId: z.string().min(1, "Client is required."),
    issueDate: optionalDate,
    dueDate: optionalDate,
    currency: optionalCurrency,
    discountType: emptyToUndefined(z.enum(["percentage", "fixed"])),
    discountValue: optionalNumericString,
    shippingAmount: optionalNumericString,
    shippingTaxRate: optionalNumericString,
    notes: optionalString,
    terms: optionalString,
    items: z.array(invoiceItemFormSchema).min(1, "Add at least one line item."),
  })
  .superRefine((data, ctx) => {
    if (data.discountType && data.discountValue === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["discountValue"],
        message: "Discount value is required when discount type is set.",
      });
    }

    if (!data.discountType && data.discountValue !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["discountType"],
        message: "Discount type is required when discount value is set.",
      });
    }
  });

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

type InvoiceFormProps = {
  invoiceId?: string;
  initialValues?: Partial<InvoiceFormValues>;
};

// Client type for form usage (simplified from Prisma)
type Client = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  taxId?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  currency?: string | null;
};

const toDateInput = (value?: string | null) =>
  value ? new Date(value).toISOString().slice(0, 10) : "";

const toStringOrEmpty = (value: unknown) =>
  value === null || value === undefined ? "" : String(value);

const parseNumber = (value?: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const readClientError = (
  error: { message?: string; statusText?: string } | null | undefined,
  fallback: string
) => error?.message || error?.statusText || fallback;

const selectClassName =
  "border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs focus-visible:ring-[3px]";

const textareaClassName =
  "border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 min-h-[96px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:ring-[3px]";

const lightThemeStyle = {
  "--background": "oklch(1 0 0)",
  "--foreground": "oklch(0.145 0 0)",
  "--card": "oklch(1 0 0)",
  "--card-foreground": "oklch(0.145 0 0)",
  "--popover": "oklch(1 0 0)",
  "--popover-foreground": "oklch(0.145 0 0)",
  "--primary": "oklch(0.205 0 0)",
  "--primary-foreground": "oklch(0.985 0 0)",
  "--secondary": "oklch(0.97 0 0)",
  "--secondary-foreground": "oklch(0.205 0 0)",
  "--muted": "oklch(0.97 0 0)",
  "--muted-foreground": "oklch(0.556 0 0)",
  "--accent": "oklch(0.97 0 0)",
  "--accent-foreground": "oklch(0.205 0 0)",
  "--destructive": "oklch(0.577 0.245 27.325)",
  "--destructive-foreground": "oklch(0.577 0.245 27.325)",
  "--border": "oklch(0.922 0 0)",
  "--input": "oklch(0.922 0 0)",
  "--ring": "oklch(0.708 0 0)",
} as CSSProperties;

const formatAddressLines = (client: Client) => {
  const lines: string[] = [];

  if (client.addressLine1) lines.push(client.addressLine1);
  if (client.addressLine2) lines.push(client.addressLine2);

  const cityLine = [client.city, client.state, client.postalCode]
    .filter(Boolean)
    .join(", ");
  if (cityLine) lines.push(cityLine);
  if (client.country) lines.push(client.country);

  return lines;
};

export function InvoiceForm({ invoiceId, initialValues }: InvoiceFormProps) {
  const router = useRouter();
  const isEditing = Boolean(invoiceId);
  const defaultItems =
    initialValues?.items && initialValues.items.length > 0
      ? initialValues.items.map((item) => ({
          description: item.description ?? "",
          quantity:
            item.quantity === null || item.quantity === undefined
              ? "1"
              : String(item.quantity),
          unitPrice: toStringOrEmpty(item.unitPrice),
          taxRate: toStringOrEmpty(item.taxRate),
        }))
      : [{ description: "", quantity: "1", unitPrice: "", taxRate: "" }];

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    setValue,
    watch,
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      clientId: initialValues?.clientId ?? "",
      issueDate: toDateInput(initialValues?.issueDate),
      dueDate: toDateInput(initialValues?.dueDate),
      currency: initialValues?.currency ?? "",
      discountType: initialValues?.discountType ?? "",
      discountValue: toStringOrEmpty(initialValues?.discountValue),
      shippingAmount: toStringOrEmpty(initialValues?.shippingAmount),
      shippingTaxRate: toStringOrEmpty(initialValues?.shippingTaxRate),
      notes: initialValues?.notes ?? "",
      terms: initialValues?.terms ?? "",
      items: defaultItems,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [clientsError, setClientsError] = useState<string | null>(null);
  const [isLoadingClients, setIsLoadingClients] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadClients = async () => {
      setIsLoadingClients(true);
      setClientsError(null);

      try {
        const response = await authClient.$fetch<{ data: Client[] }>(
          `${env.NEXT_PUBLIC_API_URL}/clients`,
          { method: "GET" }
        );

        if (!isMounted) return;

        if (response.error) {
          setClientsError(
            readClientError(response.error, "Unable to load clients.")
          );
          setClients([]);
          return;
        }

        setClients(response.data?.data ?? []);
      } catch {
        if (!isMounted) return;
        setClientsError("Unable to load clients.");
        setClients([]);
      } finally {
        if (!isMounted) return;
        setIsLoadingClients(false);
      }
    };

    void loadClients();

    return () => {
      isMounted = false;
    };
  }, []);

  const watchedClientId = watch("clientId");
  const watchedCurrency = watch("currency");
  const watchedItems = watch("items");
  const watchedDiscountType = watch("discountType");
  const watchedDiscountValue = watch("discountValue");
  const watchedShippingAmount = watch("shippingAmount");
  const watchedShippingTaxRate = watch("shippingTaxRate");

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === watchedClientId) ?? null,
    [clients, watchedClientId]
  );

  useEffect(() => {
    if (!selectedClient?.currency) return;
    if (!watchedCurrency) {
      setValue("currency", selectedClient.currency.toUpperCase(), {
        shouldValidate: true,
      });
    }
  }, [selectedClient?.currency, setValue, watchedCurrency]);

  const resolvedCurrency = (
    watchedCurrency ||
    selectedClient?.currency ||
    "USD"
  ).toUpperCase();

  const formatCurrencyValue = (amount: number) => {
    if (!Number.isFinite(amount)) return "-";
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: resolvedCurrency,
      }).format(amount);
    } catch {
      return `${amount.toFixed(2)} ${resolvedCurrency}`;
    }
  };

  const subtotal = (watchedItems ?? []).reduce((sum, item) => {
    return sum + parseNumber(item.quantity) * parseNumber(item.unitPrice);
  }, 0);

  let discountTotal = 0;
  const discountValue = parseNumber(watchedDiscountValue);
  if (watchedDiscountType === "percentage") {
    discountTotal = subtotal * (discountValue / 100);
  } else if (watchedDiscountType === "fixed") {
    discountTotal = discountValue;
  }
  if (discountTotal > subtotal) discountTotal = subtotal;

  const discountRatio = subtotal === 0 ? 0 : discountTotal / subtotal;

  const lineTaxTotal = (watchedItems ?? []).reduce((sum, item) => {
    const lineSubtotal =
      parseNumber(item.quantity) * parseNumber(item.unitPrice);
    const discountedLine = lineSubtotal - lineSubtotal * discountRatio;
    return sum + discountedLine * parseNumber(item.taxRate);
  }, 0);

  const shippingAmount = parseNumber(watchedShippingAmount);
  const shippingTax = shippingAmount * parseNumber(watchedShippingTaxRate);
  const totalTax = lineTaxTotal + shippingTax;
  const total = subtotal - discountTotal + totalTax + shippingAmount;

  const onSubmit = async (values: InvoiceFormValues) => {
    const { clientId, ...payloadBase } = values;
    const payload = {
      ...payloadBase,
      issueDate: values.issueDate
        ? new Date(values.issueDate).toISOString()
        : undefined,
      dueDate: values.dueDate
        ? new Date(values.dueDate).toISOString()
        : undefined,
      ...(isEditing ? {} : { clientId }),
    };

    const endpoint = invoiceId ? `/invoices/${invoiceId}` : "/invoices";
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      method: isEditing ? "PATCH" : "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setError("root", {
        message: isEditing
          ? "Unable to update invoice."
          : "Unable to create invoice.",
      });
      return;
    }

    if (isEditing) {
      router.push(`/dashboard/invoices/${invoiceId}`);
      router.refresh();
      return;
    }

    const payloadResponse = (await response.json().catch(() => null)) as {
      invoice?: { id?: string };
    } | null;
    const nextId = payloadResponse?.invoice?.id;

    router.push(
      nextId ? `/dashboard/invoices/${nextId}` : "/dashboard/invoices"
    );
    router.refresh();
  };

  return (
    <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
      <div
        className="space-y-8 rounded-xl border p-6 shadow-sm max-w-6xl"
        style={lightThemeStyle}
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded px-2 py-1 text-xs font-semibold uppercase">
                Draft
              </span>
              <h2 className="text-2xl font-semibold">Invoice</h2>
              <span className="text-sm ">Number assigned on save</span>
            </div>
            <Field>
              <FieldLabel htmlFor="terms">Description</FieldLabel>
              <FieldContent>
                <textarea
                  id="terms"
                  className={textareaClassName}
                  placeholder="Add description..."
                  {...register("terms")}
                  aria-invalid={!!errors.terms}
                />
                <FieldError errors={[errors.terms]} />
              </FieldContent>
            </Field>
          </div>
          <div className="w-full max-w-xs space-y-4">
            <div className="rounded-lg border  p-4 text-sm">
              <div className="text-xs uppercase">Invoice details</div>
              <div className="mt-3 space-y-3">
                <Field>
                  <FieldLabel htmlFor="issueDate">Issue date</FieldLabel>
                  <FieldContent>
                    <Input
                      id="issueDate"
                      type="date"
                      {...register("issueDate")}
                      aria-invalid={!!errors.issueDate}
                    />
                    <FieldError errors={[errors.issueDate]} />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor="dueDate">Due date</FieldLabel>
                  <FieldContent>
                    <Input
                      id="dueDate"
                      type="date"
                      {...register("dueDate")}
                      aria-invalid={!!errors.dueDate}
                    />
                    <FieldError errors={[errors.dueDate]} />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor="currency">Currency</FieldLabel>
                  <FieldContent>
                    <Input
                      id="currency"
                      placeholder="USD"
                      {...register("currency")}
                      aria-invalid={!!errors.currency}
                    />
                    <FieldError errors={[errors.currency]} />
                  </FieldContent>
                </Field>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase ">From</div>
            <div className="rounded-lg border p-4 text-sm">
              <div className="font-medium">Your business</div>
              <div>
                Set your business profile to display address and tax details.
              </div>
              <a
                href="/dashboard/settings/account"
                className="mt-2 inline-block text-sm underline underline-offset-4"
              >
                Edit business profile
              </a>
            </div>
          </div>
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase">Bill to</div>
            <div className="space-y-3">
              <Field>
                <FieldContent>
                  <select
                    id="clientId"
                    className={selectClassName}
                    {...register("clientId")}
                    disabled={isEditing || isLoadingClients}
                    aria-invalid={!!errors.clientId}
                  >
                    <option value="">
                      {isLoadingClients
                        ? "Loading clients..."
                        : "Select a client"}
                    </option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                  <FieldError errors={[errors.clientId]} />
                  {clientsError ? (
                    <FieldError errors={[{ message: clientsError }]} />
                  ) : null}
                </FieldContent>
              </Field>

              <div className="rounded-lg border  p-4 text-sm">
                {selectedClient ? (
                  <div className="space-y-2">
                    <div className="font-medium">{selectedClient.name}</div>
                    {selectedClient.email ? (
                      <div>{selectedClient.email}</div>
                    ) : null}
                    {formatAddressLines(selectedClient).map((line) => (
                      <div key={line}>{line}</div>
                    ))}
                    {selectedClient.taxId ? (
                      <div>Tax ID: {selectedClient.taxId}</div>
                    ) : null}
                    <a
                      href={`/dashboard/clients/${selectedClient.id}/edit`}
                      className="inline-block text-sm underline underline-offset-4"
                    >
                      Edit client
                    </a>
                  </div>
                ) : (
                  <div>Choose a client to preview their billing details.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold uppercase ">Line items</div>
          </div>

          <div className="grid gap-2 text-xs font-semibold uppercase  md:grid-cols-[2fr_0.8fr_1fr_0.8fr_0.8fr_auto]">
            <div>Description</div>
            <div>Qty</div>
            <div>Rate</div>
            <div>Tax</div>
            <div className="text-right">Amount</div>
            <div className="text-right">Actions</div>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => {
              const lineSubtotal =
                parseNumber(watchedItems?.[index]?.quantity) *
                parseNumber(watchedItems?.[index]?.unitPrice);

              return (
                <div
                  key={field.id}
                  className="grid gap-3 rounded-lg border p-3 md:grid-cols-[2fr_0.8fr_1fr_0.8fr_0.8fr_auto]"
                >
                  <div>
                    <textarea
                      className={textareaClassName}
                      placeholder="Item name and description"
                      {...register(`items.${index}.description`)}
                      aria-invalid={!!errors.items?.[index]?.description}
                    />
                    <FieldError errors={[errors.items?.[index]?.description]} />
                  </div>
                  <div>
                    <Input
                      placeholder="1"
                      {...register(`items.${index}.quantity`)}
                      aria-invalid={!!errors.items?.[index]?.quantity}
                    />
                    <FieldError errors={[errors.items?.[index]?.quantity]} />
                  </div>
                  <div>
                    <Input
                      placeholder="0.00"
                      {...register(`items.${index}.unitPrice`)}
                      aria-invalid={!!errors.items?.[index]?.unitPrice}
                    />
                    <FieldError errors={[errors.items?.[index]?.unitPrice]} />
                  </div>
                  <div>
                    <Input
                      placeholder="0.00"
                      {...register(`items.${index}.taxRate`)}
                      aria-invalid={!!errors.items?.[index]?.taxRate}
                    />
                    <FieldError errors={[errors.items?.[index]?.taxRate]} />
                  </div>
                  <div className="flex items-center justify-end text-sm font-medium">
                    {formatCurrencyValue(lineSubtotal)}
                  </div>
                  <div className="flex items-start justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {errors.items ? <FieldError errors={[errors.items]} /> : null}

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              append({
                description: "",
                quantity: "1",
                unitPrice: "",
                taxRate: "",
              })
            }
          >
            Add line
          </Button>
        </div>

        <Separator />

        <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <Field>
              <FieldLabel htmlFor="notes">Invoice note</FieldLabel>
              <FieldContent>
                <textarea
                  id="notes"
                  className={textareaClassName}
                  placeholder="Add a note for the client..."
                  {...register("notes")}
                  aria-invalid={!!errors.notes}
                />
                <FieldError errors={[errors.notes]} />
              </FieldContent>
            </Field>
          </div>

          <div className="space-y-4 rounded-lg border  p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="">Subtotal</span>
              <span className="font-medium">
                {formatCurrencyValue(subtotal)}
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="discountType">Discount type</FieldLabel>
                <FieldContent>
                  <select
                    id="discountType"
                    className={selectClassName}
                    {...register("discountType")}
                    aria-invalid={!!errors.discountType}
                  >
                    <option value="">None</option>
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed amount</option>
                  </select>
                  <FieldError errors={[errors.discountType]} />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="discountValue">Discount value</FieldLabel>
                <FieldContent>
                  <Input
                    id="discountValue"
                    {...register("discountValue")}
                    aria-invalid={!!errors.discountValue}
                  />
                  <FieldError errors={[errors.discountValue]} />
                </FieldContent>
              </Field>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="shippingAmount">
                  Shipping amount
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="shippingAmount"
                    {...register("shippingAmount")}
                    aria-invalid={!!errors.shippingAmount}
                  />
                  <FieldError errors={[errors.shippingAmount]} />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="shippingTaxRate">
                  Shipping tax rate
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="shippingTaxRate"
                    {...register("shippingTaxRate")}
                    aria-invalid={!!errors.shippingTaxRate}
                  />
                  <FieldError errors={[errors.shippingTaxRate]} />
                </FieldContent>
              </Field>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="">Discount</span>
              <span className="font-medium">
                -{formatCurrencyValue(discountTotal)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="">Tax</span>
              <span className="font-medium">
                {formatCurrencyValue(totalTax)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="">Shipping</span>
              <span className="font-medium">
                {formatCurrencyValue(shippingAmount)}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrencyValue(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {errors.root ? <FieldError errors={[errors.root]} /> : null}

      <div className="flex items-center justify-end gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : isEditing
              ? "Update invoice"
              : "Create invoice"}
        </Button>
      </div>
    </form>
  );
}
