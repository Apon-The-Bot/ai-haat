import { jsPDF } from "jspdf";

export interface InvoiceItemPayload {
  name?: string;
  productName?: string;
  variation?: string;
  variationName?: string;
  quantity: number;
  unitPriceBDT?: number;
  priceBDT?: number;
  totalBDT?: number;
  subtotalBDT?: number;
}

export interface InvoicePayload {
  orderId?: string;
  orderNumber: string;
  createdAt: Date | string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  paymentMethod: string;
  paymentStatus: string;
  deliveryStatus?: string;
  trxId?: string;
  items: InvoiceItemPayload[];
  subtotalBDT: number;
  discountBDT: number;
  totalBDT: number;
}

/**
 * Server-side / Client-side professional branded PDF invoice generator for AI Haat orders.
 */
export async function generateOrderInvoicePDF(payload: InvoicePayload): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const primaryColor = [252, 92, 3]; // #FC5C03 (AI Haat Orange)
  const darkSlate = [15, 23, 42]; // #0F172A
  const lightGray = [241, 245, 249]; // #F1F5F9
  const textMuted = [100, 116, 139]; // #64748B

  // 1. Top Decorative Brand Bar
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 6, "F");

  // 2. Header Section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text("AI HAAT", 20, 24);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text("Bangladesh's #1 Digital Products & Software Marketplace", 20, 29);
  doc.text("Website: https://aihaat.shop  |  Support: support@aihaat.shop", 20, 34);

  // Invoice Title on Right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("OFFICIAL INVOICE", 190, 24, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text(`Invoice #: ${payload.orderNumber}`, 190, 30, { align: "right" });

  const orderDate = new Date(payload.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`Date: ${orderDate}`, 190, 35, { align: "right" });

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(20, 42, 190, 42);

  // 3. Customer & Payment Information Grid
  // Left: Bill To
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text("CUSTOMER DETAILS", 20, 50);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text(`Name: ${payload.customerName || "Valued Customer"}`, 20, 56);
  doc.text(`Email: ${payload.customerEmail || "N/A"}`, 20, 61);
  if (payload.customerPhone) {
    doc.text(`Phone: ${payload.customerPhone}`, 20, 66);
  }

  // Right: Payment Information Box
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.roundedRect(120, 46, 70, 24, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text("PAYMENT STATUS", 125, 52);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(`Method: ${payload.paymentMethod.toUpperCase()}`, 125, 58);
  doc.text(`Status: ${payload.paymentStatus.toUpperCase()}`, 125, 63);
  if (payload.trxId) {
    doc.text(`Trx ID: ${payload.trxId}`, 125, 68);
  }

  // 4. Line Items Table
  let startY = 78;

  // Table Header
  doc.setFillColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.rect(20, startY, 170, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text("ITEM DESCRIPTION", 24, startY + 5.5);
  doc.text("PLAN / VARIATION", 95, startY + 5.5);
  doc.text("QTY", 135, startY + 5.5, { align: "center" });
  doc.text("UNIT (BDT)", 158, startY + 5.5, { align: "right" });
  doc.text("TOTAL (BDT)", 186, startY + 5.5, { align: "right" });

  let currentY = startY + 8;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);

  payload.items.forEach((item, index) => {
    const isEven = index % 2 === 0;
    if (isEven) {
      doc.setFillColor(250, 250, 252);
      doc.rect(20, currentY, 170, 8, "F");
    }

    doc.setFontSize(8.5);
    const itemName = item.name || (item as any).productName || "Product Item";
    const itemVariation = item.variation || (item as any).variationName || "Standard";
    const unitPrice = Number(item.unitPriceBDT ?? (item as any).priceBDT ?? 0);
    const itemTotal = Number(item.totalBDT ?? (item as any).subtotalBDT ?? (unitPrice * (item.quantity || 1)));

    // Truncate name if too long
    const cleanName = itemName.length > 38 ? `${itemName.slice(0, 35)}...` : itemName;
    const cleanVariation = itemVariation.length > 20
      ? `${itemVariation.slice(0, 18)}...`
      : itemVariation;

    doc.text(cleanName, 24, currentY + 5.5);
    doc.text(cleanVariation, 95, currentY + 5.5);
    doc.text(String(item.quantity || 1), 135, currentY + 5.5, { align: "center" });
    doc.text(`${unitPrice.toLocaleString()}`, 158, currentY + 5.5, { align: "right" });
    doc.text(`${itemTotal.toLocaleString()}`, 186, currentY + 5.5, { align: "right" });

    currentY += 8;
  });

  // 5. Summary / Totals Box
  currentY += 4;
  doc.setDrawColor(226, 232, 240);
  doc.line(20, currentY, 190, currentY);
  currentY += 4;

  const summaryX = 125;
  doc.setFontSize(9);
  doc.text("Subtotal:", summaryX, currentY + 4);
  doc.text(`BDT ${payload.subtotalBDT.toLocaleString()}`, 186, currentY + 4, { align: "right" });

  if (payload.discountBDT > 0) {
    currentY += 6;
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Discount Savings:", summaryX, currentY + 4);
    doc.text(`- BDT ${payload.discountBDT.toLocaleString()}`, 186, currentY + 4, { align: "right" });
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  }

  currentY += 8;
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.roundedRect(summaryX - 5, currentY, 70, 10, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("TOTAL PAID:", summaryX, currentY + 6.5);
  doc.text(`BDT ${payload.totalBDT.toLocaleString()}`, 186, currentY + 6.5, { align: "right" });

  // 6. Delivery & Warranty Notice Box
  currentY += 18;
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.roundedRect(20, currentY, 170, 16, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text("INSTANT DIGITAL DELIVERY & WARRANTY GUARANTEE", 25, currentY + 5.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(
    "All software licenses, account credentials, and invites are digitally stored in your AI Haat Customer Vault.",
    25,
    currentY + 10
  );
  doc.text(
    "For warranty replacement or renewal support, visit: https://aihaat.shop/dashboard/vault",
    25,
    currentY + 13.5
  );

  // 7. Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(
    "Thank you for choosing AI Haat — Empowering Bangladesh with genuine AI & software access.",
    105,
    285,
    { align: "center" }
  );

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}

export const generateInvoicePdf = generateOrderInvoicePDF;

