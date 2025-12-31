import type { FastifyPluginAsync } from "fastify";
import { clientSchema, clientUpdateSchema } from "@workspace/types";
import {
  getActiveOrganizationId,
  requireOrgPermission,
} from "../lib/organization.js";
import z from "zod";

const paramsSchema = z.object({
  clientId: z.string().min(1),
});

const clients: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    "/clients",
    { preHandler: fastify.authGuard },
    async (request, reply) => {
      const organizationId = getActiveOrganizationId(request, reply);
      if (!organizationId) return;

      const allowed = await requireOrgPermission(
        request,
        reply,
        {
          client: ["read"],
        },
        organizationId
      );
      if (!allowed) return;

      const clients = await fastify.prisma.client.findMany({
        where: { organizationId },
        include: { organization: true },
        orderBy: { name: "asc" },
      });

      return { data: clients };
    }
  );

  fastify.post(
    "/clients",
    { preHandler: fastify.authGuard },
    async (request, reply) => {
      const organizationId = getActiveOrganizationId(request, reply);
      if (!organizationId) return;

      const allowed = await requireOrgPermission(
        request,
        reply,
        {
          client: ["create"],
        },
        organizationId
      );
      if (!allowed) return;

      const body = clientSchema.parse(request.body);
      const client = await fastify.prisma.client.create({
        data: {
          organizationId,
          ...body,
        },
      });

      reply.code(201);
      return client;
    }
  );

  fastify.get(
    "/clients/:clientId",
    { preHandler: fastify.authGuard },
    async (request, reply) => {
      const organizationId = getActiveOrganizationId(request, reply);
      if (!organizationId) return;

      const allowed = await requireOrgPermission(
        request,
        reply,
        {
          client: ["read"],
        },
        organizationId
      );
      if (!allowed) return;

      const params = paramsSchema.parse(request.params);
      const client = await fastify.prisma.client.findFirst({
        where: { id: params.clientId, organizationId },
        include: { organization: true },
      });

      if (!client) {
        reply.code(404).send({ error: "CLIENT_NOT_FOUND" });
        return;
      }

      return client;
    }
  );

  fastify.patch(
    "/clients/:clientId",
    { preHandler: fastify.authGuard },
    async (request, reply) => {
      const organizationId = getActiveOrganizationId(request, reply);
      if (!organizationId) return;

      const allowed = await requireOrgPermission(
        request,
        reply,
        {
          client: ["update"],
        },
        organizationId
      );
      if (!allowed) return;

      const params = paramsSchema.parse(request.params);
      const body = clientUpdateSchema.parse(request.body);

      const existing = await fastify.prisma.client.findFirst({
        where: { id: params.clientId, organizationId },
      });

      if (!existing) {
        reply.code(404).send({ error: "CLIENT_NOT_FOUND" });
        return;
      }

      const client = await fastify.prisma.client.update({
        where: { id: params.clientId },
        data: {
          ...body,
        },
      });

      return client;
    }
  );

  fastify.delete(
    "/clients/:clientId",
    { preHandler: fastify.authGuard },
    async (request, reply) => {
      const organizationId = getActiveOrganizationId(request, reply);
      if (!organizationId) return;

      const allowed = await requireOrgPermission(
        request,
        reply,
        {
          client: ["archive"],
        },
        organizationId
      );
      if (!allowed) return;

      const params = paramsSchema.parse(request.params);
      const existing = await fastify.prisma.client.findFirst({
        where: { id: params.clientId, organizationId },
      });

      if (!existing) {
        reply.code(404).send({ error: "CLIENT_NOT_FOUND" });
        return;
      }

      const client = await fastify.prisma.client.update({
        where: { id: params.clientId },
        data: { status: "archived" },
      });

      return client;
    }
  );
};

export default clients;
