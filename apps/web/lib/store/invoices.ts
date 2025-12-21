import { ClientWithOrganization } from "@/app/dashboard/clients/columns";
import { invoicesApi } from "./api";
import { Prisma } from "@workspace/db";

export type InvoiceWithClient = Prisma.InvoiceGetPayload<{
  include: { client: true };
}>;

const invoiceApi = invoicesApi.injectEndpoints({
  endpoints: (build) => ({
    getInvoices: build.query<
      { data: InvoiceWithClient[] },
      { clientId?: string }
    >({
      query: ({ clientId }) => ({
        url: "/invoices",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        params: { clientId },
      }),
    }),
    getInvoiceById: build.query<InvoiceWithClient, { invoiceId: string }>({
      query: ({ invoiceId }) => ({
        url: `/invoices/${invoiceId}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }),
    }),
    createInvoice: build.mutation<
      InvoiceWithClient,
      { invoice: Omit<Prisma.InvoiceCreateManyInput, "organizationId"> }
    >({
      query: ({ invoice }) => ({
        url: "/invoices",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: invoice,
      }),
    }),
    updateInvoice: build.mutation<
      InvoiceWithClient,
      { invoiceId: string; invoice: Partial<InvoiceWithClient> }
    >({
      query: ({ invoiceId, invoice }) => ({
        url: `/invoices/${invoiceId}`,
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: invoice,
      }),
    }),
    deleteInvoice: build.mutation<void, { invoiceId: string }>({
      query: ({ invoiceId }) => ({
        url: `/invoices/${invoiceId}`,
        method: "DELETE",
        credentials: "include",
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetInvoicesQuery,
  useGetInvoiceByIdQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
} = invoiceApi;
