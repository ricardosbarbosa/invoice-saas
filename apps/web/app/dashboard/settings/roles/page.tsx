import { apiFetch } from "@/lib/api"
import {
  InviteMemberForm,
  InvitationsTable,
  MembersTable,
  RolesTable,
} from "@/components/organization/organization-management"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import { SidebarTrigger } from "@workspace/ui/components/sidebar"

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

const DEFAULT_ROLES = ["owner", "admin", "member"]

export default async function Page() {
  const [membersResponse, invitationsResponse, rolesResponse] =
    await Promise.allSettled([
      apiFetch("/api/auth/organization/list-members"),
      apiFetch("/api/auth/organization/list-invitations"),
      apiFetch("/api/auth/organization/list-roles"),
    ])

  const membersReady =
    membersResponse.status === "fulfilled" && membersResponse.value.ok
  const invitationsReady =
    invitationsResponse.status === "fulfilled" && invitationsResponse.value.ok
  const rolesReady =
    rolesResponse.status === "fulfilled" && rolesResponse.value.ok

  const members = membersReady
    ? (((await membersResponse.value.json()) as { members?: Member[] })
        .members ?? [])
    : []

  const invitations = invitationsReady
    ? ((await invitationsResponse.value.json()) as Invitation[])
    : []

  const roles = rolesReady
    ? ((await rolesResponse.value.json()) as OrgRole[])
    : []

  const roleOptions = Array.from(
    new Set([
      ...DEFAULT_ROLES,
      ...roles.map((role) => role.role),
    ])
  )

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-lg font-semibold">Members & roles</h1>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card>
          <CardHeader>
            <CardTitle>Invite members</CardTitle>
            <CardDescription>
              Send invitations and assign a starting role.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InviteMemberForm roles={roleOptions} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
            <CardDescription>
              Update member roles or remove access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {membersReady ? (
              <MembersTable
                members={members}
                roles={roleOptions}
              />
            ) : (
              <div className="text-muted-foreground text-sm">
                Unable to load members for this organization.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending invitations</CardTitle>
            <CardDescription>
              Track invites that have not been accepted yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invitationsReady ? (
              <InvitationsTable invitations={invitations} />
            ) : (
              <div className="text-muted-foreground text-sm">
                Unable to load invitations right now.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Roles</CardTitle>
            <CardDescription>
              Manage dynamic roles and access control permissions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border border-dashed p-4 text-sm">
              <div className="font-medium">Built-in roles</div>
              <div className="text-muted-foreground mt-1">
                Owner, admin, and member are always available and keep the
                default organization permissions.
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {DEFAULT_ROLES.map((role) => (
                  <span
                    key={role}
                    className="bg-muted rounded-full px-2 py-0.5 text-xs capitalize"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>

            {rolesReady ? (
              <RolesTable roles={roles} />
            ) : (
              <div className="text-muted-foreground text-sm">
                You do not have permission to view dynamic roles.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
