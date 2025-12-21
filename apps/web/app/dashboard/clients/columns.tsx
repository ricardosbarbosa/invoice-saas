"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  Archive,
  Eye,
  File,
  MoreHorizontal,
  Trash,
  UserRoundPen,
} from "lucide-react";

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
import Link from "next/link";
import { Prisma } from "@workspace/db";
import { ActionButton } from "@workspace/ui/components/action-button";

export type ClientWithOrganization = Prisma.ClientGetPayload<{
  include: { organization: true };
}> & {
  subtotal: string;
  discountTotal: string;
  taxTotal: string;
  shippingTotal: string;
  shippingTax: string;
  total: string;
};

export const columns: ({
  deleteClient,
}: {
  deleteClient: (clientId: string) => Promise<void>;
}) => ColumnDef<ClientWithOrganization>[] = ({ deleteClient }) => [
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
    accessorKey: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
  },
  {
    accessorKey: "taxId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tax ID" />
    ),
  },
  {
    id: "address",
    header: "Address",
    cell: ({ row }) => {
      const address = [
        row.original.addressLine1,
        row.original.addressLine2,
        row.original.city,
        row.original.state,
        row.original.postalCode,
        row.original.country,
      ]
        .filter(Boolean)
        .join(", ");
      return <div>{address}</div>;
    },
  },
  {
    accessorKey: "currency",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Currency" />
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
  },
  {
    accessorKey: "notes",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Notes" />
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
              <Link href={`/dashboard/clients/${row.original.id}`}>
                <Eye className="h-4 w-4" />
                <span>View Client</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/invoices?clientId=${row.original.id}`}>
                <File className="h-4 w-4" />
                <span>View Invoices</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/clients/${row.original.id}/edit`}>
                <UserRoundPen className="h-4 w-4" />
                <span>Edit Client</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => {
                try {
                  await deleteClient(row.original.id);
                  return {
                    error: false,
                    message: "Client updated successfully",
                  };
                } catch {
                  return { error: true, message: "Failed to delete client" };
                }
              }}
            >
              <Archive className="h-4 w-4" />
              <span>Archive Client</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
