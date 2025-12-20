"use client"
import { authClient } from '@/lib/auth-client'
import { Button } from '@workspace/ui/components/button'
import React from 'react'

export default function Page() {
  return (
    <Button variant="outline" className='m-4' onClick={async () => await authClient.admin.stopImpersonating()}>Stop Impersonate</Button>
  )
}
