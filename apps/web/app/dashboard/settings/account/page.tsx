"use client";
import PageHeader from "@/components/page-header";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { LinkIcon, Shield, User, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { AccountDeletion } from "./_components/account-deletion";
import { ProfileUpdateForm } from "./_components/profile-update-form";
import { AccountLinking } from "./_components/account-linking";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();

  const [tab, setTab] = useState(searchParams.get("tab") ?? "profile");
  useEffect(() => {
    setTab(searchParams.get("tab") ?? "profile");
  }, [searchParams]);
  return (
    <div>
      <PageHeader title="Account" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Tabs
          className="space-y-2"
          defaultValue="profile"
          defaultChecked
          value={tab}
          onValueChange={setTab}
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">
              <User />
              <span className="max-sm:hidden">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield />
              <span className="max-sm:hidden">Security</span>
            </TabsTrigger>
            <TabsTrigger value="accounts">
              <LinkIcon />
              <span className="max-sm:hidden">Accounts</span>
            </TabsTrigger>
            <TabsTrigger value="danger">
              <Trash2 />
              <span className="max-sm:hidden">Danger</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <ProfileUpdateForm />
          </TabsContent>
          <TabsContent value="accounts">
            <AccountLinking />
          </TabsContent>
          <TabsContent value="danger">
            <AccountDeletion />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
