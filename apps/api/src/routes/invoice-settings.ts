import type { FastifyPluginAsync } from "fastify"
import { z } from "zod"

import { getActiveOrganizationId, requireOrgPermission } from "../lib/organization"

const settingsSchema = z.object({
  prefixTemplate: z.string().min(1),
  numberPadding: z.number().int().min(1).max(10),
  defaultCurrency: z.string().length(3),
})

const settingsUpdateSchema = settingsSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one setting is required." }
)

const DEFAULT_SETTINGS = {
  prefixTemplate: "INV-YYYY-",
  numberPadding: 4,
  defaultCurrency: "USD",
}

const invoiceSettings: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    "/invoice-settings",
    { preHandler: fastify.authGuard },
    async (request, reply) => {
      const organizationId = getActiveOrganizationId(request, reply)
      if (!organizationId) return

      const allowed = await requireOrgPermission(
        request,
        reply,
        { invoiceSettings: ["read"] },
        organizationId
      )
      if (!allowed) return

      const settings = await fastify.prisma.invoiceSettings.upsert({
        where: { organizationId },
        create: {
          organizationId,
          ...DEFAULT_SETTINGS,
        },
        update: {},
      })

      return { settings }
    }
  )

  fastify.patch(
    "/invoice-settings",
    { preHandler: fastify.authGuard },
    async (request, reply) => {
      const organizationId = getActiveOrganizationId(request, reply)
      if (!organizationId) return

      const allowed = await requireOrgPermission(
        request,
        reply,
        { invoiceSettings: ["update"] },
        organizationId
      )
      if (!allowed) return

      const body = settingsUpdateSchema.parse(request.body)
      const update: Partial<typeof DEFAULT_SETTINGS> = {}

      if (body.prefixTemplate !== undefined) {
        update.prefixTemplate = body.prefixTemplate
      }
      if (body.numberPadding !== undefined) {
        update.numberPadding = body.numberPadding
      }
      if (body.defaultCurrency !== undefined) {
        update.defaultCurrency = body.defaultCurrency.toUpperCase()
      }

      const settings = await fastify.prisma.invoiceSettings.upsert({
        where: { organizationId },
        create: {
          organizationId,
          ...DEFAULT_SETTINGS,
          ...update,
        },
        update,
      })

      return { settings }
    }
  )
}

export default invoiceSettings
