"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { env } from "@/env"
import { Button } from "@workspace/ui/components/button"
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"

type Member = {
  id: string
  role: string
  createdAt: string
  user: {
    id: string
    name?: string | null
    email?: string | null
  }
}

type Invitation = {
  id: string
  email: string
  role: string
  status: string
  createdAt: string
  expiresAt: string
}

type OrgRole = {
  id: string
  role: string
  permission: Record<string, string[]>
  createdAt: string
}

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString() : "-"

const authFetch = (path: string, init: RequestInit) =>
  fetch(`${env.NEXT_PUBLIC_API_URL}/api/auth${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  })

const readErrorMessage = async (response: Response) => {
  const text = await response.text()
  if (!text) return "Request failed."
  try {
    const data = JSON.parse(text) as { error?: string; message?: string }
    return data.error || data.message || text
  } catch {
    return text
  }
}

export function InviteMemberForm({ roles }: { roles: string[] }) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [role, setRole] = useState(roles[0] ?? "member")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError("Email is required.")
      return
    }

    setIsSubmitting(true)
    const response = await authFetch("/organization/invite-member", {
      method: "POST",
      body: JSON.stringify({ email: email.trim(), role: role || "member" }),
    })

    if (!response.ok) {
      setError(await readErrorMessage(response))
      setIsSubmitting(false)
      return
    }

    setEmail("")
    setRole(roles[0] ?? "member")
    setIsSubmitting(false)
    router.refresh()
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <FieldGroup>
        <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
          <Field>
            <FieldLabel htmlFor="invite-email">Email</FieldLabel>
            <FieldContent>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@company.com"
              />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="invite-role">Role</FieldLabel>
            <FieldContent>
              <select
                id="invite-role"
                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs focus-visible:ring-[3px]"
                value={role}
                onChange={(event) => setRole(event.target.value)}
              >
                {roles.map((roleOption) => (
                  <option key={roleOption} value={roleOption}>
                    {roleOption}
                  </option>
                ))}
              </select>
            </FieldContent>
          </Field>
        </div>
      </FieldGroup>
      {error ? <FieldError errors={[{ message: error }]} /> : null}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send invitation"}
      </Button>
    </form>
  )
}

export function MembersTable({
  members,
  roles,
}: {
  members: Member[]
  roles: string[]
}) {
  if (members.length === 0) {
    return <div className="text-muted-foreground text-sm">No members yet.</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-muted-foreground text-xs uppercase">
          <tr className="border-b">
            <th className="py-2 text-left font-medium">Member</th>
            <th className="py-2 text-left font-medium">Role</th>
            <th className="py-2 text-left font-medium">Joined</th>
            <th className="py-2 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              roles={roles}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MemberRow({
  member,
  roles,
}: {
  member: Member
  roles: string[]
}) {
  const router = useRouter()
  const [roleInput, setRoleInput] = useState(member.role)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const listId = `roles-${member.id}`

  const updateRole = async () => {
    setError(null)
    setIsUpdating(true)
    const response = await authFetch("/organization/update-member-role", {
      method: "POST",
      body: JSON.stringify({ memberId: member.id, role: roleInput }),
    })
    if (!response.ok) {
      setError(await readErrorMessage(response))
      setIsUpdating(false)
      return
    }
    setIsUpdating(false)
    router.refresh()
  }

  const removeMember = async () => {
    setError(null)
    setIsRemoving(true)
    const response = await authFetch("/organization/remove-member", {
      method: "POST",
      body: JSON.stringify({ memberIdOrEmail: member.id }),
    })
    if (!response.ok) {
      setError(await readErrorMessage(response))
      setIsRemoving(false)
      return
    }
    setIsRemoving(false)
    router.refresh()
  }

  return (
    <tr className="border-b last:border-0 align-top">
      <td className="py-3">
        <div className="font-medium">
          {member.user.name ?? member.user.email ?? "Member"}
        </div>
        <div className="text-muted-foreground text-xs">{member.user.email}</div>
      </td>
      <td className="py-3">
        <input
          className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs focus-visible:ring-[3px]"
          value={roleInput}
          onChange={(event) => setRoleInput(event.target.value)}
          list={listId}
        />
        <datalist id={listId}>
          {roles.map((role) => (
            <option key={role} value={role} />
          ))}
        </datalist>
        {error ? (
          <div className="text-destructive text-xs mt-1">{error}</div>
        ) : null}
      </td>
      <td className="py-3">{formatDate(member.createdAt)}</td>
      <td className="py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={updateRole}
            disabled={isUpdating}
          >
            {isUpdating ? "Saving..." : "Update role"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={removeMember}
            disabled={isRemoving}
          >
            {isRemoving ? "Removing..." : "Remove"}
          </Button>
        </div>
      </td>
    </tr>
  )
}

export function InvitationsTable({
  invitations,
}: {
  invitations: Invitation[]
}) {
  if (invitations.length === 0) {
    return <div className="text-muted-foreground text-sm">No invitations.</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-muted-foreground text-xs uppercase">
          <tr className="border-b">
            <th className="py-2 text-left font-medium">Email</th>
            <th className="py-2 text-left font-medium">Role</th>
            <th className="py-2 text-left font-medium">Status</th>
            <th className="py-2 text-left font-medium">Sent</th>
            <th className="py-2 text-left font-medium">Expires</th>
            <th className="py-2 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {invitations.map((invitation) => (
            <InvitationRow
              key={invitation.id}
              invitation={invitation}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function InvitationRow({
  invitation,
}: {
  invitation: Invitation
}) {
  const router = useRouter()
  const [isCanceling, setIsCanceling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const canCancel = invitation.status === "pending"

  const cancelInvitation = async () => {
    setError(null)
    setIsCanceling(true)
    const response = await authFetch("/organization/cancel-invitation", {
      method: "POST",
      body: JSON.stringify({ invitationId: invitation.id }),
    })
    if (!response.ok) {
      setError(await readErrorMessage(response))
      setIsCanceling(false)
      return
    }
    setIsCanceling(false)
    router.refresh()
  }

  return (
    <tr className="border-b last:border-0">
      <td className="py-3">{invitation.email}</td>
      <td className="py-3">{invitation.role}</td>
      <td className="py-3 capitalize">{invitation.status}</td>
      <td className="py-3">{formatDate(invitation.createdAt)}</td>
      <td className="py-3">{formatDate(invitation.expiresAt)}</td>
      <td className="py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          {error ? (
            <span className="text-destructive text-xs">{error}</span>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canCancel || isCanceling}
            onClick={cancelInvitation}
          >
            {isCanceling ? "Canceling..." : "Cancel"}
          </Button>
        </div>
      </td>
    </tr>
  )
}

export function RolesTable({ roles }: { roles: OrgRole[] }) {
  return (
    <div className="space-y-6">
      <CreateRoleForm />
      {roles.length === 0 ? (
        <div className="text-muted-foreground text-sm">
          No custom roles yet.
        </div>
      ) : (
        <div className="space-y-4">
          {roles.map((role) => (
            <RoleCard key={role.id} role={role} />
          ))}
        </div>
      )}
    </div>
  )
}

function CreateRoleForm() {
  const router = useRouter()
  const [roleName, setRoleName] = useState("")
  const [permissions, setPermissions] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!roleName.trim()) {
      setError("Role name is required.")
      return
    }

    let parsedPermissions: Record<string, string[]> | undefined
    if (permissions.trim()) {
      try {
        parsedPermissions = JSON.parse(permissions) as Record<string, string[]>
      } catch {
        setError("Permissions must be valid JSON.")
        return
      }
    }

    setIsSubmitting(true)
    const body = parsedPermissions
      ? { role: roleName.trim(), permission: parsedPermissions }
      : { role: roleName.trim() }
    const response = await authFetch("/organization/create-role", {
      method: "POST",
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      setError(await readErrorMessage(response))
      setIsSubmitting(false)
      return
    }

    setRoleName("")
    setPermissions("")
    setIsSubmitting(false)
    router.refresh()
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="role-name">Role name</FieldLabel>
          <FieldContent>
            <Input
              id="role-name"
              value={roleName}
              onChange={(event) => setRoleName(event.target.value)}
              placeholder="sales"
            />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="role-permissions">Permissions (JSON)</FieldLabel>
          <FieldContent>
            <textarea
              id="role-permissions"
              className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 min-h-[120px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:ring-[3px]"
              value={permissions}
              onChange={(event) => setPermissions(event.target.value)}
              placeholder='{"client":["read"],"invoice":["read","create"]}'
            />
          </FieldContent>
        </Field>
      </FieldGroup>
      {error ? <FieldError errors={[{ message: error }]} /> : null}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create role"}
      </Button>
    </form>
  )
}

function RoleCard({ role }: { role: OrgRole }) {
  const router = useRouter()
  const [permissions, setPermissions] = useState(
    JSON.stringify(role.permission, null, 2)
  )
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const updateRole = async () => {
    setError(null)
    let parsedPermissions: Record<string, string[]>
    try {
      parsedPermissions = JSON.parse(permissions) as Record<string, string[]>
    } catch {
      setError("Permissions must be valid JSON.")
      return
    }

    setIsSaving(true)
    const response = await authFetch("/organization/update-role", {
      method: "POST",
      body: JSON.stringify({
        roleId: role.id,
        data: { permission: parsedPermissions },
      }),
    })

    if (!response.ok) {
      setError(await readErrorMessage(response))
      setIsSaving(false)
      return
    }

    setIsSaving(false)
    router.refresh()
  }

  const deleteRole = async () => {
    setError(null)
    setIsDeleting(true)
    const response = await authFetch("/organization/delete-role", {
      method: "POST",
      body: JSON.stringify({ roleId: role.id }),
    })
    if (!response.ok) {
      setError(await readErrorMessage(response))
      setIsDeleting(false)
      return
    }
    setIsDeleting(false)
    router.refresh()
  }

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="font-medium">{role.role}</div>
          <div className="text-muted-foreground text-xs">
            Created {new Date(role.createdAt).toLocaleDateString()}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={updateRole}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Update"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={deleteRole}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
      <textarea
        className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 min-h-[140px] w-full rounded-md border bg-transparent px-3 py-2 text-xs shadow-xs focus-visible:ring-[3px]"
        value={permissions}
        onChange={(event) => setPermissions(event.target.value)}
      />
      {error ? <div className="text-destructive text-xs">{error}</div> : null}
    </div>
  )
}
