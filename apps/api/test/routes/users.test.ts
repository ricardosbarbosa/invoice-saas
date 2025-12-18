import { test } from 'node:test'
import * as assert from 'node:assert'
import { build } from '../helper'

process.env.DATABASE_URL ??= 'postgres://postgres:postgres@localhost:5432/postgres'
process.env.BETTER_AUTH_SECRET ??= 'test-test-test-test-test-test-1234'
process.env.CORS_ORIGIN ??= 'http://localhost:3000'

test('users/me returns 401 when no session is present', async (t) => {
  const app = await build(t)

  const res = await app.inject({
    url: '/users/me'
  })

  assert.strictEqual(res.statusCode, 401)
  assert.deepStrictEqual(JSON.parse(res.payload), { error: 'UNAUTHORIZED' })
})
