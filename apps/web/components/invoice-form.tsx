"use client"

import { useRouter } from "next/navigation"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { env } from "@/env"
import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"

const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z
    .union([z.literal(""), schema])
    .optional()
    .transform((value) => (value === "" || value === undefined ? undefined : value))

const numericString = z
  .string()
  .min(1, "Required")
  .refine((value) => !Number.isNaN(Number(value)), "Must be a number")

const optionalNumericString = emptyToUndefined(numericString)
const optionalString = emptyToUndefined(z.string())
const optionalDate = emptyToUndefined(z.string())
const optionalCurrency = emptyToUndefined(z.string().length(3))

const invoiceItemSchema = z.object({
  description: z.string().min(1, "Description is required."),
  quantity: numericString,
  unitPrice: numericString,
  taxRate: optionalNumericString,
})

const invoiceFormSchema = z
  .object({
    clientId: z.string().min(1, "Client ID is required."),
    issueDate: optionalDate,
    dueDate: optionalDate,
    currency: optionalCurrency,
    discountType: emptyToUndefined(z.enum(["percentage", "fixed"])),
    discountValue: optionalNumericString,
    shippingAmount: optionalNumericString,
    shippingTaxRate: optionalNumericString,
    notes: optionalString,
    terms: optionalString,
    items: z.array(invoiceItemSchema).min(1, "Add at least one line item."),
  })
  .superRefine((data, ctx) => {
    if (data.discountType && data.discountValue === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["discountValue"],
        message: "Discount value is required when discount type is set.",
      })
    }

    if (!data.discountType && data.discountValue !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["discountType"],
        message: "Discount type is required when discount value is set.",
      })
    }
  })

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>

export function InvoiceForm() {
  const router = useRouter()
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      clientId: "",
      issueDate: "",
      dueDate: "",
      currency: "",
      discountType: undefined,
      discountValue: "",
      shippingAmount: "",
      shippingTaxRate: "",
      notes: "",
      terms: "",
      items: [{ description: "", quantity: "1", unitPrice: "", taxRate: "" }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  })

  const onSubmit = async (values: InvoiceFormValues) => {
    const payload = {
      ...values,
      issueDate: values.issueDate
        ? new Date(values.issueDate).toISOString()
        : undefined,
      dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : undefined,
    }

    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/invoices`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      setError("root", { message: "Unable to create invoice." })
      return
    }

    router.push("/dashboard/invoices")
    router.refresh()
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="clientId">Client ID</FieldLabel>
            <FieldContent>
              <Input id="clientId" {...register("clientId")} aria-invalid={!!errors.clientId} />
              <FieldError errors={[errors.clientId]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="currency">Currency</FieldLabel>
            <FieldContent>
              <Input id="currency" placeholder="USD" {...register("currency")} aria-invalid={!!errors.currency} />
              <FieldError errors={[errors.currency]} />
            </FieldContent>
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="issueDate">Issue date</FieldLabel>
            <FieldContent>
              <Input id="issueDate" type="date" {...register("issueDate")} aria-invalid={!!errors.issueDate} />
              <FieldError errors={[errors.issueDate]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="dueDate">Due date</FieldLabel>
            <FieldContent>
              <Input id="dueDate" type="date" {...register("dueDate")} aria-invalid={!!errors.dueDate} />
              <FieldError errors={[errors.dueDate]} />
            </FieldContent>
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="discountType">Discount type</FieldLabel>
            <FieldContent>
              <select
                id="discountType"
                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs focus-visible:ring-[3px]"
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
              <Input id="discountValue" {...register("discountValue")} aria-invalid={!!errors.discountValue} />
              <FieldError errors={[errors.discountValue]} />
            </FieldContent>
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="shippingAmount">Shipping amount</FieldLabel>
            <FieldContent>
              <Input id="shippingAmount" {...register("shippingAmount")} aria-invalid={!!errors.shippingAmount} />
              <FieldError errors={[errors.shippingAmount]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="shippingTaxRate">Shipping tax rate</FieldLabel>
            <FieldContent>
              <Input id="shippingTaxRate" {...register("shippingTaxRate")} aria-invalid={!!errors.shippingTaxRate} />
              <FieldError errors={[errors.shippingTaxRate]} />
            </FieldContent>
          </Field>
        </div>

        <Field>
          <FieldLabel>Line items</FieldLabel>
          <FieldContent className="gap-4">
            {fields.map((field, index) => (
              <div key={field.id} className="grid gap-3 md:grid-cols-[2fr_1fr_1fr_1fr_auto]">
                <Input
                  placeholder="Description"
                  {...register(`items.${index}.description`)}
                  aria-invalid={!!errors.items?.[index]?.description}
                />
                <Input
                  placeholder="Qty"
                  {...register(`items.${index}.quantity`)}
                  aria-invalid={!!errors.items?.[index]?.quantity}
                />
                <Input
                  placeholder="Unit price"
                  {...register(`items.${index}.unitPrice`)}
                  aria-invalid={!!errors.items?.[index]?.unitPrice}
                />
                <Input
                  placeholder="Tax rate"
                  {...register(`items.${index}.taxRate`)}
                  aria-invalid={!!errors.items?.[index]?.taxRate}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => remove(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  append({ description: "", quantity: "1", unitPrice: "", taxRate: "" })
                }
              >
                Add line item
              </Button>
            </div>
          </FieldContent>
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="notes">Notes</FieldLabel>
            <FieldContent>
              <Input id="notes" {...register("notes")} aria-invalid={!!errors.notes} />
              <FieldError errors={[errors.notes]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="terms">Payment terms</FieldLabel>
            <FieldContent>
              <Input id="terms" {...register("terms")} aria-invalid={!!errors.terms} />
              <FieldError errors={[errors.terms]} />
            </FieldContent>
          </Field>
        </div>
      </FieldGroup>

      {errors.root ? <FieldError errors={[errors.root]} /> : null}

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Create invoice"}
        </Button>
      </div>
    </form>
  )
}
