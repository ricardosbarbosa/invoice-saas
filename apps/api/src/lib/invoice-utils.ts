import { Decimal } from "@workspace/db"
import type { Prisma } from "@workspace/db"
import type { DecimalLike } from "@workspace/types"

/**
 * Invoice item input type for calculations (uses Prisma Decimal).
 */
export type InvoiceItemInput = {
  quantity: Prisma.Decimal
  unitPrice: Prisma.Decimal
  taxRate?: Prisma.Decimal | null
}

const ZERO_DECIMAL_CURRENCIES = new Set([
  "BIF",
  "CLP",
  "DJF",
  "GNF",
  "JPY",
  "KMF",
  "KRW",
  "MGA",
  "PYG",
  "RWF",
  "UGX",
  "VND",
  "VUV",
  "XAF",
  "XOF",
  "XPF",
])

const THREE_DECIMAL_CURRENCIES = new Set([
  "BHD",
  "IQD",
  "JOD",
  "KWD",
  "LYD",
  "OMR",
  "TND",
])

const toDecimal = (value: DecimalLike) => new Decimal(value)

export const formatInvoicePrefix = (template: string, date: Date) => {
  const year = String(date.getFullYear())
  const shortYear = year.slice(-2)
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return template
    .replace(/YYYY/g, year)
    .replace(/YY/g, shortYear)
    .replace(/MM/g, month)
    .replace(/DD/g, day)
}

export const getCurrencyFractionDigits = (currency: string) => {
  const upper = currency.toUpperCase()
  if (ZERO_DECIMAL_CURRENCIES.has(upper)) return 0
  if (THREE_DECIMAL_CURRENCIES.has(upper)) return 3
  return 2
}

const roundToCurrency = (amount: Prisma.Decimal, currency: string) =>
  amount.toDecimalPlaces(getCurrencyFractionDigits(currency), Decimal.ROUND_HALF_UP)

export const computeInvoiceTotals = ({
  items,
  discountType,
  discountValue,
  shippingAmount,
  shippingTaxRate,
  currency,
}: {
  items: InvoiceItemInput[]
  discountType?: "percentage" | "fixed" | null
  discountValue?: Prisma.Decimal | null
  shippingAmount?: Prisma.Decimal | null
  shippingTaxRate?: Prisma.Decimal | null
  currency: string
}) => {
  const subtotal = items.reduce((sum, item) => {
    return sum.plus(item.unitPrice.mul(item.quantity))
  }, toDecimal(0))

  let discountTotal = toDecimal(0)
  if (discountType && discountValue) {
    if (discountType === "percentage") {
      discountTotal = subtotal.mul(discountValue.div(100))
    } else {
      discountTotal = discountValue
    }
  }

  if (discountTotal.greaterThan(subtotal)) {
    discountTotal = subtotal
  }

  const discountRatio = subtotal.equals(0) ? toDecimal(0) : discountTotal.div(subtotal)

  const lineTaxTotal = items.reduce((sum, item) => {
    const lineSubtotal = item.unitPrice.mul(item.quantity)
    const discountedLineSubtotal = lineSubtotal.minus(lineSubtotal.mul(discountRatio))
    const taxRate = item.taxRate ?? toDecimal(0)
    const lineTax = discountedLineSubtotal.mul(taxRate)
    return sum.plus(lineTax)
  }, toDecimal(0))

  const shipping = shippingAmount ?? toDecimal(0)
  const shippingTax = shipping.mul(shippingTaxRate ?? toDecimal(0))

  const taxTotal = lineTaxTotal.plus(shippingTax)
  const total = subtotal.minus(discountTotal).plus(taxTotal).plus(shipping)

  return {
    subtotal: roundToCurrency(subtotal, currency).toString(),
    discountTotal: roundToCurrency(discountTotal, currency).toString(),
    taxTotal: roundToCurrency(taxTotal, currency).toString(),
    shippingTotal: roundToCurrency(shipping, currency).toString(),
    shippingTax: roundToCurrency(shippingTax, currency).toString(),
    total: roundToCurrency(total, currency).toString(),
  }
}

export const parseDecimal = (value: DecimalLike | null | undefined) =>
  value === null || value === undefined ? null : toDecimal(value)

export const reserveInvoiceNumber = async (
  tx: Prisma.TransactionClient,
  organizationId: string,
  issueDate: Date
) => {
  const settings = await tx.invoiceSettings.upsert({
    where: { organizationId },
    create: {
      organizationId,
      prefixTemplate: "INV-YYYY-",
      lastPrefix: null,
      nextNumber: 1,
      numberPadding: 4,
      defaultCurrency: "USD",
    },
    update: {},
    select: {
      prefixTemplate: true,
      lastPrefix: true,
      numberPadding: true,
      defaultCurrency: true,
    },
  })

  const prefix = formatInvoicePrefix(settings.prefixTemplate, issueDate)

  if (settings.lastPrefix !== prefix) {
    await tx.invoiceSettings.updateMany({
      where: {
        organizationId,
        lastPrefix: { not: prefix },
      },
      data: {
        lastPrefix: prefix,
        nextNumber: 1,
      },
    })
  }

  const updated = await tx.invoiceSettings.update({
    where: { organizationId },
    data: { nextNumber: { increment: 1 } },
    select: { nextNumber: true, numberPadding: true },
  })

  const sequence = updated.nextNumber - 1
  const padded = String(sequence).padStart(updated.numberPadding, "0")

  return {
    number: `${prefix}${padded}`,
    defaultCurrency: settings.defaultCurrency,
  }
}
