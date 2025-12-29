import type { FastifyReply, FastifyRequest } from "fastify";
import { auth } from "@workspace/auth";

type PermissionInput = Record<string, string[]>;

function headersFromRequestHeaders(headers: Record<string, any>) {
  const mapped = new Headers();

  for (const [key, value] of Object.entries(headers)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      value.forEach((item) => mapped.append(key, String(item)));
    } else {
      mapped.append(key, String(value));
    }
  }

  return mapped;
}

export function getActiveOrganizationId(
  request: FastifyRequest,
  reply: FastifyReply
) {
  // @ts-expect-error - authSession is not typed, issue with passKeys plugin
  const organizationId = request.authSession?.activeOrganizationId;
  if (!organizationId) {
    reply.code(400).send({ error: "NO_ACTIVE_ORGANIZATION" });
    return null;
  }

  return organizationId;
}

export async function requireOrgPermission(
  request: FastifyRequest,
  reply: FastifyReply,
  permissions: PermissionInput,
  organizationId?: string
) {
  try {
    // @ts-expect-error - auth.api.hasPermission is not typed, issue with passKeys plugin
    const result = await auth.api.hasPermission({
      headers: headersFromRequestHeaders(request.headers),
      body: {
        organizationId,
        permissions,
      },
    });

    if (!result?.success) {
      reply.code(403).send({ error: "FORBIDDEN" });
      return false;
    }

    return true;
  } catch (error) {
    request.log.error({ error }, "Permission check failed");
    reply.code(403).send({ error: "FORBIDDEN" });
    return false;
  }
}
