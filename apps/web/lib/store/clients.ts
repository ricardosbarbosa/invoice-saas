import { ClientWithOrganization } from "@/app/dashboard/clients/columns";
import { invoicesApi } from "./api";
import { Prisma } from "@workspace/db";

const clientsApi = invoicesApi.injectEndpoints({
  endpoints: (build) => ({
    getClients: build.query<{ data: ClientWithOrganization[] }, void>({
      query: () => ({
        url: "/clients",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }),
    }),
    getClientById: build.query<ClientWithOrganization, { clientId: string }>({
      query: ({ clientId }) => ({
        url: `/clients/${clientId}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }),
    }),
    createClient: build.mutation<
      ClientWithOrganization,
      { client: Omit<Prisma.ClientCreateManyInput, "organizationId"> }
    >({
      query: ({ client }) => ({
        url: "/clients",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: client,
      }),
    }),
    updateClient: build.mutation<
      ClientWithOrganization,
      { clientId: string; client: Partial<ClientWithOrganization> }
    >({
      query: ({ clientId, client }) => ({
        url: `/clients/${clientId}`,
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: client,
      }),
    }),
    deleteClient: build.mutation<void, { clientId: string }>({
      query: ({ clientId }) => ({
        url: `/clients/${clientId}`,
        method: "DELETE",
        credentials: "include",
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetClientsQuery,
  useGetClientByIdQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
} = clientsApi;
