import * as XLSX from "xlsx";

export function eksporExcel(
  namaFile: string,
  baris: Array<Record<string, string | number>>,
) {
  const sheet = XLSX.utils.json_to_sheet(baris);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Data");
  XLSX.writeFile(book, `${namaFile}.xlsx`);
}

export async function eksporPdf(
  judul: string,
  kolom: string[],
  baris: Array<Array<string | number>>,
) {
  if (typeof window === "undefined") return;

  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  
  // Title
  doc.setFontSize(14);
  doc.setTextColor(30, 80, 50);
  doc.text(judul, 14, 16);
  
  // Date timestamp
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Dicetak: ${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}`,
    14,
    22,
  );

  // Table
  autoTable(doc, {
    head: [kolom],
    body: baris.map((r) => r.map((c) => String(c))),
    startY: 26,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [30, 139, 79], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 247, 245] },
  });

  const fileName = `${judul.replace(/[^a-zA-Z0-9_\-]/g, "_").toLowerCase()}.pdf`;
  doc.save(fileName);
}
