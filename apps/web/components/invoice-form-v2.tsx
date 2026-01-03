"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { env } from "@/env";
import { Button } from "@workspace/ui/components/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { PlusIcon, TrashIcon } from "lucide-react";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { useGetClientsQuery } from "@/lib/store/clients";
import { DatePicker } from "@workspace/ui/components/date-picker";
import { invoiceCreateSchema } from "@workspace/types";

type InvoiceFormValues = z.infer<typeof invoiceCreateSchema>;

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
};

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

export function InvoiceFormV2({ invoiceId, initialValues }: InvoiceFormProps) {
  const router = useRouter();
  const isEditing = Boolean(invoiceId);
  const defaultItems =
    initialValues?.items && initialValues.items.length > 0
      ? initialValues.items.map((item) => ({
          description: item.description ?? "",
          quantity:
            item.quantity === null || item.quantity === undefined
              ? 1
              : item.quantity,
          unitPrice: item.unitPrice ?? 0,
        }))
      : [{ description: "", quantity: 1, unitPrice: 0 }];

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceCreateSchema),
    defaultValues: {
      clientId: initialValues?.clientId ?? "",
      issueDate: initialValues?.issueDate ?? new Date(),
      dueDate: initialValues?.dueDate ?? new Date(),
      currency: initialValues?.currency ?? "",
      notes: initialValues?.notes ?? "",
      items: defaultItems,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const { data: clientsData, isLoading: isLoadingClientsData } =
    useGetClientsQuery();
  const clients = clientsData?.data ?? [];

  const watchedClientId = watch("clientId");
  const watchedCurrency = watch("currency");
  const watchedItems = watch("items");

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === watchedClientId) ?? null,
    [clients, watchedClientId]
  );

  const resolvedCurrency = (watchedCurrency || "USD").toUpperCase();

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
    return sum + item.quantity * item.unitPrice;
  }, 0);

  const total = subtotal;

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
    <form
      className="space-y-8 container mx-auto"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Card>
        <CardContent className="flex space-x-4">
          <Controller
            name="clientId"
            control={control}
            render={({ field, fieldState }) => (
              <Field orientation="responsive" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="clientId">Client</FieldLabel>
                <FieldContent>
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id="clientId"
                      aria-invalid={fieldState.invalid}
                      className="w-full"
                    >
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent position="item-aligned">
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[errors.clientId]} />
                  )}
                </FieldContent>
              </Field>
            )}
          />
          {/* <Field>
                <FieldLabel htmlFor="clientId">Client</FieldLabel>

                <Select disabled={isEditing || isLoadingClientsData}>
                  <SelectTrigger
                    {...register("clientId")}
                    id="clientId"
                    aria-invalid={!!errors.clientId}
                  >
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[errors.clientId]} />
              </Field> */}

          <Field>
            <FieldLabel htmlFor="issueDate">Issue date</FieldLabel>
            <FieldContent>
              <DatePicker
                value={watch("issueDate")}
                disabled={register("issueDate").disabled}
                name={register("issueDate").name}
                onChange={(date) =>
                  register("issueDate").onChange({
                    target: { value: date },
                    type: "change",
                  })
                }
                required={register("issueDate").required}
                aria-invalid={!!errors.issueDate}
              />
              <FieldError errors={[errors.issueDate]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="dueDate">Due date</FieldLabel>
            <FieldContent>
              <DatePicker
                value={watch("dueDate")}
                disabled={register("dueDate").disabled}
                name={register("dueDate").name}
                onChange={(date) =>
                  register("dueDate").onChange({
                    target: { value: date },
                    type: "change",
                  })
                }
                required={register("dueDate").required}
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => {
            const lineSubtotal =
              (watchedItems?.[index]?.quantity || 0) *
              (watchedItems?.[index]?.unitPrice || 0);

            return (
              <div key={field.id} className="flex space-x-4 ">
                <Field>
                  <FieldLabel htmlFor={`items.${index}.description`}>
                    Description
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id={`items.${index}.description`}
                      placeholder="Item name and description"
                      {...register(`items.${index}.description`)}
                      aria-invalid={!!errors.items?.[index]?.description}
                    />
                    <FieldError errors={[errors.items?.[index]?.description]} />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor={`items.${index}.quantity`}>
                    Quantity
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id={`items.${index}.quantity`}
                      placeholder="1"
                      {...register(`items.${index}.quantity`)}
                      aria-invalid={!!errors.items?.[index]?.quantity}
                    />
                    <FieldError errors={[errors.items?.[index]?.quantity]} />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor={`items.${index}.unitPrice`}>
                    Rate
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id={`items.${index}.unitPrice`}
                      placeholder="1"
                      {...register(`items.${index}.unitPrice`)}
                      aria-invalid={!!errors.items?.[index]?.unitPrice}
                    />
                    <FieldError errors={[errors.items?.[index]?.unitPrice]} />
                  </FieldContent>
                </Field>

                <div className="flex items-center justify-end text-sm font-medium my-auto">
                  {formatCurrencyValue(lineSubtotal)}
                </div>

                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => remove(index)}
                  className="my-auto"
                >
                  <TrashIcon color="currentColor" className="size-4" />
                </Button>
              </div>
            );
          })}

          {errors.items ? <FieldError errors={[errors.items]} /> : null}

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              append({
                description: "",
                quantity: 1,
                unitPrice: 0,
              })
            }
          >
            <PlusIcon color="currentColor" className="size-4" />
            Add line
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes / Terms</CardTitle>
        </CardHeader>
        <CardContent>
          <Field>
            <FieldContent>
              <Textarea
                id="notes"
                placeholder="Add a note for the client..."
                {...register("notes")}
                aria-invalid={!!errors.notes}
              />
              <FieldError errors={[errors.notes]} />
            </FieldContent>
          </Field>
        </CardContent>
      </Card>

      {errors.root ? <FieldError errors={[errors.root]} /> : null}

      <CardAction className="flex items-center gap-4">
        <Button type="button" variant="secondary">
          Preview
        </Button>
        <Button type="submit" variant="default" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : isEditing
              ? "Update invoice"
              : "Create invoice"}
        </Button>
      </CardAction>
    </form>
  );
}
