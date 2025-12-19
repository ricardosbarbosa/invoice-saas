"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,
  Building2,
  Frame,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  organization,
  useActiveOrganization,
  useListOrganizations,
  useSession,
} from "@/lib/auth-client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@workspace/ui/components/sidebar"
import { useRouter } from "next/navigation"

// This is sample data.
const data = {
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const { data: session } = useSession()
  const { data: organizations, isPending: isOrganizationsLoading } =
    useListOrganizations()
  const { data: activeOrganization } = useActiveOrganization()
  const [isSwitching, startTransition] = React.useTransition()

  const teams = (organizations ?? []).map((org) => ({
    id: org.id,
    name: org.name,
    plan: org.slug ?? "Organization",
    logo: Building2,
  }))

  const handleSelectTeam = (team: (typeof teams)[number]) => {
    startTransition(async () => {
      await organization.setActive(
        { organizationId: team.id },
        {
          onSuccess: () => {
            router.refresh()
          },
        }
      )
    })
  }

  const handleAddTeam = () => {
    router.push("/organizations/select")
  }

  const user = {
    name: session?.user?.name ?? session?.user?.email ?? "User",
    email: session?.user?.email ?? "",
    avatar: session?.user?.image ?? null,
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher
          teams={teams}
          activeTeamId={activeOrganization?.id}
          onSelectTeam={handleSelectTeam}
          onAddTeam={handleAddTeam}
          isBusy={isSwitching || isOrganizationsLoading}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
