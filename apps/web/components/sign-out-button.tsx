"use client"

import { authClient } from "@/lib/auth-client"
import { Button } from "@workspace/ui/components/button"
import React from "react"

export default function SignOutButton() {
  return (
    <Button variant="outline" onClick={() => authClient.signOut()}>
      Sign out
    </Button>
  )
}
