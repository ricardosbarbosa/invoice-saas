import { invoicesApi } from "./api";
import { Prisma } from "@workspace/db";

export type InvoiceTotals = {
  subtotal: string;
  discountTotal: string;
  taxTotal: string;
  shippingTotal: string;
  shippingTax: string;
  total: string;
};

export type InvoiceWithClientAndItems = Prisma.InvoiceGetPayload<{
  include: { client: true; items: true };
}> & { totals: InvoiceTotals };

const invoiceApi = invoicesApi.injectEndpoints({
  endpoints: (build) => ({
    getInvoices: build.query<
      { data: InvoiceWithClientAndItems[] },
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
    getInvoiceById: build.query<
      InvoiceWithClientAndItems,
      { invoiceId: string }
    >({
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
      InvoiceWithClientAndItems,
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
      InvoiceWithClientAndItems,
      { invoiceId: string; invoice: Partial<InvoiceWithClientAndItems> }
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
