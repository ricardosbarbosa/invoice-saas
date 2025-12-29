"use client";

import { Building2, Check, ChevronsUpDown, Plus } from "lucide-react";
import type { Organization } from "better-auth/plugins";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@workspace/ui/components/sidebar";

export function OrganizationSwitcher({
  organizations,
  activeOrganizationId,
  onSelectOrganization,
  onAddOrganization,
  isBusy,
}: {
  organizations: Organization[];
  activeOrganizationId?: string | null;
  onSelectOrganization?: (organization: Organization) => void;
  onAddOrganization?: () => void;
  isBusy?: boolean;
}) {
  const { isMobile } = useSidebar();
  const activeOrganization =
    organizations.find(
      (organization) => organization.id === activeOrganizationId
    ) ?? organizations[0];

  const logoStyle = (logo?: string | null) =>
    logo
      ? {
          backgroundImage: `url(${logo})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }
      : undefined;

  if (!activeOrganization) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            onClick={onAddOrganization}
            disabled={isBusy}
          >
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
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div
                className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
                style={logoStyle(activeOrganization.logo)}
              >
                {activeOrganization.logo ? null : (
                  <Building2 className="size-4" />
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {activeOrganization.name}
                </span>
                <span className="truncate text-xs">
                  {activeOrganization.slug || "Organization"}
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
            {organizations.map((organization, index) => (
              <DropdownMenuItem
                key={organization.id}
                onClick={() => onSelectOrganization?.(organization)}
                className="gap-2 p-2"
                disabled={isBusy}
              >
                <div
                  className="flex size-6 items-center justify-center rounded-md border"
                  style={logoStyle(organization.logo)}
                >
                  {organization.logo ? null : (
                    <Building2 className="size-3.5 shrink-0" />
                  )}
                </div>
                <span className="flex-1">{organization.name}</span>
                {organization.id === activeOrganization.id ? (
                  <Check className="size-4 text-muted-foreground" />
                ) : (
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={onAddOrganization}
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
  );
}
