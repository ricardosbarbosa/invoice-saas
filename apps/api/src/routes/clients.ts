import type { FastifyPluginAsync } from "fastify"
import { z } from "zod"
import { getActiveOrganizationId, requireOrgPermission } from "../lib/organization"

const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => (value === "" ? undefined : value), schema.optional())

const optionalString = emptyToUndefined(z.string())
const optionalEmail = emptyToUndefined(z.string().email())
const optionalCurrency = emptyToUndefined(z.string().length(3))

const clientSchema = z.object({
  name: z.string().min(1),
  email: optionalEmail,
  phone: optionalString,
  taxId: optionalString,
  addressLine1: optionalString,
  addressLine2: optionalString,
  city: optionalString,
  state: optionalString,
  postalCode: optionalString,
  country: optionalString,
  currency: optionalCurrency,
  notes: optionalString,
})

const clientUpdateSchema = clientSchema.partial().extend({
  status: z.enum(["active", "archived"]).optional(),
})

const paramsSchema = z.object({
  clientId: z.string().min(1),
})

const clients: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    "/clients",
    { preHandler: fastify.authGuard },
    async (request, reply) => {
      const organizationId = getActiveOrganizationId(request, reply)
      if (!organizationId) return

      const allowed = await requireOrgPermission(request, reply, {
        client: ["read"],
      }, organizationId)
      if (!allowed) return

      const clients = await fastify.prisma.client.findMany({
        where: { organizationId },
        orderBy: { name: "asc" },
      })

      return { clients }
    }
  )

  fastify.post(
    "/clients",
    { preHandler: fastify.authGuard },
    async (request, reply) => {
      const organizationId = getActiveOrganizationId(request, reply)
      if (!organizationId) return

      const allowed = await requireOrgPermission(request, reply, {
        client: ["create"],
      }, organizationId)
      if (!allowed) return

      const body = clientSchema.parse(request.body)
      const client = await fastify.prisma.client.create({
        data: {
          organizationId,
          ...body,
          currency: body.currency?.toUpperCase(),
        },
      })

      reply.code(201)
      return { client }
    }
  )

  fastify.get(
    "/clients/:clientId",
    { preHandler: fastify.authGuard },
    async (request, reply) => {
      const organizationId = getActiveOrganizationId(request, reply)
      if (!organizationId) return

      const allowed = await requireOrgPermission(request, reply, {
        client: ["read"],
      }, organizationId)
      if (!allowed) return

      const params = paramsSchema.parse(request.params)
      const client = await fastify.prisma.client.findFirst({
        where: { id: params.clientId, organizationId },
      })

      if (!client) {
        reply.code(404).send({ error: "CLIENT_NOT_FOUND" })
        return
      }

      return { client }
    }
  )

  fastify.patch(
    "/clients/:clientId",
    { preHandler: fastify.authGuard },
    async (request, reply) => {
      const organizationId = getActiveOrganizationId(request, reply)
      if (!organizationId) return

      const allowed = await requireOrgPermission(request, reply, {
        client: ["update"],
      }, organizationId)
      if (!allowed) return

      const params = paramsSchema.parse(request.params)
      const body = clientUpdateSchema.parse(request.body)

      const existing = await fastify.prisma.client.findFirst({
        where: { id: params.clientId, organizationId },
      })

      if (!existing) {
        reply.code(404).send({ error: "CLIENT_NOT_FOUND" })
        return
      }

      const client = await fastify.prisma.client.update({
        where: { id: params.clientId },
        data: {
          ...body,
          currency: body.currency?.toUpperCase(),
        },
      })

      return { client }
    }
  )

  fastify.delete(
    "/clients/:clientId",
    { preHandler: fastify.authGuard },
    async (request, reply) => {
      const organizationId = getActiveOrganizationId(request, reply)
      if (!organizationId) return

      const allowed = await requireOrgPermission(request, reply, {
        client: ["archive"],
      }, organizationId)
      if (!allowed) return

      const params = paramsSchema.parse(request.params)
      const existing = await fastify.prisma.client.findFirst({
        where: { id: params.clientId, organizationId },
      })

      if (!existing) {
        reply.code(404).send({ error: "CLIENT_NOT_FOUND" })
        return
      }

      const client = await fastify.prisma.client.update({
        where: { id: params.clientId },
        data: { status: "archived" },
      })

      return { client }
    }
  )
}

export default clients
