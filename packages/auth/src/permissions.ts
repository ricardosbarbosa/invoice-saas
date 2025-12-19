import { createAccessControl } from "better-auth/plugins/access"
import {
  adminAc as adminPluginAdmin,
  defaultStatements as adminStatements,
  userAc as adminPluginUser,
} from "better-auth/plugins/admin/access"
import {
  adminAc as orgAdmin,
  defaultStatements as orgStatements,
  memberAc,
  ownerAc,
} from "better-auth/plugins/organization/access"

const statements = {
  ...adminStatements,
  ...orgStatements,
  client: ["create", "read", "update", "delete", "archive"],
  invoice: ["create", "read", "update", "delete", "send", "mark-paid", "void"],
  invoiceItem: ["create", "read", "update", "delete"],
  invoiceSettings: ["read", "update"],
} as const

export const ac = createAccessControl(statements)

export const adminRoles = {
  admin: ac.newRole({
    ...adminPluginAdmin.statements,
  }),
  user: ac.newRole({
    ...adminPluginUser.statements,
  }),
} as const

export const organizationRoles = {
  owner: ac.newRole({
    ...ownerAc.statements,
    client: ["create", "read", "update", "delete", "archive"],
    invoice: ["create", "read", "update", "delete", "send", "mark-paid", "void"],
    invoiceItem: ["create", "read", "update", "delete"],
    invoiceSettings: ["read", "update"],
  }),
  admin: ac.newRole({
    ...orgAdmin.statements,
    client: ["create", "read", "update", "delete", "archive"],
    invoice: ["create", "read", "update", "delete", "send", "mark-paid", "void"],
    invoiceItem: ["create", "read", "update", "delete"],
    invoiceSettings: ["read", "update"],
  }),
  member: ac.newRole({
    ...memberAc.statements,
    client: ["read"],
    invoice: ["read"],
    invoiceItem: ["read"],
    invoiceSettings: ["read"],
  }),
} as const
