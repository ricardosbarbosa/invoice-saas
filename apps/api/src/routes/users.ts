import { FastifyPluginAsync } from 'fastify'

const users: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get(
    '/users/me',
    {
      preHandler: fastify.authGuard
    },
    async (request) => {
      const context = request.authContext

      return {
        user: context?.user ?? null
      }
    }
  )
}

export default users
