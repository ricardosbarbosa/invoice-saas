"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { authClient } from "@/lib/auth-client";
import { Button } from "@workspace/ui/components/button";
import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar";
import { redirect } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    data: session,
    isPending,
    error,
    refetch,
    isRefetching,
  } = authClient.useSession();

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div>
        Error: {error.message}.{" "}
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          Retry
        </Button>
        {isRefetching && <span>Refetching...</span>}
      </div>
    );
  }

  if (!session) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
