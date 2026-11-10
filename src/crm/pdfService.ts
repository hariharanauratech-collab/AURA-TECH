import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { Invoice, Project, Task } from './crmTypes';
import founderSignature from './assets/founder-signature.png?inline';

// Format currency in Indian Rupees style
export const formatINR = (val: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};

// Convert number to words in Indian numbering system
export function numberToWordsINR(amount: number): string {
  if (!amount || isNaN(amount) || amount <= 0) return 'Zero Rupees Only';
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
    'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const num = Math.floor(amount);
  if (num === 0) return 'Zero Rupees Only';

  const inWords = (n: number): string => {
    let str = '';
    if (n > 19) {
      str += b[Math.floor(n / 10)] + ' ' + a[n % 10];
    } else {
      str += a[n];
    }
    return str.trim();
  };

  let crore = Math.floor(num / 10000000);
  let remainder = num % 10000000;
  let lakh = Math.floor(remainder / 100000);
  remainder = remainder % 100000;
  let thousand = Math.floor(remainder / 1000);
  remainder = remainder % 1000;
  let hundred = Math.floor(remainder / 100);
  let tens = remainder % 100;

  let res = '';
  if (crore > 0) res += inWords(crore) + ' Crore ';
  if (lakh > 0) res += inWords(lakh) + ' Lakh ';
  if (thousand > 0) res += inWords(thousand) + ' Thousand ';
  if (hundred > 0) res += inWords(hundred) + ' Hundred ';
  if (tens > 0) {
    if (res !== '') res += 'and ';
    res += inWords(tens) + ' ';
  }

  return 'Rupees ' + res.trim() + ' Only';
}

async function loadImageDataUrl(imageUrl: string, errorMessage: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      try {
        if (image.naturalWidth === 0 || image.naturalHeight === 0) {
          throw new Error('Client logo image has no dimensions.');
        }
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext('2d');
        if (!context) {
          throw new Error(errorMessage);
        }
        context.drawImage(image, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch {
        reject(new Error(errorMessage));
      }
    };
    image.onerror = () => reject(new Error(errorMessage));
    image.src = imageUrl;
  });
}

async function loadClientLogoDataUrl(logoUrl: string): Promise<string> {
  const parsedUrl = new URL(logoUrl);
  if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
    throw new Error('The client logo URL must use HTTP or HTTPS.');
  }
  return loadImageDataUrl(
    parsedUrl.toString(),
    'Could not embed the client logo. Check that its URL points to a public image and allows cross-origin (CORS) access.'
  );
}

function oklabToRgb(lightness: number, a: number, b: number, alphaPart?: string): string {
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const channels = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
  ].map(channel => {
    const linear = Math.max(0, Math.min(1, channel));
    const srgb = linear <= 0.0031308
      ? 12.92 * linear
      : 1.055 * Math.pow(linear, 1 / 2.4) - 0.055;
    return Math.round(srgb * 255);
  });
  const alpha = alphaPart?.trim();
  const alphaValue = alpha
    ? parseFloat(alpha) / (alpha.endsWith('%') ? 100 : 1)
    : undefined;
  return alphaValue !== undefined
    ? `rgba(${channels.join(', ')}, ${alphaValue})`
    : `rgb(${channels.join(', ')})`;
}

function oklabColorFunctionToRgb(value: string): string {
  const functionName = value.slice(0, value.indexOf('(')).toLowerCase();
  const [colorPart, alphaPart] = value.slice(value.indexOf('(') + 1, -1).split('/');
  const tokens = colorPart.trim().split(/\s+/);
  const lightness = parseFloat(tokens[0]) / (tokens[0].endsWith('%') ? 100 : 1);

  if (functionName === 'oklab') {
    const a = parseFloat(tokens[1]) * (tokens[1].endsWith('%') ? 0.004 : 1);
    const b = parseFloat(tokens[2]) * (tokens[2].endsWith('%') ? 0.004 : 1);
    return oklabToRgb(lightness, a, b, alphaPart);
  }

  const chroma = parseFloat(tokens[1]) * (tokens[1].endsWith('%') ? 0.004 : 1);
  const hueValue = parseFloat(tokens[2]);
  const hueToken = tokens[2];
  const hue = hueToken.endsWith('turn') ? hueValue * Math.PI * 2
    : hueToken.endsWith('rad') ? hueValue
      : hueValue * Math.PI / 180;
  return oklabToRgb(lightness, chroma * Math.cos(hue), chroma * Math.sin(hue), alphaPart);
}

function normalizeUnsupportedColorFunctions(invoiceRoot: HTMLElement): void {
  const elements = [invoiceRoot, ...invoiceRoot.querySelectorAll<HTMLElement>('*')];
  for (const element of elements) {
    const computedStyle = window.getComputedStyle(element);
    for (let index = 0; index < computedStyle.length; index += 1) {
      const property = computedStyle.item(index);
      const value = computedStyle.getPropertyValue(property);
      if (!/okl(?:ch|ab)\(/i.test(value)) continue;
      const normalized = value.replace(/okl(?:ch|ab)\([^)]*\)/gi, oklabColorFunctionToRgb);
      element.style.setProperty(property, normalized, 'important');
    }
  }
}

function replaceUnsupportedColorFunctions(css: string): string {
  return css.replace(/okl(?:ch|ab)\([^)]*\)/gi, oklabColorFunctionToRgb);
}

async function normalizeClonedStyles(clonedDocument: Document): Promise<void> {
  for (const styleElement of Array.from(clonedDocument.querySelectorAll('style'))) {
    styleElement.textContent = replaceUnsupportedColorFunctions(styleElement.textContent || '');
  }

  const stylesheetLinks = Array.from(
    clonedDocument.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')
  );
  for (const link of stylesheetLinks) {
    const stylesheetUrl = new URL(link.href, clonedDocument.location.href);
    if (stylesheetUrl.origin !== clonedDocument.location.origin) continue;

    const response = await fetch(stylesheetUrl);
    if (!response.ok) {
      throw new Error(`Could not prepare invoice styles for PDF export (${response.status}).`);
    }

    let css = replaceUnsupportedColorFunctions(await response.text());
    css = css.replace(/url\((['"]?)(?!data:|https?:|\/|#)([^)'"]+)\1\)/gi, (_match, quote: string, url: string) =>
      `url(${quote}${new URL(url, stylesheetUrl).toString()}${quote})`
    );
    const inlineStyle = clonedDocument.createElement('style');
    inlineStyle.textContent = css;
    if (link.media) inlineStyle.media = link.media;
    link.replaceWith(inlineStyle);
  }
}

export async function downloadInvoicePreviewPDF(invoiceNumber: string, invoiceElement: HTMLElement): Promise<void> {
  const canvas = await html2canvas(invoiceElement, {
    backgroundColor: '#ffffff',
    scale: 2,
    useCORS: true,
    allowTaint: false,
    logging: false,
    scrollX: 0,
    scrollY: 0,
    onclone: async (clonedDocument: Document) => {
      await normalizeClonedStyles(clonedDocument);
      const clonedInvoice = clonedDocument.querySelector('[data-invoice-pdf-root]') as HTMLElement | null;
      if (clonedInvoice) normalizeUnsupportedColorFunctions(clonedInvoice);
    },
    windowWidth: Math.max(document.documentElement.clientWidth, invoiceElement.scrollWidth),
    windowHeight: Math.max(document.documentElement.clientHeight, invoiceElement.scrollHeight)
  });

  if (canvas.width === 0 || canvas.height === 0) {
    throw new Error('The invoice preview is empty and could not be exported.');
  }

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const fitScale = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
  const imageWidth = canvas.width * fitScale;
  const imageHeight = canvas.height * fitScale;
  const x = (pageWidth - imageWidth) / 2;
  const y = (pageHeight - imageHeight) / 2;
  doc.addImage(
    canvas.toDataURL('image/jpeg', 0.96),
    'JPEG',
    x,
    y,
    imageWidth,
    imageHeight,
    undefined,
    'FAST'
  );

  doc.save(`${invoiceNumber}_AuraTech_exact_preview.pdf`);
}

/**
 * EXACT REPRODUCTION OF USER'S OFFICIAL AURA TECH INVOICE / QUOTATION TEMPLATE
 * Recreates all visual sections:
 * - AT Monogram + AURA TECH heading + "A RELIABLE BACKBONE OF YOUR BUSINESS"
 * - Right services: Web Development, Mobile Apps, Digital Solutions, IT Consulting
 * - QUOTATION / INVOICE bold title + "Build. Grow. Succeed Together."
 * - Quotation / Invoice No, Date, Validity box
 * - "To, [Client]" + polite business intro + Right project card with sprout icon
 * - Table with solid blue header: No. | Scope of Work | Amount (Rs)
 * - Scope items with bulleted deliverables
 * - Total Amount (INR) blue highlight band
 * - 5 Deliverable Badges: Responsive, SEO, WhatsApp, Clean Code, Post-Launch Support
 * - 3 Columns: Payment Terms, Other Terms, Signature block (Niranjan A, Founder & CEO)
 * - Dark full-width footer with Email, Phone (+91 9025255617), Location (Coimbatore)
 */
export async function generateInvoicePDF(invoice: Invoice, project?: Project, projectTasks: Task[] = []) {
  let auraTechLogoDataUrl: string | undefined;
  try {
    auraTechLogoDataUrl = await loadImageDataUrl(
      `${import.meta.env.BASE_URL}logo.png`,
      'Could not load the Aura Tech logo for the invoice PDF.'
    );
  } catch (err) {
    console.warn('Aura Tech logo load note (using fallback header):', err);
  }
  let clientLogoDataUrl: string | undefined;
  let clientLogoOmitted = false;
  if (invoice.clientCompanyLogoUrl) {
    try {
      clientLogoDataUrl = await loadClientLogoDataUrl(invoice.clientCompanyLogoUrl);
    } catch (error) {
      console.warn('Client logo was omitted from invoice PDF:', error);
      clientLogoOmitted = true;
    }
  }
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const margin = 12;

  // Background White
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, 297, 'F');

  // Top Right Geometric Accent (Subtle soft blue decorative shape)
  doc.setFillColor(238, 246, 255);
  doc.triangle(pageWidth - 65, 0, pageWidth, 0, pageWidth, 45, 'F');

  // 1. HEADER SECTION
  if (auraTechLogoDataUrl) {
    doc.addImage(auraTechLogoDataUrl, 'PNG', margin, 1, 34, 34);
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(23, 59, 143);
    doc.text('AURA TECH', margin, 16);
  }

  // Right: 4 Services with small bullets
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);

  const rightColX = pageWidth - margin - 42;
  doc.setTextColor(2, 132, 199);
  doc.text('</>', rightColX, 13);
  doc.setTextColor(51, 65, 85);
  doc.text('Web Development', rightColX + 6, 13);

  doc.setTextColor(2, 132, 199);
  doc.text('[ ]', rightColX, 17.5);
  doc.setTextColor(51, 65, 85);
  doc.text('Mobile Applications', rightColX + 6, 17.5);

  doc.setTextColor(2, 132, 199);
  doc.text('*', rightColX, 22);
  doc.setTextColor(51, 65, 85);
  doc.text('Digital Solutions', rightColX + 6, 22);

  doc.setTextColor(2, 132, 199);
  doc.text('::', rightColX, 26.5);
  doc.setTextColor(51, 65, 85);
  doc.text('IT Consulting', rightColX + 6, 26.5);

  // 2. DOCUMENT HEADING & META BOX
  const docTypeTitle = invoice.status === 'Draft' ? 'QUOTATION' : 'INVOICE';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(29, 78, 216); // Cobalt blue #1d4ed8
  doc.text(docTypeTitle, margin, 42);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Build. Grow. Succeed Together.', margin, 48);

  // Meta Box (Right Side)
  const metaBoxX = pageWidth - margin - 62;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(metaBoxX, 34, 62, 19, 2, 2, 'F');
  doc.setDrawColor(224, 242, 254);
  doc.roundedRect(metaBoxX, 34, 62, 19, 2, 2, 'S');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  doc.text(`${docTypeTitle === 'QUOTATION' ? 'Quotation No' : 'Invoice No'} :`, metaBoxX + 4, 40);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.invoiceNumber, metaBoxX + 27, 40);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Date :', metaBoxX + 4, 45);
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.invoiceDate, metaBoxX + 27, 45);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Validity :', metaBoxX + 4, 50);
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.dueDate || '15 Days', metaBoxX + 27, 50);

  // 3. CLIENT "TO" SECTION & RIGHT SUMMARY CARD
  const clientY = 57;

  // Left Client Box
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('To,', margin, clientY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  const clientHeading = invoice.clientCompany || invoice.clientName || 'VALUED CLIENT';
  doc.text(clientHeading.toUpperCase(), margin, clientY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const clientIntro = `Thank you for giving us the opportunity to work with you. We are pleased to submit our ${docTypeTitle.toLowerCase()} for the development and execution of your project deliverables.`;
  const splitIntro = doc.splitTextToSize(clientIntro, 85);
  doc.text(splitIntro, margin, clientY + 12);

  // Right Project Scope Summary Card
  const rightCardX = margin + 92;
  const rightCardW = pageWidth - margin - rightCardX;
  doc.setFillColor(240, 249, 255); // Soft cyan/blue fill #f0f9ff
  doc.roundedRect(rightCardX, clientY - 2, rightCardW, 28, 2, 2, 'F');
  doc.setDrawColor(186, 230, 253); // Light border #bae6fd
  doc.roundedRect(rightCardX, clientY - 2, rightCardW, 28, 2, 2, 'S');

  // Sprout icon & client subtext
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  const cardContentX = rightCardX + (clientLogoDataUrl ? 18 : 4);
  const cardTextWidth = rightCardW - (clientLogoDataUrl ? 22 : 8);
  if (clientLogoDataUrl) {
    doc.addImage(clientLogoDataUrl, 'PNG', rightCardX + 4, clientY + 1, 11, 11);
  }
  doc.text(doc.splitTextToSize(clientHeading, cardTextWidth), cardContentX, clientY + 4);

  doc.setFontSize(7.5);
  doc.setTextColor(16, 185, 129); // green
  doc.text('Verified Client Account', cardContentX, clientY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const rightDesc = project?.description || 'Scope of work is detailed in the invoice line items below.';
  const splitDesc = doc.splitTextToSize(rightDesc, cardTextWidth);
  doc.text(splitDesc, cardContentX, clientY + 15);

  // 4. SCOPE OF WORK / ITEM TABLE
  const tableStartY = 88;

  const tableRows = invoice.items.map((item, idx) => [
    (idx + 1).toString(),
    item.description,
    `₹ ${item.amount.toLocaleString('en-IN')}`
  ]);

  autoTable(doc, {
    startY: tableStartY,
    margin: { left: margin, right: margin },
    head: [['No.', 'Scope of Work', 'Amount (₹)']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [2, 132, 199], // Solid vibrant blue #0284c7
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left'
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 'auto', fontStyle: 'normal' },
      2: { cellWidth: 38, halign: 'right', fontStyle: 'bold' }
    },
    styles: {
      fontSize: 8,
      cellPadding: 4,
      textColor: [30, 41, 59],
      lineColor: [224, 242, 254],
      lineWidth: 0.3
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255]
    }
  });

  let curY = (doc as any).lastAutoTable.finalY;

  const totalRows: Array<[string, string]> = [
    ['Subtotal', `₹ ${invoice.subtotal.toLocaleString('en-IN')}`]
  ];
  if (invoice.discountAmount > 0) {
    totalRows.push([`Discount (${invoice.discountRate}%)`, `− ₹ ${invoice.discountAmount.toLocaleString('en-IN')}`]);
  }
  if (invoice.gstEnabled !== false) {
    totalRows.push([`GST (${invoice.taxRate}%)`, `₹ ${invoice.taxAmount.toLocaleString('en-IN')}`]);
  } else {
    totalRows.push(['GST', 'Not applied']);
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  totalRows.forEach(([label, amount], index) => {
    const rowY = curY + 4 + index * 4;
    doc.text(label, pageWidth - margin - 65, rowY);
    doc.text(amount, pageWidth - margin - 4, rowY, { align: 'right' });
  });
  curY += 5 + totalRows.length * 4;

  // Total Row Highlight Band
  doc.setFillColor(240, 249, 255);
  doc.rect(margin, curY, pageWidth - (margin * 2), 8.5, 'F');
  doc.setDrawColor(186, 230, 253);
  doc.rect(margin, curY, pageWidth - (margin * 2), 8.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Total Amount (INR)', margin + 14, curY + 5.5);

  doc.setFontSize(10);
  doc.setTextColor(29, 78, 216);
  doc.text(`₹ ${invoice.totalAmount.toLocaleString('en-IN')}`, pageWidth - margin - 4, curY + 5.8, { align: 'right' });

  curY += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(29, 78, 216);
  doc.text('PROJECT WORK SCOPE', margin, curY);

  const workScopeRows = projectTasks.length > 0
    ? projectTasks.map(task => [task.title, task.description || ''])
    : [[project?.title || invoice.projectTitle || 'Project scope', project?.description || 'Refer to the invoice line items for the agreed scope of work.']];

  autoTable(doc, {
    startY: curY + 2,
    margin: { left: margin, right: margin },
    body: workScopeRows,
    theme: 'grid',
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold' },
      1: { cellWidth: 'auto' }
    },
    styles: {
      fontSize: 6.5,
      cellPadding: 2,
      textColor: [51, 65, 85],
      lineColor: [224, 242, 254],
      lineWidth: 0.2
    }
  });
  curY = (doc as any).lastAutoTable.finalY + 4;

  // 6. PAYMENT TERMS, OTHER TERMS & SIGNATURE BLOCK (3 Columns)
  const col1X = margin;
  const col2X = margin + 60;
  const col3X = pageWidth - margin - 58;

  // Payment Terms
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(29, 78, 216);
  doc.text('v Payment Terms', col1X, curY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('• 50% advance before development starts.', col1X, curY + 5);
  doc.text('• 50% on completion and final delivery.', col1X, curY + 9);
  doc.text(`• Balance Due: ₹ ${invoice.outstandingBalance.toLocaleString('en-IN')}`, col1X, curY + 13);

  // Other Terms
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(29, 78, 216);
  doc.text('o Other Terms', col2X, curY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('• Quotation validity: 15 days.', col2X, curY + 5);
  doc.text(
    invoice.gstEnabled !== false ? `• GST: ${invoice.taxRate}% included.` : '• GST: Not applied.',
    col2X,
    curY + 9
  );
  doc.text('• Delivery timeline: 7 – 10 working days.', col2X, curY + 13);
  doc.text('• Hosting & domain: Client responsibility.', col2X, curY + 17);
  doc.text('• Maintenance: Available on separate SLA.', col2X, curY + 21);

  // Signature Block
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('We look forward to your valuable confirmation.', col3X, curY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('For AURA TECH', col3X, curY + 5);

  doc.addImage(founderSignature, 'PNG', col3X + 30, curY + 7, 24, 32);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Niranjan A', col3X, curY + 42);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Founder & CEO', col3X, curY + 46);
  doc.text('AURA TECH', col3X, curY + 49.5);

  // 7. BOTTOM FULL-WIDTH NAVY BANNER (Exact design from user image)
  const footerY = 282;
  doc.setFillColor(15, 23, 42); // Deep navy #0f172a
  doc.rect(0, footerY, pageWidth, 15, 'F');

  // Decorative top electric blue edge
  doc.setFillColor(2, 132, 199);
  doc.rect(0, footerY, pageWidth, 0.8, 'F');

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, footerY + 1.5, 13, 13, 1, 1, 'F');
  if (auraTechLogoDataUrl) {
    doc.addImage(auraTechLogoDataUrl, 'PNG', margin + 0.5, footerY + 2, 12, 12);
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(203, 213, 225);
  doc.text('auratech008@gmail.com', margin + 20, footerY + 9);
  doc.text('+91 9025255617', margin + 83, footerY + 9);
  doc.text('Coimbatore, Tamil Nadu, India', pageWidth - margin - 45, footerY + 9);

  // Download PDF
  doc.save(`${invoice.invoiceNumber}_AuraTech_with_logos.pdf`);
  return !clientLogoOmitted;
}

/**
 * Generate and download an Employee Work Report PDF
 */
export function generateWorkReportPDF(reportData: any) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;

  // Header Bar
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, pageWidth, 5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(30, 27, 75);
  doc.text('AURA TECH — EMPLOYEE WORK REPORT', margin, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} | Confidential Internal Document`, margin, 24);

  // Employee Card
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, 28, pageWidth - (margin * 2), 26, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, 28, pageWidth - (margin * 2), 26, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  const empName = reportData.employee ? `${reportData.employee.name} (${reportData.employee.id})` : 'All 7 Aura Tech Employees';
  doc.text(empName, margin + 4, 35);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const roleText = reportData.employee ? `Designation: ${reportData.employee.designation} | Department: ${reportData.employee.department}` : 'Organization-Wide Consolidated Operations Report';
  doc.text(roleText, margin + 4, 41);
  doc.text(`Reporting Period: ${reportData.reportingPeriod.toUpperCase()} | Active Projects: ${reportData.assignedProjects.length} | Active Clients: ${reportData.assignedClients.length}`, margin + 4, 47);

  // Metrics Grid
  const metricY = 58;
  const metrics = [
    { label: 'Total Tasks', value: reportData.totalAssignedTasks },
    { label: 'Completed (Period)', value: reportData.tasksCompletedInPeriod },
    { label: 'Completed (Overall)', value: reportData.tasksCompletedOverall },
    { label: 'In Progress', value: reportData.tasksInProgress },
    { label: 'Overdue', value: reportData.tasksOverdue },
    { label: 'Avg Progress', value: `${reportData.completionPercentage}%` }
  ];

  const colW = (pageWidth - (margin * 2) - 10) / 6;
  metrics.forEach((m, idx) => {
    const x = margin + idx * (colW + 2);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, metricY, colW, 18, 1, 1, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, metricY, colW, 18, 1, 1, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(m.label, x + colW / 2, metricY + 6, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(79, 70, 229);
    doc.text(String(m.value), x + colW / 2, metricY + 14, { align: 'center' });
  });

  // Task Details Table
  const tableRows = reportData.tasks.map((t: any, idx: number) => [
    (idx + 1).toString(),
    t.title,
    t.projectTitle ? (t.projectTitle.length > 25 ? t.projectTitle.substring(0, 25) + '...' : t.projectTitle) : 'N/A',
    t.assignedEmployeeName || 'N/A',
    t.priority,
    t.dueDate || 'N/A',
    `${t.completionPercentage}%`,
    t.status
  ]);

  autoTable(doc, {
    startY: 82,
    margin: { left: margin, right: margin },
    head: [['#', 'Task Title', 'Project', 'Assignee', 'Priority', 'Due Date', 'Progress', 'Status']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 3
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 8;

  // Blockers and Notes if any
  if (reportData.blockersEncountered && reportData.blockersEncountered.length > 0 && finalY < 240) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(220, 38, 38);
    doc.text('Reported Blockers & Issues:', margin, finalY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    reportData.blockersEncountered.slice(0, 4).forEach((b: any, bIdx: number) => {
      doc.text(`• [${b.taskTitle}] ${b.blocker}`, margin + 2, finalY + 5 + (bIdx * 4.5));
    });
  }

  // Footer
  const footY = 280;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('AURA TECH Business Management Suite — Work Progress Audit Report', margin, footY);
  doc.text(`Page 1 of 1`, pageWidth - margin, footY, { align: 'right' });

  const fileName = reportData.employee 
    ? `WorkReport_${reportData.employee.name.replace(/\s+/g, '_')}.pdf`
    : 'AuraTech_WorkReport_Consolidated.pdf';

  doc.save(fileName);
}

/**
 * Export tabular CSV
 */
export function exportReportToCSV(reportData: any) {
  const headers = ['Task ID', 'Task Title', 'Project', 'Client', 'Assigned To', 'Priority', 'Due Date', 'Progress (%)', 'Status', 'Actual Hours'];
  const rows = reportData.tasks.map((t: any) => [
    `"${t.id}"`,
    `"${t.title.replace(/"/g, '""')}"`,
    `"${(t.projectTitle || '').replace(/"/g, '""')}"`,
    `"${(t.clientName || '').replace(/"/g, '""')}"`,
    `"${t.assignedEmployeeName}"`,
    `"${t.priority}"`,
    `"${t.dueDate || ''}"`,
    `"${t.completionPercentage}%"`,
    `"${t.status}"`,
    `"${t.actualHours || 0}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map((r: string[]) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const fileName = reportData.employee 
    ? `WorkReport_${reportData.employee.name.replace(/\s+/g, '_')}.csv`
    : 'AuraTech_WorkReport_Consolidated.csv';
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
