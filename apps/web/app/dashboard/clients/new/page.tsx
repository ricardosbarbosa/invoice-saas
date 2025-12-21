"use client";
import Link from "next/link";

import { ClientForm, ClientFormValues } from "@/components/client-form";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import PageHeader from "@/components/page-header";
import { useCreateClientMutation } from "@/lib/store/clients";
import { toast } from "@workspace/ui/components/sonner";

export default function Page() {
  const [createClient] = useCreateClientMutation();

  const onSubmit = async (values: ClientFormValues) => {
    try {
      await createClient({ client: values });
      toast.success("Client created successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Unable to create client.");
    }
  };

  return (
    <>
      <PageHeader
        title="New client"
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard/clients">Back to clients</Link>
          </Button>
        }
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card>
          <CardHeader>
            <CardTitle>Client details</CardTitle>
            <CardDescription>
              Capture billing and contact information for invoicing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClientForm onSubmit={onSubmit} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
