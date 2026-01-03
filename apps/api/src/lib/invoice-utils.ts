import { Decimal } from "@workspace/db";
import type { Prisma } from "@workspace/db";

/**
 * Invoice item input type for calculations (uses Prisma Decimal).
 */
export type InvoiceItemInput = {
  quantity: Prisma.Decimal;
  unitPrice: Prisma.Decimal;
};

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
]);

const THREE_DECIMAL_CURRENCIES = new Set([
  "BHD",
  "IQD",
  "JOD",
  "KWD",
  "LYD",
  "OMR",
  "TND",
]);

export const formatInvoicePrefix = (template: string, date: Date) => {
  const year = String(date.getFullYear());
  const shortYear = year.slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return template
    .replace(/YYYY/g, year)
    .replace(/YY/g, shortYear)
    .replace(/MM/g, month)
    .replace(/DD/g, day);
};

export const getCurrencyFractionDigits = (currency: string) => {
  const upper = currency.toUpperCase();
  if (ZERO_DECIMAL_CURRENCIES.has(upper)) return 0;
  if (THREE_DECIMAL_CURRENCIES.has(upper)) return 3;
  return 2;
};

const roundToCurrency = (amount: Prisma.Decimal, currency: string) =>
  amount.toDecimalPlaces(
    getCurrencyFractionDigits(currency),
    Decimal.ROUND_HALF_UP
  );

export const computeInvoiceTotals = ({
  items,
  currency,
}: {
  items: InvoiceItemInput[];
  currency: string;
}) => {
  const subtotal = items.reduce((sum, item) => {
    return sum.plus(item.unitPrice.mul(item.quantity));
  }, new Decimal(0));

  const total = subtotal;

  return {
    subtotal: roundToCurrency(subtotal, currency).toString(),
    total: roundToCurrency(total, currency).toString(),
  };
};

export const parseDecimal = (value: string | null | undefined) =>
  value === null || value === undefined ? null : new Decimal(value);

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
  });

  const prefix = formatInvoicePrefix(settings.prefixTemplate, issueDate);

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
    });
  }

  const updated = await tx.invoiceSettings.update({
    where: { organizationId },
    data: { nextNumber: { increment: 1 } },
    select: { nextNumber: true, numberPadding: true },
  });

  const sequence = updated.nextNumber - 1;
  const padded = String(sequence).padStart(updated.numberPadding, "0");

  return {
    number: `${prefix}${padded}`,
    defaultCurrency: settings.defaultCurrency,
  };
};
