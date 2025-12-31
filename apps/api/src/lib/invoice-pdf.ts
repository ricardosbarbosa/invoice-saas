import PDFDocument from "pdfkit"
import type {
  InvoiceTotals,
  InvoiceWithRelations,
} from "@workspace/types"

const formatDate = (value?: Date | string | null) =>
  value ? new Date(value).toLocaleDateString("en-US") : "-"

const formatCurrency = (
  amount: string | number | null | undefined,
  currency: string
) => {
  if (amount === null || amount === undefined || amount === "") return "-"
  const numeric = Number(amount)
  if (!Number.isFinite(numeric)) return `${amount} ${currency}`
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(numeric)
  } catch {
    return `${amount} ${currency}`
  }
}

const formatRate = (value?: unknown) => {
  if (value === null || value === undefined || value === "") return "-"
  const numeric = Number(String(value))
  if (!Number.isFinite(numeric)) return "-"
  return `${numeric * 100}%`
}

const buildClientAddressLines = (client: InvoiceWithRelations["client"]) => {
  const lines: string[] = []

  if (client.addressLine1) lines.push(client.addressLine1)
  if (client.addressLine2) lines.push(client.addressLine2)

  const cityState = [client.city, client.state].filter(Boolean).join(", ")
  const cityLine = [cityState, client.postalCode].filter(Boolean).join(" ")
  if (cityLine) lines.push(cityLine)

  if (client.country) lines.push(client.country)

  return lines
}

export async function renderInvoicePdf({
  invoice,
  totals,
}: {
  invoice: InvoiceWithRelations
  totals: InvoiceTotals
}) {
  const doc = new PDFDocument({ size: "A4", margin: 50 })
  doc.info.Title = invoice.number
  doc.info.Subject = "Invoice"

  const chunks: Buffer[] = []
  const result = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)))
    doc.on("end", () => resolve(Buffer.concat(chunks)))
    doc.on("error", reject)
  })

  const pageWidth =
    doc.page.width - doc.page.margins.left - doc.page.margins.right
  const leftX = doc.page.margins.left
  let y = doc.page.margins.top

  doc.font("Helvetica")
  doc.fontSize(22).text("Invoice", leftX, y)
  doc.fontSize(12).text(invoice.number, leftX, y + 4, {
    width: pageWidth,
    align: "right",
  })

  y = doc.y + 8
  doc.fontSize(10).fillColor("#6b7280").text(`Status: ${invoice.status}`, leftX, y)
  doc.fillColor("black")
  y = doc.y + 18

  const columnGap = 30
  const columnWidth = (pageWidth - columnGap) / 2
  const rightX = leftX + columnWidth + columnGap
  let leftY = y
  let rightY = y

  doc.fontSize(11).text("Bill To", leftX, leftY, { width: columnWidth })
  leftY = doc.y + 4
  doc.fontSize(10).text(invoice.client.name, leftX, leftY, {
    width: columnWidth,
  })
  leftY = doc.y + 2

  const addressLines = buildClientAddressLines(invoice.client)
  for (const line of addressLines) {
    doc.text(line, leftX, leftY, { width: columnWidth })
    leftY = doc.y + 2
  }

  if (invoice.client.email) {
    doc.text(invoice.client.email, leftX, leftY, { width: columnWidth })
    leftY = doc.y + 2
  }

  if (invoice.client.phone) {
    doc.text(invoice.client.phone, leftX, leftY, { width: columnWidth })
    leftY = doc.y + 2
  }

  if (invoice.client.taxId) {
    doc.text(`Tax ID: ${invoice.client.taxId}`, leftX, leftY, {
      width: columnWidth,
    })
    leftY = doc.y + 2
  }

  doc.fontSize(11).text("Invoice Details", rightX, rightY, {
    width: columnWidth,
  })
  rightY = doc.y + 4
  doc.fontSize(10)

  const details = [
    `Invoice #: ${invoice.number}`,
    `Issue date: ${formatDate(invoice.issueDate)}`,
    `Due date: ${formatDate(invoice.dueDate)}`,
    `Currency: ${invoice.currency}`,
    `Status: ${invoice.status}`,
  ]

  if (invoice.organization?.name) {
    details.push(`Organization: ${invoice.organization.name}`)
  }

  for (const line of details) {
    doc.text(line, rightX, rightY, { width: columnWidth })
    rightY = doc.y + 2
  }

  y = Math.max(leftY, rightY) + 18

  const descriptionWidth = 240
  const qtyWidth = 40
  const unitWidth = 80
  const totalWidth = Math.max(
    60,
    pageWidth - descriptionWidth - qtyWidth - unitWidth
  )

  const columns = {
    description: leftX,
    qty: leftX + descriptionWidth,
    unit: leftX + descriptionWidth + qtyWidth,
    total: leftX + descriptionWidth + qtyWidth + unitWidth,
  }

  const drawTableHeader = () => {
    doc.font("Helvetica")
    doc.fontSize(9).fillColor("#6b7280")
    doc.text("Description", columns.description, y, {
      width: descriptionWidth,
    })
    doc.text("Qty", columns.qty, y, { width: qtyWidth, align: "right" })
    doc.text("Unit", columns.unit, y, { width: unitWidth, align: "right" })
    doc.text("Total", columns.total, y, {
      width: totalWidth,
      align: "right",
    })

    y += 14
    doc
      .moveTo(leftX, y)
      .lineTo(leftX + pageWidth, y)
      .strokeColor("#e5e7eb")
      .stroke()
    y += 6
    doc.fillColor("black")
    doc.fontSize(10)
  }

  const ensureSpace = (height: number) => {
    if (y + height > doc.page.height - doc.page.margins.bottom) {
      doc.addPage()
      y = doc.page.margins.top
      drawTableHeader()
    }
  }

  drawTableHeader()

  for (const item of invoice.items) {
    const description = item.description ?? ""
    const descriptionHeight = doc.heightOfString(description, {
      width: descriptionWidth,
    })
    const rowHeight = Math.max(14, descriptionHeight)

    ensureSpace(rowHeight + 8)

    const quantityValue = Number(item.quantity)
    const unitPriceValue = Number(item.unitPrice)
    const lineTotal = Number.isFinite(quantityValue) && Number.isFinite(unitPriceValue)
      ? quantityValue * unitPriceValue
      : 0

    doc.text(description, columns.description, y, { width: descriptionWidth })
    doc.text(String(item.quantity), columns.qty, y, {
      width: qtyWidth,
      align: "right",
    })
    doc.text(formatCurrency(String(item.unitPrice), invoice.currency), columns.unit, y, {
      width: unitWidth,
      align: "right",
    })
    doc.text(formatCurrency(lineTotal.toString(), invoice.currency), columns.total, y, {
      width: totalWidth,
      align: "right",
    })

    y += rowHeight + 6
  }

  y += 8

  const totalsLines = [
    { label: "Subtotal", value: totals.subtotal },
  ]

  const totalsBlockWidth = 200
  const totalsLabelWidth = 120
  const totalsValueWidth = totalsBlockWidth - totalsLabelWidth
  const totalsX = leftX + pageWidth - totalsBlockWidth

  ensureSpace((totalsLines.length + 2) * 14)

  for (const line of totalsLines) {
    doc.fontSize(10).fillColor("#6b7280").text(line.label, totalsX, y, {
      width: totalsLabelWidth,
    })
    doc
      .fillColor("black")
      .text(formatCurrency(line.value, invoice.currency), totalsX + totalsLabelWidth, y, {
        width: totalsValueWidth,
        align: "right",
      })
    y += 14
  }

  doc.moveTo(totalsX, y).lineTo(totalsX + totalsBlockWidth, y).strokeColor("#e5e7eb").stroke()
  y += 6

  doc.font("Helvetica-Bold")
  doc.text("Total", totalsX, y, { width: totalsLabelWidth })
  doc.text(formatCurrency(totals.total, invoice.currency), totalsX + totalsLabelWidth, y, {
    width: totalsValueWidth,
    align: "right",
  })
  doc.font("Helvetica")
  y += 18

  if (invoice.notes) {
    ensureSpace(60)
    doc.fontSize(11).text("Notes", leftX, y)
    y = doc.y + 4
    doc.fontSize(10).text(invoice.notes, leftX, y, { width: pageWidth })
  }

  doc.end()

  return result
}
