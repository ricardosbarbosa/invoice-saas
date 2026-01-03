"use client";

import { createAuthClient } from "better-auth/react";
import { adminClient, organizationClient } from "better-auth/client/plugins";
import { env } from "../env";
import { ac, adminRoles, organizationRoles } from "@workspace/auth/permissions";

// NOTE: `@workspace/auth/permissions` and `better-auth/client/plugins` can end up
// resolving to different `better-auth` installations under pnpm (peer deps),
// which makes their types incompatible even when versions match.
// Casting here keeps the boundary stable for the app build.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const acForClient = ac as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adminRolesForClient = adminRoles as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const organizationRolesForClient = organizationRoles as any;

export const authClient = createAuthClient({
  baseURL: `${env.NEXT_PUBLIC_API_URL}/api/auth`,
  fetchOptions: {
    credentials: "include",
  },
  plugins: [
    adminClient({ ac: acForClient, roles: adminRolesForClient }),
    organizationClient({
      ac: acForClient,
      roles: organizationRolesForClient,
      dynamicAccessControl: { enabled: true },
    }),
  ],
});
