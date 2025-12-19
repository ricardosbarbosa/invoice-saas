import Link from "next/link"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import { SidebarTrigger } from "@workspace/ui/components/sidebar"

export default function Page() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-lg font-semibold">Clients</h1>
        </div>
        <div className="ml-auto px-4">
          <Button asChild>
            <Link href="/dashboard/clients/new">New client</Link>
          </Button>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card>
          <CardHeader>
            <CardTitle>Client list</CardTitle>
            <CardDescription>
              Manage contacts and billing details for each organization.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground text-sm">
              No clients created yet.
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
