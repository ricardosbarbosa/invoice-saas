"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Ban, Eye, MoreHorizontal, ShieldOff, UnlockIcon, UserCog, UserX, UserX2 } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { DataTableColumnHeader } from "@workspace/ui/components/data-table/data-table-column-header";
import { UserWithRole } from "better-auth/plugins";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

export const columns: ColumnDef<UserWithRole>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  //   { accessorKey: "id", header: "ID" },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
  },
  {
    accessorKey: "emailVerified",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email Verified" />
    ),
  },

  {
    accessorKey: "image",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Image" />
    ),
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
  },
  {
    accessorKey: "banned",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Banned" />
    ),
  },
  {
    accessorKey: "banReason",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ban Reason" />
    ),
  },
  {
    accessorKey: "banExpires",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ban Expires" />
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => {
      return <div>{row.original.createdAt.toLocaleString()}</div>;
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Updated At" />
    ),
    cell: ({ row }) => {
      return <div>{row.original.updatedAt.toLocaleString()}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/admin/users/${row.original.id}/sessions`}>
                <Eye className="h-4 w-4" />
                <span>View Sessions</span>
              </Link>
            </DropdownMenuItem>
            {row.original.banned ? (
              <DropdownMenuItem
                onClick={() => {
                  authClient.admin.unbanUser({ userId: row.original.id });
                }}
              >
                <UnlockIcon className="h-4 w-4" />
                Unban
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => {
                  authClient.admin.banUser({ userId: row.original.id });
                }}
              >
                <Ban className="h-4 w-4" />
                Ban
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => {
                authClient.admin.impersonateUser({ userId: row.original.id });
              }}
            >
              <UserCog className="h-4 w-4" />
              Impersonate
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                authClient.admin.revokeUserSessions({
                  userId: row.original.id,
                });
              }}
            >
              <ShieldOff className="h-4 w-4" />
              Revoke All User Sessions
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                authClient.admin.removeUser({ userId: row.original.id });
              }}
            >
              <UserX2 className="h-4 w-4" />
              Remove User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
