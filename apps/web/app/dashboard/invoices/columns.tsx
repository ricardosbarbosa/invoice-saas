"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  Archive,
  Eye,
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

export type InvoiceWithClient = Prisma.InvoiceGetPayload<{
  include: { client: true };
}>;

export const columns: ({
  deleteInvoice,
}: {
  deleteInvoice: (invoiceId: string) => Promise<void>;
}) => ColumnDef<InvoiceWithClient>[] = ({ deleteInvoice }) => [
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
    accessorKey: "client.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Client Name" />
    ),
  },
  {
    accessorKey: "number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Number" />
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
  },
  {
    accessorKey: "issueDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Issue Date" />
    ),
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Due Date" />
    ),
  },
  {
    accessorKey: "currency",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Currency" />
    ),
  },
  {
    accessorKey: "discountType",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Discount Type" />
    ),
  },
  {
    accessorKey: "discountValue",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Discount Value" />
    ),
  },
  {
    accessorKey: "shippingAmount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Shipping Amount" />
    ),
  },
  {
    accessorKey: "shippingTaxRate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Shipping Tax Rate" />
    ),
  },
  {
    accessorKey: "notes",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Notes" />
    ),
  },
  {
    accessorKey: "terms",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Terms" />
    ),
  },
  // {
  //   accessorKey: "items",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Items" />
  //   ),
  // },
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
              <Link href={`/dashboard/invoices/${row.original.id}`}>
                <Eye className="h-4 w-4" />
                <span>View Client</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/invoices/${row.original.id}/edit`}>
                <UserRoundPen className="h-4 w-4" />
                <span>Edit Invoice</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => {
                try {
                  await deleteInvoice(row.original.id);
                  return {
                    error: false,
                    message: "Invoice deleted successfully",
                  };
                } catch {
                  return { error: true, message: "Failed to delete invoice" };
                }
              }}
            >
              <Trash className="h-4 w-4" />
              <span>Delete Invoice</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
