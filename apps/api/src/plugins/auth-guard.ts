import fp from 'fastify-plugin'
import type { preHandlerHookHandler } from 'fastify'
import { auth, type AuthContext, type AuthSession } from '@workspace/auth'

declare module 'fastify' {
  interface FastifyInstance {
    authGuard: preHandlerHookHandler;
  }

  interface FastifyRequest {
    authContext?: AuthContext;
    authSession?: AuthSession;
  }
}

function headersFromRequestHeaders(headers: Record<string, any>) {
  const mapped = new Headers()

  for (const [key, value] of Object.entries(headers)) {
    if (value === undefined || value === null) continue
    if (Array.isArray(value)) {
      value.forEach((item) => mapped.append(key, String(item)))
    } else {
      mapped.append(key, String(value))
    }
  }

  return mapped
}

/**
 * Attaches a reusable authGuard hook that checks the Better Auth session.
 */
export default fp(async (fastify) => {
  const guard: preHandlerHookHandler = async (request, reply) => {
    const sessionResult = await auth.api.getSession({
      headers: headersFromRequestHeaders(request.headers)
    })

    if (!sessionResult || !sessionResult.session) {
      return reply.code(401).send({ error: 'UNAUTHORIZED' })
    }

    request.authContext = sessionResult
    request.authSession = sessionResult.session
  }

  fastify.decorate('authGuard', guard)
})
