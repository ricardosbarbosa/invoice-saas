"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
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

const clientFormSchema = z.object({
  name: z.string().min(1, "Client name is required."),
  email: emptyToUndefined(z.string().email()),
  phone: emptyToUndefined(z.string()),
  taxId: emptyToUndefined(z.string()),
  addressLine1: emptyToUndefined(z.string()),
  addressLine2: emptyToUndefined(z.string()),
  city: emptyToUndefined(z.string()),
  state: emptyToUndefined(z.string()),
  postalCode: emptyToUndefined(z.string()),
  country: emptyToUndefined(z.string()),
  currency: emptyToUndefined(z.string().length(3)),
  notes: emptyToUndefined(z.string()),
})

type ClientFormValues = z.infer<typeof clientFormSchema>

export function ClientForm() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      taxId: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      currency: "",
      notes: "",
    },
  })

  const onSubmit = async (values: ClientFormValues) => {
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/clients`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    })

    if (!response.ok) {
      setError("root", { message: "Unable to create client." })
      return
    }

    router.push("/dashboard/clients")
    router.refresh()
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="name">Client name</FieldLabel>
            <FieldContent>
              <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
              <FieldError errors={[errors.name]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <FieldContent>
              <Input id="email" type="email" {...register("email")} aria-invalid={!!errors.email} />
              <FieldError errors={[errors.email]} />
            </FieldContent>
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="phone">Phone</FieldLabel>
            <FieldContent>
              <Input id="phone" {...register("phone")} aria-invalid={!!errors.phone} />
              <FieldError errors={[errors.phone]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="taxId">Tax ID</FieldLabel>
            <FieldContent>
              <Input id="taxId" {...register("taxId")} aria-invalid={!!errors.taxId} />
              <FieldError errors={[errors.taxId]} />
            </FieldContent>
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="addressLine1">Address line 1</FieldLabel>
          <FieldContent>
            <Input
              id="addressLine1"
              {...register("addressLine1")}
              aria-invalid={!!errors.addressLine1}
            />
            <FieldError errors={[errors.addressLine1]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="addressLine2">Address line 2</FieldLabel>
          <FieldContent>
            <Input
              id="addressLine2"
              {...register("addressLine2")}
              aria-invalid={!!errors.addressLine2}
            />
            <FieldError errors={[errors.addressLine2]} />
          </FieldContent>
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="city">City</FieldLabel>
            <FieldContent>
              <Input id="city" {...register("city")} aria-invalid={!!errors.city} />
              <FieldError errors={[errors.city]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="state">State</FieldLabel>
            <FieldContent>
              <Input id="state" {...register("state")} aria-invalid={!!errors.state} />
              <FieldError errors={[errors.state]} />
            </FieldContent>
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="postalCode">Postal code</FieldLabel>
            <FieldContent>
              <Input
                id="postalCode"
                {...register("postalCode")}
                aria-invalid={!!errors.postalCode}
              />
              <FieldError errors={[errors.postalCode]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="country">Country</FieldLabel>
            <FieldContent>
              <Input id="country" {...register("country")} aria-invalid={!!errors.country} />
              <FieldError errors={[errors.country]} />
            </FieldContent>
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="currency">Default currency</FieldLabel>
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

          <Field>
            <FieldLabel htmlFor="notes">Notes</FieldLabel>
            <FieldContent>
              <Input id="notes" {...register("notes")} aria-invalid={!!errors.notes} />
              <FieldError errors={[errors.notes]} />
            </FieldContent>
          </Field>
        </div>
      </FieldGroup>

      {errors.root ? (
        <FieldError errors={[errors.root]} />
      ) : null}

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Create client"}
        </Button>
      </div>
    </form>
  )
}
