import fp from 'fastify-plugin'
import cors, { FastifyCorsOptions } from '@fastify/cors'
import { env } from '../env'

export default fp<FastifyCorsOptions>(async (fastify) => {
  await fastify.register(cors, {
    origin: env.CORS_ORIGIN ?? true
  })
})
