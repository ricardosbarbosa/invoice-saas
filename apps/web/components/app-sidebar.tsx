"use client"

import * as React from "react"
import {
  FileText,
  Users,
  Settings2,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { OrganizationSwitcher } from "@/components/organization-switcher"
import { authClient } from "@/lib/auth-client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@workspace/ui/components/sidebar"
import type { Organization } from "better-auth/plugins"
import { useRouter } from "next/navigation"

// This is sample data.
const data = {
  navMain: [
    {
      title: "Sales",
      url: "#",
      icon: FileText,
      isActive: true,
      items: [
        {
          title: "Clients",
          url: "/dashboard/clients",
        },
        {
          title: "Invoices",
          url: "/dashboard/invoices",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Invoice Settings",
          url: "/dashboard/settings/invoices",
        },
      ],
    },
    {
      title: "Organization",
      url: "#",
      icon: Users,
      items: [
        {
          title: "Members & Roles",
          url: "/dashboard/settings/roles",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const { useSession, useListOrganizations, useActiveOrganization, organization } =
    authClient
  const { data: session } = useSession()
  const { data: organizations, isPending: isOrganizationsLoading } =
    useListOrganizations()
  const { data: activeOrganization } = useActiveOrganization()
  const [isSwitching, startTransition] = React.useTransition()

  const orgs: Organization[] = organizations ?? []

  const handleSelectOrganization = (orgItem: Organization) => {
    startTransition(async () => {
      await organization.setActive(
        { organizationId: orgItem.id },
        {
          onSuccess: () => {
            router.refresh()
          },
        }
      )
    })
  }

  const handleAddOrganization = () => {
    router.push("/organizations/select?mode=manage")
  }

  const user = session?.user ?? null

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <OrganizationSwitcher
          organizations={orgs}
          activeOrganizationId={activeOrganization?.id}
          onSelectOrganization={handleSelectOrganization}
          onAddOrganization={handleAddOrganization}
          isBusy={isSwitching || isOrganizationsLoading}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
