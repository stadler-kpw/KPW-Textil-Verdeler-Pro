import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

export async function generateQuotePdf(element: HTMLElement): Promise<Blob> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false,
  });

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const pdfWidth = 210;
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  if (pdfHeight > 297) {
    const scale = 297 / pdfHeight;
    const scaledWidth = pdfWidth * scale;
    const xOffset = (pdfWidth - scaledWidth) / 2;
    pdf.addImage(imgData, 'JPEG', xOffset, 0, scaledWidth, 297);
  } else {
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
  }

  return pdf.output('blob');
}
