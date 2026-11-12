// Builds a small one-page PDF CV for demo applicants, so "Open CV" shows a
// real document in the dashboard.
function escapePdf(text: string): string {
  return text
    .replace(/[\\()]/gu, (char) => `\\${char}`)
    .replace(/[^\x20-\x7e]/gu, "?");
}

export function demoCvPdf(lines: string[]): Buffer {
  const content = [
    "BT",
    "/F1 20 Tf",
    "72 740 Td",
    `(${escapePdf(lines[0] ?? "Curriculum vitae")}) Tj`,
    "/F1 12 Tf",
    ...lines
      .slice(1)
      .flatMap((line) => ["0 -22 Td", `(${escapePdf(line)}) Tj`]),
    "ET",
  ].join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((body, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf, "latin1");
}
