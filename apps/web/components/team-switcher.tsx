"use client"

import * as React from "react"
import { Building2, Check, ChevronsUpDown, Plus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@workspace/ui/components/sidebar"

type Team = {
  id: string
  name: string
  plan?: string | null
  logo?: React.ElementType
}

export function TeamSwitcher({
  teams,
  activeTeamId,
  onSelectTeam,
  onAddTeam,
  isBusy,
}: {
  teams: Team[]
  activeTeamId?: string | null
  onSelectTeam?: (team: Team) => void
  onAddTeam?: () => void
  isBusy?: boolean
}) {
  const { isMobile } = useSidebar()
  const activeTeam =
    teams.find((team) => team.id === activeTeamId) ?? teams[0]

  if (!activeTeam) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" onClick={onAddTeam} disabled={isBusy}>
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <Building2 className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">No organization</span>
              <span className="truncate text-xs text-muted-foreground">
                Create or join one
              </span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  const ActiveLogo = activeTeam.logo ?? Building2

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <ActiveLogo className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeTeam.name}</span>
                <span className="truncate text-xs">
                  {activeTeam.plan ?? "Organization"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Organizations
            </DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem
                key={team.id}
                onClick={() => onSelectTeam?.(team)}
                className="gap-2 p-2"
                disabled={isBusy}
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  {team.logo ? (
                    <team.logo className="size-3.5 shrink-0" />
                  ) : (
                    <Building2 className="size-3.5 shrink-0" />
                  )}
                </div>
                <span className="flex-1">{team.name}</span>
                {team.id === activeTeam.id ? (
                  <Check className="size-4 text-muted-foreground" />
                ) : (
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={onAddTeam}
              disabled={isBusy}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">
                Add organization
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
