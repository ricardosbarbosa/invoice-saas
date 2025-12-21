"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";

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
import {
  useGetClientByIdQuery,
  useUpdateClientMutation,
} from "@/lib/store/clients";
import { toast } from "@workspace/ui/components/sonner";

export default function Page() {
  const params = useParams();
  const {
    data: client,
    isLoading,
    error,
  } = useGetClientByIdQuery({ clientId: params.clientId as string });

  const [updateClient] = useUpdateClientMutation();

  const onSubmit = async (values: ClientFormValues) => {
    try {
      await updateClient({
        clientId: params.clientId as string,
        client: values,
      });
      toast.success("Client updated successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Unable to update client.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card>
          <CardHeader>
            <CardTitle>Edit client</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground text-sm">Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!client) {
    notFound();
  }

  if (error) {
    return (
      <>
        <PageHeader
          title="Edit client"
          actions={
            <Button variant="outline" asChild>
              <Link href="/dashboard/clients">Back to clients</Link>
            </Button>
          }
        />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Card>
            <CardHeader>
              <CardTitle>Edit client</CardTitle>
              <CardDescription>
                Update client contact details and billing preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground text-sm">
                Unable to load this client.
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Edit client"
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard/clients">Back to clients</Link>
          </Button>
        }
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card>
          <CardHeader>
            <CardTitle>Edit client</CardTitle>
            <CardDescription>
              Update client contact details and billing preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClientForm
              clientId={client.id}
              initialValues={{
                name: client.name,
                email: client.email ?? "",
                phone: client.phone ?? "",
                taxId: client.taxId ?? "",
                addressLine1: client.addressLine1 ?? "",
                addressLine2: client.addressLine2 ?? "",
                city: client.city ?? "",
                state: client.state ?? "",
                postalCode: client.postalCode ?? "",
                country: client.country ?? "",
                currency: client.currency ?? "",
                notes: client.notes ?? "",
              }}
              onSubmit={onSubmit}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
