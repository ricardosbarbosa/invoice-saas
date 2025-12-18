import fp from 'fastify-plugin'
import { prisma } from '@workspace/db'

declare module 'fastify' {
  export interface FastifyInstance {
    prisma: typeof prisma;
  }
}

/**
 * Attaches a shared Prisma client to Fastify and cleans up on shutdown.
 */
export default fp(async (fastify) => {
  fastify.decorate('prisma', prisma)

  fastify.addHook('onClose', async () => {
    await fastify.prisma.$disconnect()
  })
})
