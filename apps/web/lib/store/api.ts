// Need to use the React-specific entry point to import createApi
import { env } from "@/env";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define a service using a base URL and expected endpoints
export const invoicesApi = createApi({
  reducerPath: "invoicesApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${env.NEXT_PUBLIC_API_URL}/api` }),
  endpoints: () => ({}),
});
