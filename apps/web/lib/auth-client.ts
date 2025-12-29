"use client";

import { createAuthClient } from "better-auth/react";
import { adminClient, organizationClient } from "better-auth/client/plugins";
import { env } from "../env";
import { ac, adminRoles, organizationRoles } from "@workspace/auth/permissions";

export const authClient = createAuthClient({
  baseURL: `${env.NEXT_PUBLIC_API_URL}/api/auth`,
  fetchOptions: {
    credentials: "include",
  },
  plugins: [
    adminClient({ ac, roles: adminRoles }),
    organizationClient({
      ac,
      roles: organizationRoles,
      dynamicAccessControl: { enabled: true },
    }),
  ],
});
