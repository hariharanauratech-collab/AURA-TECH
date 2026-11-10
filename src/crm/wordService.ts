import {
  AlignmentType,
  BorderStyle,
  Document,
  ImageRun,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableLayoutType,
  TableCell,
  TableRow,
  TextRun,
  WidthType
} from 'docx';
import { Invoice } from './crmTypes';
import { numberToWordsINR } from './pdfService';

const INVOICE_TABLE_WIDTH = 9360;

const border = {
  style: BorderStyle.SINGLE,
  size: 1,
  color: 'D8E2F0'
};

const tableBorders = {
  top: border,
  bottom: border,
  left: border,
  right: border,
  insideHorizontal: border,
  insideVertical: border
};

const formatCurrency = (amount: number) => `₹ ${(amount || 0).toLocaleString('en-IN')}`;

type LoadedImage = {
  data: ArrayBuffer;
  type: 'png' | 'jpg' | 'gif' | 'bmp';
};

async function loadImage(url: string): Promise<LoadedImage | undefined> {
  try {
    const response = await fetch(url);
    if (!response.ok) return undefined;
    const mimeType = response.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
    const type = mimeType === 'image/png' ? 'png'
      : mimeType === 'image/jpeg' ? 'jpg'
        : mimeType === 'image/gif' ? 'gif'
          : mimeType === 'image/bmp' ? 'bmp'
            : undefined;
    if (!type) return undefined;
    return { data: await response.arrayBuffer(), type };
  } catch {
    return undefined;
  }
}

function cell(
  text: string,
  width: number,
  bold = false,
  alignment: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT,
  fill?: string,
  textColor = '1E293B'
) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    margins: { top: 100, bottom: 100, left: 120, right: 120 },
    ...(fill ? { shading: { type: ShadingType.CLEAR, fill } } : {}),
    children: [
      new Paragraph({
        alignment,
        spacing: { before: 0, after: 0 },
        children: [new TextRun({ text, bold, size: 20, font: 'Arial', color: textColor })]
      })
    ]
  });
}

function imageCell(data: LoadedImage | undefined, width: number, placeholder = '') {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: data
          ? [new ImageRun({ data: data.data, type: data.type, transformation: { width: 96, height: 96 } })]
          : placeholder ? [new TextRun({ text: placeholder, bold: true, size: 24, color: '1646A0' })] : []
      })
    ]
  });
}

export async function downloadInvoiceWord(invoice: Invoice): Promise<boolean> {
  const auraLogo = await loadImage(`${import.meta.env.BASE_URL}logo.png`);
  if (!auraLogo) {
    console.warn('Aura Tech logo could not be fetched for Word export, using text header.');
  }

  let clientLogo: LoadedImage | undefined;
  if (invoice.clientCompanyLogoUrl) {
    clientLogo = await loadImage(invoice.clientCompanyLogoUrl);
    if (!clientLogo) {
      console.warn('Client logo was omitted from Word invoice because its URL could not be fetched.');
    }
  }

  const documentRows = [
    new TableRow({
      children: [
        imageCell(auraLogo, 2100, 'AURA TECH'),
        new TableCell({
          width: { size: 7260, type: WidthType.DXA },
          children: [
            new Paragraph({
              children: [new TextRun({ text: 'AURA TECH', bold: true, size: 36, color: '173B8F', font: 'Arial' })]
            }),
            new Paragraph({
              children: [new TextRun({ text: 'A RELIABLE BACKBONE OF YOUR BUSINESS', bold: true, size: 16, color: '0284C7', font: 'Arial' })]
            })
          ]
        })
      ]
    })
  ];

  const lineRows = [
    new TableRow({
      tableHeader: true,
      children: [
        cell('No.', 650, true, AlignmentType.CENTER, '0284C7', 'FFFFFF'),
        cell('Scope of Work', 4310, true, AlignmentType.LEFT, '0284C7', 'FFFFFF'),
        cell('Qty', 800, true, AlignmentType.CENTER, '0284C7', 'FFFFFF'),
        cell('Unit Price (₹)', 1800, true, AlignmentType.RIGHT, '0284C7', 'FFFFFF'),
        cell('Amount (₹)', 1800, true, AlignmentType.RIGHT, '0284C7', 'FFFFFF')
      ]
    }),
    ...invoice.items.map((item, index) => new TableRow({
      children: [
        cell(String(index + 1), 650, false, AlignmentType.CENTER),
        cell(item.description, 4310),
        cell(String(item.quantity || 1), 800, false, AlignmentType.CENTER),
        cell(formatCurrency(item.unitPrice), 1800, false, AlignmentType.RIGHT),
        cell(formatCurrency(item.amount), 1800, false, AlignmentType.RIGHT)
      ]
    }))
  ];

  const totals = [
    new TableRow({
      children: [
        cell('Subtotal', 6500),
        cell(formatCurrency(invoice.subtotal), 2860, false, AlignmentType.RIGHT)
      ]
    })
  ];
  if (invoice.discountAmount > 0) {
    totals.push(new TableRow({
      children: [
        cell(`Discount (${invoice.discountRate}%)`, 6500),
        cell(`- ${formatCurrency(invoice.discountAmount)}`, 2860, false, AlignmentType.RIGHT)
      ]
    }));
  }
  totals.push(new TableRow({
    children: [
      cell(invoice.gstEnabled !== false ? `GST (${invoice.taxRate}%)` : 'GST', 6500),
      cell(invoice.gstEnabled !== false ? formatCurrency(invoice.taxAmount) : 'Not applied', 2860, false, AlignmentType.RIGHT)
    ]
  }));
  totals.push(new TableRow({
    children: [
      cell('GRAND TOTAL', 6500, true, AlignmentType.LEFT, 'EAF6FF'),
      cell(formatCurrency(invoice.totalAmount), 2860, true, AlignmentType.RIGHT, 'EAF6FF', '1D4ED8')
    ]
  }));

  const clientIdentity = new Table({
    width: { size: INVOICE_TABLE_WIDTH, type: WidthType.DXA },
    columnWidths: [1500, 7860],
    rows: [
      new TableRow({
        children: [
          imageCell(clientLogo, 1500),
          new TableCell({
            width: { size: 7860, type: WidthType.DXA },
            children: [
              new Paragraph({
                children: [new TextRun({ text: invoice.clientCompany || invoice.clientName, bold: true, size: 24, font: 'Arial' })]
              }),
              new Paragraph({
                children: [new TextRun({ text: invoice.clientName, size: 20, color: '475569', font: 'Arial' })]
              })
            ]
          })
        ]
      })
    ],
    borders: tableBorders
  });

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 720, right: 720, bottom: 720, left: 720 }
        }
      },
      children: [
        new Table({
          width: { size: INVOICE_TABLE_WIDTH, type: WidthType.DXA },
          columnWidths: [2100, 7260],
          rows: documentRows,
          layout: TableLayoutType.FIXED,
          borders: { ...tableBorders, insideHorizontal: { ...border, color: 'FFFFFF' }, insideVertical: { ...border, color: 'FFFFFF' } }
        }),
        new Paragraph({ text: '', spacing: { after: 100 } }),
        new Paragraph({
          children: [new TextRun({
            text: invoice.status === 'Draft' ? 'QUOTATION' : invoice.gstEnabled === false ? 'INVOICE' : 'TAX INVOICE',
            bold: true,
            size: 32,
            color: '1D4ED8',
            font: 'Arial'
          })]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Reference: ', bold: true }),
            new TextRun(invoice.invoiceNumber),
            new TextRun({ text: '     Date: ', bold: true }),
            new TextRun(invoice.invoiceDate),
            new TextRun({ text: '     Due: ', bold: true }),
            new TextRun(invoice.dueDate || '—')
          ],
          spacing: { after: 200 }
        }),
        new Paragraph({ children: [new TextRun({ text: 'BILL TO', bold: true, color: '1D4ED8' })] }),
        clientIdentity,
        new Paragraph({ text: `Email: ${invoice.clientEmail || '—'}    Phone: ${invoice.clientPhone || '—'}` }),
        new Paragraph({ text: `Address: ${invoice.clientAddress || '—'}` }),
        new Paragraph({ text: `Project: ${invoice.projectTitle || '—'}`, spacing: { after: 200 } }),
        new Table({
          width: { size: INVOICE_TABLE_WIDTH, type: WidthType.DXA },
          columnWidths: [650, 4310, 800, 1800, 1800],
          rows: lineRows,
          layout: TableLayoutType.FIXED,
          borders: tableBorders
        }),
        new Paragraph({ text: '', spacing: { after: 80 } }),
        new Table({
          width: { size: INVOICE_TABLE_WIDTH, type: WidthType.DXA },
          columnWidths: [6500, 2860],
          rows: totals,
          layout: TableLayoutType.FIXED,
          borders: tableBorders
        }),
        new Paragraph({ text: '', spacing: { after: 160 } }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Amount in words: ', bold: true }),
            new TextRun(numberToWordsINR(invoice.totalAmount))
          ]
        }),
        new Paragraph({ text: `Payment status: ${invoice.status}    Paid: ${formatCurrency(invoice.paidAmount)}` }),
        new Paragraph({ text: `Balance due: ${formatCurrency(invoice.outstandingBalance)}` }),
        ...(invoice.clientGstin ? [new Paragraph({ text: `Client GSTIN: ${invoice.clientGstin}` })] : []),
        ...(invoice.notes ? [new Paragraph({ text: `Notes: ${invoice.notes}`, spacing: { before: 100 } })] : []),
        ...(invoice.paymentInstructions ? [new Paragraph({ text: `Payment instructions: ${invoice.paymentInstructions}` })] : []),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: 'AURA TECH  |  auratech008@gmail.com  |  Coimbatore, Tamil Nadu, India', size: 16, color: '475569' })],
          spacing: { before: 400 }
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new ImageRun({
            data: auraLogo.data,
            type: auraLogo.type,
            transformation: { width: 120, height: 120 }
          })],
          spacing: { before: 160 }
        })
      ]
    }]
  });

  const blob = await Packer.toBlob(doc);
  const downloadUrl = URL.createObjectURL(blob);
  const link = window.document.createElement('a');
  link.href = downloadUrl;
  link.download = `${invoice.invoiceNumber}_AuraTech_with_logos.docx`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
  return !invoice.clientCompanyLogoUrl || Boolean(clientLogo);
}
