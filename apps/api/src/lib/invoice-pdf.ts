import PDFDocument from "pdfkit";
import type { InvoiceTotals, InvoiceWithRelations } from "@workspace/types";

const formatDate = (value?: Date | string | null) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatCurrency = (
  amount: string | number | null | undefined,
  currency: string
) => {
  if (amount === null || amount === undefined || amount === "") return "-";
  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) return `${amount} ${currency}`;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numeric);
  } catch {
    return `${amount} ${currency}`;
  }
};

const buildClientAddressLines = (client: InvoiceWithRelations["client"]) => {
  const lines: string[] = [];

  if (client.addressLine1) lines.push(client.addressLine1);
  if (client.addressLine2) lines.push(client.addressLine2);

  const cityState = [client.city, client.state].filter(Boolean).join(", ");
  const cityLine = [cityState, client.postalCode].filter(Boolean).join(" ");
  if (cityLine) lines.push(cityLine);

  if (client.country) lines.push(client.country);

  return lines;
};

const buildOrganizationAddress = (
  org: InvoiceWithRelations["organization"]
) => {
  if (!org?.metadata) return null;
  try {
    const metadata =
      typeof org.metadata === "string"
        ? JSON.parse(org.metadata)
        : org.metadata;
    return metadata.address || null;
  } catch {
    return null;
  }
};

const getOrganizationEmail = (org: InvoiceWithRelations["organization"]) => {
  if (!org?.metadata) return null;
  try {
    const metadata =
      typeof org.metadata === "string"
        ? JSON.parse(org.metadata)
        : org.metadata;
    return metadata.email || null;
  } catch {
    return null;
  }
};

export async function renderInvoicePdf({
  invoice,
  totals,
}: {
  invoice: InvoiceWithRelations;
  totals: InvoiceTotals;
}) {
  const doc = new PDFDocument({ size: "A4", margin: 48 });
  doc.info.Title = invoice.number;
  doc.info.Subject = "Invoice";

  const chunks: Buffer[] = [];
  const result = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  const pageWidth =
    doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const leftX = doc.page.margins.left;
  let y = doc.page.margins.top;

  // Header Section
  const logoSize = 48;
  const logoX = leftX;
  const logoY = y;

  // Draw logo circle (blue background)
  doc
    .circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2)
    .fill("#2563eb");

  // Draw organization initial
  const orgInitial = invoice.organization?.name?.[0]?.toUpperCase() || "I";
  doc
    .font("Helvetica-Bold")
    .fontSize(20)
    .fillColor("white")
    .text(orgInitial, logoX, logoY + logoSize / 2 - 10, {
      width: logoSize,
      align: "center",
    });

  // Organization info (left side)
  const orgInfoX = logoX + logoSize + 16;
  const orgInfoY = y;

  doc.font("Helvetica-Bold").fontSize(20).fillColor("#111827");
  doc.text(invoice.organization?.name || "Invoicify", orgInfoX, orgInfoY);

  const orgAddress = buildOrganizationAddress(invoice.organization);
  const orgEmail = getOrganizationEmail(invoice.organization);

  let orgTextY = y + 24; // Start below company name
  doc.font("Helvetica").fontSize(11).fillColor("#4b5563");

  if (orgAddress) {
    doc.text(orgAddress, orgInfoX, orgTextY, { width: pageWidth / 2 });
    orgTextY = orgTextY + 14;
  }

  if (orgEmail) {
    doc.text(orgEmail, orgInfoX, orgTextY, { width: pageWidth / 2 });
    orgTextY = orgTextY + 14;
  }

  // Invoice title and details (right side) - START FROM TOP
  const rightMargin = doc.page.margins.right;
  const rightEdge = doc.page.width - rightMargin;
  let rightY = y; // Start from same Y as logo

  // 1. Status badge
  const badgeWidth = 60;
  const badgeHeight = 20;
  const badgeX = rightEdge - badgeWidth;
  doc.roundedRect(badgeX, rightY, badgeWidth, badgeHeight, 10).fill("#f3f4f6");
  doc.font("Helvetica-Bold").fontSize(9).fillColor("#1f2937");
  doc.text(invoice.status.toUpperCase(), badgeX, rightY + 6, {
    width: badgeWidth,
    align: "center",
  });
  rightY = rightY + badgeHeight + 16; // Space after badge

  // 2. Invoice title - slightly smaller, render explicitly
  doc.font("Helvetica-Bold").fontSize(42).fillColor("#111827");
  const invoiceTitleWidth = 220;
  const invoiceTitleX = rightEdge - invoiceTitleWidth;
  doc.text("INVOICE", invoiceTitleX, rightY, {
    width: invoiceTitleWidth,
    align: "right",
  });
  rightY = rightY + 54; // Approximate height for 42pt title + spacing

  // 3. Invoice Number (label + value) - render explicitly
  doc.font("Helvetica").fontSize(11).fillColor("#374151");
  const invoiceNumberLabelWidth = 150;
  const invoiceNumberLabelX = rightEdge - invoiceNumberLabelWidth;
  doc.text("Invoice Number", invoiceNumberLabelX, rightY, {
    width: invoiceNumberLabelWidth,
    align: "right",
  });
  rightY = rightY + 14;

  doc.font("Helvetica").fontSize(11).fillColor("#111827");
  const invoiceNumberValueWidth = 150;
  const invoiceNumberValueX = rightEdge - invoiceNumberValueWidth;
  doc.text(invoice.number, invoiceNumberValueX, rightY, {
    width: invoiceNumberValueWidth,
    align: "right",
  });

  // Update y position for next section - use the maximum of left and right sections
  const rightSectionBottom = rightY + 24;
  y = Math.max(rightSectionBottom, orgTextY + 24);

  // Billing Section
  const columnGap = 48;
  const columnWidth = (pageWidth - columnGap) / 2;
  const datesX = leftX + columnWidth + columnGap;

  // Bill To section (left)
  doc.font("Helvetica-Bold").fontSize(9).fillColor("#6b7280");
  doc.text("BILL TO", leftX, y, { width: columnWidth });
  y = doc.y + 12;

  doc.font("Helvetica-Bold").fontSize(11).fillColor("#111827");
  doc.text(invoice.client.name, leftX, y, { width: columnWidth });
  y = doc.y + 4;

  const addressLines = buildClientAddressLines(invoice.client);
  doc.font("Helvetica").fontSize(11).fillColor("#4b5563");

  for (const line of addressLines) {
    doc.text(line, leftX, y, { width: columnWidth });
    y = doc.y + 2;
  }

  if (invoice.client.email) {
    doc.text(invoice.client.email, leftX, y, { width: columnWidth });
    y = doc.y + 2;
  }

  const leftSectionEnd = y;

  // Dates section (right)
  y =
    leftSectionEnd -
    (addressLines.length + (invoice.client.email ? 1 : 0)) * 14 -
    16;

  doc.font("Helvetica-Bold").fontSize(9).fillColor("#6b7280");
  doc.text("INVOICE DATE", datesX, y, { width: columnWidth, align: "right" });
  y = doc.y + 4;
  doc.font("Helvetica").fontSize(11).fillColor("#111827");
  doc.text(formatDate(invoice.issueDate), datesX, y, {
    width: columnWidth,
    align: "right",
  });

  if (invoice.dueDate) {
    y = doc.y + 16;
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#6b7280");
    doc.text("DUE DATE", datesX, y, { width: columnWidth, align: "right" });
    y = doc.y + 4;
    doc.font("Helvetica").fontSize(11).fillColor("#111827");
    doc.text(formatDate(invoice.dueDate), datesX, y, {
      width: columnWidth,
      align: "right",
    });
  }

  y = leftSectionEnd + 32;

  // Line Items Table
  const descriptionWidth = 280;
  const qtyWidth = 50;
  const priceWidth = 100;
  const totalWidth = pageWidth - descriptionWidth - qtyWidth - priceWidth;

  const columns = {
    description: leftX,
    qty: leftX + descriptionWidth,
    price: leftX + descriptionWidth + qtyWidth,
    total: leftX + descriptionWidth + qtyWidth + priceWidth,
  };

  const drawTableHeader = () => {
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#6b7280");
    doc.text("DESCRIPTION", columns.description, y, {
      width: descriptionWidth,
    });
    doc.text("QTY", columns.qty, y, { width: qtyWidth, align: "right" });
    doc.text("PRICE", columns.price, y, { width: priceWidth, align: "right" });
    doc.text("TOTAL", columns.total, y, {
      width: totalWidth,
      align: "right",
    });

    y += 16;
    doc
      .moveTo(leftX, y)
      .lineTo(leftX + pageWidth, y)
      .strokeColor("#e5e7eb")
      .stroke();
    y += 8;
    doc.font("Helvetica").fontSize(11).fillColor("#111827");
  };

  const ensureSpace = (height: number) => {
    if (y + height > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      y = doc.page.margins.top;
      drawTableHeader();
    }
  };

  drawTableHeader();

  for (const item of invoice.items) {
    const description = item.description ?? "";
    const descriptionHeight = doc.heightOfString(description, {
      width: descriptionWidth,
    });
    const rowHeight = Math.max(16, descriptionHeight);

    ensureSpace(rowHeight + 8);

    const quantityValue = Number(item.quantity);
    const unitPriceValue = Number(item.unitPrice);
    const lineTotal =
      Number.isFinite(quantityValue) && Number.isFinite(unitPriceValue)
        ? quantityValue * unitPriceValue
        : 0;

    doc.text(description, columns.description, y, { width: descriptionWidth });
    doc.text(String(item.quantity), columns.qty, y, {
      width: qtyWidth,
      align: "right",
    });
    doc.text(
      formatCurrency(String(item.unitPrice), invoice.currency),
      columns.price,
      y,
      {
        width: priceWidth,
        align: "right",
      }
    );
    doc.font("Helvetica-Bold");
    doc.text(
      formatCurrency(lineTotal.toString(), invoice.currency),
      columns.total,
      y,
      {
        width: totalWidth,
        align: "right",
      }
    );
    doc.font("Helvetica");

    y += rowHeight + 8;
  }

  y += 16;

  // Totals Section
  const totalsBlockWidth = 256;
  const totalsLabelWidth = 120;
  const totalsValueWidth = totalsBlockWidth - totalsLabelWidth;
  const totalsX = leftX + pageWidth - totalsBlockWidth;

  ensureSpace(40);

  // Subtotal
  doc.font("Helvetica").fontSize(11).fillColor("#4b5563");
  doc.text("Subtotal", totalsX, y, { width: totalsLabelWidth });
  doc.text(
    formatCurrency(totals.subtotal, invoice.currency),
    totalsX + totalsLabelWidth,
    y,
    {
      width: totalsValueWidth,
      align: "right",
    }
  );
  y += 16;

  // Divider
  doc
    .moveTo(totalsX, y)
    .lineTo(totalsX + totalsBlockWidth, y)
    .strokeColor("#e5e7eb")
    .stroke();
  y += 8;

  // Total
  doc.font("Helvetica-Bold").fontSize(14).fillColor("#111827");
  doc.text("Total", totalsX, y, { width: totalsLabelWidth });
  doc.fillColor("#2563eb");
  doc.text(
    formatCurrency(totals.total, invoice.currency),
    totalsX + totalsLabelWidth,
    y,
    {
      width: totalsValueWidth,
      align: "right",
    }
  );
  doc.fillColor("#111827");
  y += 32;

  // Notes
  if (invoice.notes) {
    ensureSpace(80);
    doc
      .moveTo(leftX, y)
      .lineTo(leftX + pageWidth, y)
      .strokeColor("#e5e7eb")
      .stroke();
    y += 24;

    doc.font("Helvetica-Bold").fontSize(9).fillColor("#6b7280");
    doc.text("NOTES", leftX, y);
    y = doc.y + 8;
    doc.font("Helvetica").fontSize(11).fillColor("#4b5563");
    doc.text(invoice.notes, leftX, y, { width: pageWidth });
    y = doc.y + 24;
  }

  // Footer
  ensureSpace(40);
  doc
    .moveTo(leftX, y)
    .lineTo(leftX + pageWidth, y)
    .strokeColor("#e5e7eb")
    .stroke();
  y += 32;

  doc.font("Helvetica").fontSize(11).fillColor("#6b7280");
  doc.text("Thank you for your business!", leftX, y, {
    width: pageWidth,
    align: "center",
  });

  doc.end();

  return result;
}
