import { Separator } from "@workspace/ui/components/separator";
import { SidebarTrigger } from "@workspace/ui/components/sidebar";
import React from "react";
import { ModeToggle } from "./mode-toggle";

export default function PageHeader({
  title,
  actions,
}: {
  title: string | React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      <div className="ml-auto px-4 flex items-center gap-2">
        {actions}
        <ModeToggle enableSystem={false} />
      </div>
    </header>
  );
}
