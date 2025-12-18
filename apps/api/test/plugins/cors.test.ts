import { test } from 'node:test'
import * as assert from 'node:assert'

import { build } from '../helper'

test('enables CORS headers for requests with an Origin', async (t) => {
  const app = await build(t)

  const res = await app.inject({
    method: 'OPTIONS',
    url: '/',
    headers: {
      origin: 'http://example.com',
      'access-control-request-method': 'GET'
    }
  })

  assert.equal(res.statusCode, 204)
  assert.equal(res.headers['access-control-allow-origin'], 'http://example.com')
})
