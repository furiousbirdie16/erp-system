import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface DocumentData {
  type: "purchase_order" | "quotation" | "invoice";
  number: string;
  date: string;
  status: string;
  currencyCode?: string;
  currencySymbol?: string;
  notes?: string;
  recipientLabel: string;
  recipientName: string;
  recipientContact?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  recipientAddress?: string;
  extraFields?: { label: string; value: string }[];
  items: {
    name: string;
    sku?: string;
    quantity: number;
    unitPrice: number | null;
    total: number | null;
  }[];
  totalAmount: number;
}

const BLK = [0, 0, 0] as [number, number, number];
const GRY = [100, 100, 100] as [number, number, number];
const LGRY = [200, 200, 200] as [number, number, number];
const WHT = [255, 255, 255] as [number, number, number];
const TBLHD = [40, 40, 40] as [number, number, number];
const ALTROW = [248, 248, 248] as [number, number, number];

const COMPANY_NAME = "Your Company Name";
const COMPANY_ADDRESS_1 = "123 Business Street";
const COMPANY_ADDRESS_2 = "City, Country";

const LOGO_DATA = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAyADIDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD7LooFFABRXL/ELx94W8B6X9u8R6nHb7gfJt0+eec+iIOT9eg7kVzHwr+N/gzx7MLCGeTSdVZiEsr0qrSjPBjYHa5x2ByPTvW8cNVlB1FF8q6mbrQUuVvU9PooorA0CiiigAFePftIfEPxv4I0kHwx4ZlkgkTMutOolitT6eWOQf8AafC/WvYRXmf7T11c2XwX1m7s7ma2uIpLYpLE5VlPnx9CK6sFyuvBSV02lqY4i/s5NOx8QSza94y8SK9xc3OratfPjzZ5cs3GcljwqKASTwqgE8AU3xJoj6M9vcW1/b6np1zuNpqFqGEUrIQHUbgGV0bqCAcFWHDA1pXPiOWXT7q3h0+wtLm+Ajvry2i8uS4iHPllR8iBmwXKAb9oB4znF0TxFJpSalpt1Ywappl42+SzndlVZlzsmRlIZHGSCR95SVPUY+2bqRs0tF0/r8P6t86lF7vXufQP7Nfxc+I93q0HhibSb3xbp6lVafOJ7JPVpW+VlHo53eh7V9aV8vfsO61qGr6l4rW6kjjtoIbQW9rAgjggBaXIRBwM9ycse5NfUNfIZpy/WGoxS9D3cFf2SbdwopPxorzjrFrK8W+HtJ8VeH7rQdctftNhdKBJGHKngggggggggEfStWinGTi7rcTSasz5E+J/7Nmu6MZdQ8F3D63ZDLfY5SFuox6KeFk/8dPsa4T4b/s/+PPGl81xeWb+HdL80h7q/iZZGwedkRwzH3O0e9fe1Fess6xHs+R2b7nE8vpc3N07HCfCD4V+Gfhlps8GiC5nu7sJ9rvLiTLzbc4GB8qgFmwAO/JNd3RRXlzqSqScpO7OyMVFWiFFJRUDsLRRRQMKKKKBAKQUUUALRRRQM//Z";

function fmt(n: number, symbol = "PHP "): string {
  return symbol + n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getDocTitle(type: DocumentData["type"]): string {
  switch (type) {
    case "purchase_order": return "PURCHASE ORDER";
    case "quotation": return "QUOTATION";
    case "invoice": return "INVOICE";
  }
}

export function generateDocumentPDF(data: DocumentData): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const ml = 20;
  const mr = 20;
  const currencySymbol = data.currencySymbol ?? "PHP ";
  const currencyCode = data.currencyCode ?? "PHP";
  let y = 18;

  // ── Logo ──
  try {
    doc.addImage(LOGO_DATA, "JPEG", ml, y - 6, 12, 12);
  } catch {
    // fallback if image fails
  }

  // ── Company Info (next to logo) ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...BLK);
  doc.text(COMPANY_NAME, ml + 15, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRY);
  doc.text(COMPANY_ADDRESS_1, ml + 15, y);
  y += 4;
  doc.text(COMPANY_ADDRESS_2, ml + 15, y);

  // ── Document Title (top-right) ──
  const title = getDocTitle(data.type);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...BLK);
  doc.text(title, pw - mr, 36, { align: "right" });

  y = 50;

  // ── Bill To / Recipient (left) ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...BLK);
  doc.text(data.recipientLabel === "Supplier" ? "Ship To" : "Bill To", ml, y);
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...BLK);
  doc.text(data.recipientName || "—", ml, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRY);
  if (data.recipientAddress) {
    const addrLines = doc.splitTextToSize(data.recipientAddress, 80);
    doc.text(addrLines, ml, y);
    y += addrLines.length * 4;
  }
  const contactParts: string[] = [];
  if (data.recipientContact) contactParts.push(data.recipientContact);
  if (data.recipientEmail) contactParts.push(data.recipientEmail);
  if (data.recipientPhone) contactParts.push(data.recipientPhone);
  if (contactParts.length) {
    contactParts.forEach((p) => {
      doc.text(p, ml, y);
      y += 4;
    });
  }

  // ── Document details table (right side) ──
  const detailX = pw - mr - 70;
  let dy = 50;

  const detailRows: [string, string][] = [];
  const numLabel = data.type === "invoice" ? "Invoice #"
    : data.type === "quotation" ? "Quotation #"
    : "PO #";
  detailRows.push([numLabel, data.number]);

  const dateLabel = data.type === "invoice" ? "Invoice date"
    : data.type === "quotation" ? "Quotation date"
    : "Order date";
  detailRows.push([dateLabel, data.date]);

  if (data.extraFields) {
    data.extraFields.forEach((f) => detailRows.push([f.label, f.value]));
  }

  detailRows.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...BLK);
    doc.text(label, detailX, dy);
    doc.setFont("helvetica", "normal");
    doc.text(value, pw - mr, dy, { align: "right" });
    dy += 6;
  });

  y = Math.max(y, dy) + 10;

  // ── Items Table ──
  // Note: SKU is intentionally omitted from purchase orders per business preference
  autoTable(doc, {
    startY: y,
    margin: { left: ml, right: mr },
    head: [["QTY", "Description", "Unit Price", "Amount"]],
    body: data.items.map((item) => [
      item.quantity.toFixed(2),
      item.name,
      item.unitPrice == null ? "" : fmt(item.unitPrice, currencySymbol),
      item.total == null ? "" : fmt(item.total, currencySymbol),
    ]),
    headStyles: {
      fillColor: TBLHD,
      textColor: WHT,
      fontSize: 8.5,
      fontStyle: "bold",
      cellPadding: { top: 3.5, bottom: 3.5, left: 4, right: 4 },
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
      textColor: BLK,
    },
    alternateRowStyles: {
      fillColor: ALTROW,
    },
    columnStyles: {
      0: { cellWidth: 24, halign: "center" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 30, halign: "right" },
      3: { cellWidth: 32, halign: "right", fontStyle: "bold" },
    },
    theme: "plain",
    styles: {
      lineColor: LGRY,
      lineWidth: 0.2,
    },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || y + 40;
  y = finalY + 2;

  // ── Totals ──
  const totLabelX = pw - mr - 65;
  const totValX = pw - mr;

  doc.setDrawColor(...LGRY);
  doc.setLineWidth(0.3);
  doc.line(totLabelX - 4, y, totValX, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...BLK);
  doc.text("Subtotal", totLabelX, y);
  doc.text(fmt(data.totalAmount, currencySymbol), totValX, y, { align: "right" });
  y += 8;

  doc.setFillColor(...TBLHD);
  doc.rect(totLabelX - 4, y - 4.5, 69, 11, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...WHT);
  doc.text(`Total (${currencyCode})`, totLabelX, y + 1.5);
  doc.text(fmt(data.totalAmount, currencySymbol), totValX - 2, y + 1.5, { align: "right" });

  // ── Notes / Terms ──
  if (data.notes && data.notes.trim()) {
    y += 24;

    if (y > ph - 40) {
      doc.addPage();
      y = 20;
    }

    const notesLabel = data.type === "invoice"
      ? "Terms and Conditions"
      : data.type === "quotation"
        ? "Terms, Warranty & Conditions"
        : "Notes";

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...BLK);
    doc.text(notesLabel, ml, y);
    y += 5;

    doc.setDrawColor(...BLK);
    doc.setLineWidth(0.5);
    doc.line(ml, y, ml + 40, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...GRY);
    const splitNotes = doc.splitTextToSize(data.notes, pw - ml - mr);
    doc.text(splitNotes, ml, y);
  }

  // ── Footer ──
  doc.setDrawColor(...LGRY);
  doc.setLineWidth(0.2);
  doc.line(ml, ph - 14, pw - mr, ph - 14);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GRY);
  doc.text(`Generated by ${COMPANY_NAME}  •  All amounts in ${currencyCode}`, ml, ph - 9);
  doc.text("Page 1", pw - mr, ph - 9, { align: "right" });

  return doc;
}

export function downloadPDF(data: DocumentData) {
  const doc = generateDocumentPDF(data);
  doc.save(`${data.number}.pdf`);
}

export function getPDFDataURL(data: DocumentData): string {
  const doc = generateDocumentPDF(data);
  return doc.output("dataurlstring");
}
