import { FastifyPluginAsync } from 'fastify'
import { auth } from '@workspace/auth'

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

function serializeBody(body: unknown): BodyInit | undefined {
  if (body === undefined || body === null) return undefined
  if (typeof body === 'string' || Buffer.isBuffer(body)) {
    return body as unknown as BodyInit
  }
  if (body instanceof ArrayBuffer || body instanceof Uint8Array) {
    return body as unknown as BodyInit
  }
  return JSON.stringify(body)
}

const authRoutes: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.route({
    method: ['GET', 'POST'],
    url: '/api/auth/*',
    async handler(request, reply) {
      try {
        const url = new URL(request.url, `http://${request.headers.host}`)
        const incomingHeaders = headersFromRequestHeaders(request.headers)
        const requestBody = serializeBody(request.body)

        const response = await auth.handler(
          new Request(url.toString(), {
            method: request.method,
            headers: incomingHeaders,
            body: requestBody
          })
        )

        reply.status(response.status)
        response.headers.forEach((value: string, key: string) => reply.header(key, value))
        const bodyText = response.body ? await response.text() : null
        reply.send(bodyText)
      } catch (error) {
        fastify.log.error({ error }, 'Authentication handler failed')
        reply.status(500).send({ error: 'AUTH_HANDLER_FAILED' })
      }
    }
  })
}

export default authRoutes
