"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { organization, useActiveOrganization, useListOrganizations } from "@/lib/auth-client"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Separator } from "@workspace/ui/components/separator"

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export default function OrganizationSelectPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: activeOrg } = useActiveOrganization()
  const { data: organizations, isPending } = useListOrganizations()
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, startTransition] = useTransition()
  const allowExisting = searchParams.get("mode") === "manage"

  useEffect(() => {
    if (activeOrg && !allowExisting) {
      router.replace("/")
    }
  }, [activeOrg, allowExisting, router])

  const hasOrganizations = useMemo(() => (organizations?.length ?? 0) > 0, [organizations])

  const handleCreate = (event: React.FormEvent) => {
    event.preventDefault()
    if (!name) return
    setError(null)

    startTransition(async () => {
      await organization.create(
        { name, slug: slugify(name) },
        {
          onError: (ctx) => setError(ctx.error.message),
          onSuccess: async ({ data }) => {
            if (data?.id) {
              await organization.setActive({ organizationId: data.id })
              router.replace("/")
            }
          }
        }
      )
    })
  }

  const handleSelect = (orgId: string) => {
    setError(null)
    startTransition(async () => {
      await organization.setActive(
        { organizationId: orgId },
        {
          onError: (ctx) => setError(ctx.error.message),
          onSuccess: () => router.replace("/")
        }
      )
    })
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-gradient-to-br from-white via-slate-50 to-slate-100 p-6 md:p-10">
      <div className="w-full max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Choose an organization</h1>
          <p className="text-sm text-neutral-600">
            Select an existing organization or create a new one to continue.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your organizations</CardTitle>
            <CardDescription>
              You must have an active organization before accessing the app.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            {isPending ? (
              <p className="text-sm text-neutral-600">Loading organizations...</p>
            ) : hasOrganizations ? (
              <div className="space-y-3">
                {organizations?.map((org) => (
                  <div
                    key={org.id}
                    className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3 shadow-sm"
                  >
                    <div>
                      <p className="font-medium text-neutral-900">{org.name}</p>
                      <p className="text-xs text-neutral-500">{org.slug ?? org.id}</p>
                    </div>
                    <Button variant="secondary" onClick={() => handleSelect(org.id)} disabled={isSubmitting}>
                      Use this organization
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-600">No organizations found. Create one below to continue.</p>
            )}

            <Separator />

            <form onSubmit={handleCreate} className="space-y-3">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="org-name">Create organization</FieldLabel>
                  <Input
                    id="org-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Acme Inc."
                    required
                  />
                  <FieldDescription>We will use the name to generate a slug automatically.</FieldDescription>
                </Field>
                <Field>
                  <Button type="submit" disabled={isSubmitting || !name}>
                    {isSubmitting ? "Working..." : "Create and continue"}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
