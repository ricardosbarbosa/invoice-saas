"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import React, { useEffect, useState } from "react";
import { columns } from "./columns";
import { authClient } from "@/lib/auth-client";
import { UserWithRole } from "better-auth/plugins";
import { DataTable } from "./data-table";
import { PaginationState, SortingState } from "@tanstack/react-table";
import PageHeader from "@/components/page-header";

type UsersResponse = {
  users: UserWithRole[];
  total: number;
};

export default function UsersPage() {
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [sorting, setSorting] = useState<SortingState>([
    {
      desc: true,
      id: "name",
    },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [users, setUsers] = useState<UsersResponse>({ users: [], total: 0 });
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersResponse = await authClient.admin.listUsers({
        query: {
          searchValue: globalFilter,
          searchField: "email",
          searchOperator: "contains",
          sortBy: sorting[0]?.id ?? "name",
          sortDirection: sorting[0]?.desc ? "desc" : "asc",
          //   filterField: "email",
          //   filterValue: "hello@example.com",
          //   filterOperator: "eq",
          limit: pagination.pageSize,
          offset: pagination.pageIndex * pagination.pageSize,
        },
      });
      if (usersResponse.error) {
        setError(new Error(usersResponse.error.message));
      } else {
        setUsers(usersResponse.data);
      }
    };
    fetchUsers();
  }, [pagination, sorting, globalFilter]);

  const totalUsers = users.total;
  const totalPages = Math.ceil(totalUsers / pagination.pageSize);

  const data = users.users;

  return (
    <>
      <PageHeader title="Users" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card>
          <CardHeader>
            <CardTitle>User list</CardTitle>
            <CardDescription>Manage users and their roles.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={data}
              pageCount={totalPages}
              pagination={pagination}
              onPaginationChange={setPagination}
              sorting={sorting}
              onSortingChange={setSorting}
              globalFilter={globalFilter}
              onGlobalFilterChange={setGlobalFilter}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
