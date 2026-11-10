import React, { useRef, useState } from 'react';
import { 
  FileText, Plus, Download, Printer, DollarSign, CheckCircle2, 
  Clock, AlertCircle, Eye, Search, Filter, Trash2, ArrowUpRight, X, Shield,
  Code, Smartphone, Cloud, Users, Check, Sparkles, Send, MapPin, Mail, Phone
} from 'lucide-react';
import { Invoice, InvoiceItem, InvoiceStatus, Client, Project, Payment } from './crmTypes';
import { crmDb } from './crmDbService';
import { downloadInvoicePreviewPDF, generateInvoicePDF, formatINR, numberToWordsINR } from './pdfService';
import { downloadInvoiceWord } from './wordService';
import founderSignature from './assets/founder-signature.png?inline';

interface InvoiceViewProps {
  isAdmin?: boolean;
}

export const InvoiceView: React.FC<InvoiceViewProps> = ({ isAdmin = true }) => {
  const [invoices, setInvoices] = useState<Invoice[]>(crmDb.getInvoices());
  const invoiceSheetRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  
  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);

  // Form states for Create Invoice
  const clients = crmDb.getClients();
  const projects = crmDb.getProjects();
  const projectTasks = crmDb.getTasks();

  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [selectedClientType, setSelectedClientType] = useState<Client['clientType']>(
    clients[0]?.clientType || 'Professional'
  );
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    projects.find(project => project.clientId === clients[0]?.id)?.id || ''
  );
  const selectedProject = projects.find(project => project.id === selectedProjectId);
  const linkedProjects = projects.filter(project => project.clientId === selectedClientId);
  const createProjectInvoiceItem = (project?: Project): InvoiceItem => ({
    id: '1',
    description: project?.title || 'Custom Tech Services',
    quantity: 1,
    unitPrice: project?.budget || 0,
    amount: project?.budget || 0
  });
  const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
  );
  const [clientCompanyLogoUrl, setClientCompanyLogoUrl] = useState('');
  const [gstEnabled, setGstEnabled] = useState(true);
  const [taxRate, setTaxRate] = useState<number>(18);
  const [discountRate, setDiscountRate] = useState<number>(0);
  const [items, setItems] = useState<InvoiceItem[]>([
    createProjectInvoiceItem(projects.find(project => project.id === selectedProjectId))
  ]);
  const [notes, setNotes] = useState<string>('Quotation validity: 15 days. 50% advance before development starts.');

  // Payment Form state
  const [payAmount, setPayAmount] = useState<string>('');
  const [payMethod, setPayMethod] = useState<'Bank Transfer' | 'UPI' | 'Card' | 'Cash' | 'Cheque'>('Bank Transfer');
  const [payRef, setPayRef] = useState<string>('');
  const [payNotes, setPayNotes] = useState<string>('');

  const refreshInvoices = () => {
    setInvoices(crmDb.getInvoices());
  };

  const downloadInvoice = async (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    try {
      await new Promise<void>(resolve => {
        window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve()));
      });
      if (invoiceSheetRef.current) {
        await downloadInvoicePreviewPDF(invoice.invoiceNumber, invoiceSheetRef.current);
      } else {
        const project = projects.find(p => p.id === invoice.projectId);
        const invoiceTasks = projectTasks.filter(t => t.projectId === invoice.projectId);
        await generateInvoicePDF(invoice, project, invoiceTasks);
      }
    } catch {
      try {
        const project = projects.find(p => p.id === invoice.projectId);
        const invoiceTasks = projectTasks.filter(t => t.projectId === invoice.projectId);
        await generateInvoicePDF(invoice, project, invoiceTasks);
      } catch (fallbackError) {
        const message = fallbackError instanceof Error ? fallbackError.message : 'Could not generate the invoice PDF.';
        alert(message);
      }
    }
  };

  const downloadInvoiceDocx = async (invoice: Invoice) => {
    try {
      const clientLogoIncluded = await downloadInvoiceWord(invoice);
      if (!clientLogoIncluded) {
        alert('The Word invoice was downloaded, but the client logo was omitted because its image URL could not be fetched. Use a public image URL or host the logo with the app.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not generate the Word invoice.';
      alert(message);
    }
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0, amount: 0 }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      const q = field === 'quantity' ? Number(value) : item.quantity;
      const u = field === 'unitPrice' ? Number(value) : item.unitPrice;
      item.amount = (q || 0) * (u || 0);
    }
    updated[index] = item;
    setItems(updated);
  };

  // Calculations for Create Modal
  const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const discountAmount = Math.round((subtotal * discountRate) / 100);
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = gstEnabled ? Math.round((taxableAmount * taxRate) / 100) : 0;
  const totalAmount = taxableAmount + taxAmount;

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.id === selectedClientId);
    const project = projects.find(p => p.id === selectedProjectId);

    if (!client) {
      alert('Please select a valid client.');
      return;
    }
    if (selectedProjectId && project?.clientId !== client.id) {
      alert('Please select a project linked to the selected client.');
      return;
    }
    if (client.clientType !== selectedClientType) {
      crmDb.updateClient({ ...client, clientType: selectedClientType });
    }
    let normalizedLogoUrl = '';
    if (clientCompanyLogoUrl.trim()) {
      try {
        const parsedLogoUrl = new URL(clientCompanyLogoUrl.trim());
        if (parsedLogoUrl.protocol !== 'https:' && parsedLogoUrl.protocol !== 'http:') {
          throw new Error();
        }
        normalizedLogoUrl = parsedLogoUrl.toString();
      } catch {
        alert('Enter a valid HTTP or HTTPS URL for the client company logo.');
        return;
      }
    }

    const invCount = crmDb.getInvoices().length + 1;
    const invoiceNumber = `ATQ-2026-${String(invCount).padStart(3, '0')}`;

    crmDb.addInvoice({
      invoiceNumber,
      invoiceDate,
      dueDate,
      clientId: client.id,
      clientName: client.name,
      clientCompany: client.company,
      clientEmail: client.email,
      clientPhone: client.phone,
      clientAddress: client.address,
      clientGstin: client.gstin,
      clientCompanyLogoUrl: normalizedLogoUrl || undefined,
      projectId: project ? project.id : '',
      projectTitle: project ? project.title : 'Custom Tech Services',
      items,
      subtotal,
      discountRate,
      discountAmount,
      gstEnabled,
      taxRate,
      taxAmount,
      totalAmount,
      paidAmount: 0,
      outstandingBalance: totalAmount,
      status: 'Sent',
      paymentInstructions: 'Bank: HDFC Bank Ltd | A/C: 50200089271632 | IFSC: HDFC0001234 | UPI: auratech008@hdfcbank',
      notes
    });

    refreshInvoices();
    setIsCreateModalOpen(false);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentInvoice) return;
    const amt = parseFloat(payAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    crmDb.recordPayment({
      invoiceId: paymentInvoice.id,
      invoiceNumber: paymentInvoice.invoiceNumber,
      clientId: paymentInvoice.clientId,
      clientName: paymentInvoice.clientName,
      projectId: paymentInvoice.projectId,
      amount: amt,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: payMethod,
      transactionReference: payRef || `TXN-${Date.now()}`,
      notes: payNotes,
      recordedBy: 'Main Admin'
    });

    refreshInvoices();
    setIsPaymentModalOpen(false);
    setPaymentInvoice(null);
    setPayAmount('');
    setPayRef('');
    setPayNotes('');
    if (selectedInvoice && selectedInvoice.id === paymentInvoice.id) {
      const updated = crmDb.getInvoices().find(i => i.id === paymentInvoice.id);
      if (updated) setSelectedInvoice(updated);
    }
  };

  // Filtered invoices
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.clientCompany || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.projectTitle || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedInvoiceProject = selectedInvoice
    ? projects.find(project => project.id === selectedInvoice.projectId)
    : undefined;
  const selectedInvoiceTasks = selectedInvoice
    ? projectTasks.filter(task => task.projectId === selectedInvoice.projectId)
    : [];

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'Paid':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Paid</span>;
      case 'Partially Paid':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">Partially Paid</span>;
      case 'Overdue':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">Overdue</span>;
      case 'Sent':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">Sent</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">Draft</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-400" />
            Official Quotation & Invoice Management
          </h2>
          <p className="text-xs text-slate-400">
            Rendered in the exact official Aura Tech branded template layout.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-linear-to-r from-sky-500 to-blue-600 text-white text-xs font-bold uppercase tracking-wider hover:opacity-95 shadow-lg shadow-sky-500/20 flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} />
            Generate Quotation / Invoice
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="relative sm:col-span-2">
          <Search size={15} className="absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search invoice / quotation number, client, company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
          >
            <option value="All">All Invoices Status</option>
            <option value="Paid">Paid</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Overdue">Overdue</option>
            <option value="Sent">Sent</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider font-bold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Ref Number</th>
                <th className="py-3.5 px-4">Client & Company</th>
                <th className="py-3.5 px-4">Project Scope</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Balance</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-sky-400">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{inv.clientCompany || inv.clientName}</div>
                    <div className="text-[11px] text-slate-400">{inv.clientName}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                    {inv.projectTitle}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {inv.invoiceDate}
                  </td>
                  <td className="py-3 px-4 font-bold text-white font-mono">
                    {formatINR(inv.totalAmount)}
                  </td>
                  <td className="py-3 px-4 font-bold font-mono">
                    <span className={inv.outstandingBalance > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                      {formatINR(inv.outstandingBalance)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(inv.status)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        title="Preview Exact Aura Tech Template"
                        className="px-2.5 py-1 text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <Eye size={13} /> View
                      </button>
                      <button
                        onClick={() => downloadInvoice(inv)}
                        title="Download PDF in exact template format"
                        className="p-1.5 text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <Download size={15} />
                      </button>
                      <button
                        onClick={() => downloadInvoiceDocx(inv)}
                        title="Download Word document"
                        aria-label={`Download ${inv.invoiceNumber} as Word document`}
                        className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <FileText size={15} />
                      </button>
                      {isAdmin && inv.outstandingBalance > 0 && (
                        <button
                          onClick={() => {
                            setPaymentInvoice(inv);
                            setPayAmount(String(inv.outstandingBalance));
                            setIsPaymentModalOpen(true);
                          }}
                          title="Record Payment"
                          className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-[11px] font-bold border border-emerald-500/20 transition-colors cursor-pointer"
                        >
                          + Pay
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EXACT USER-PROVIDED INVOICE / QUOTATION PREVIEW MODAL                     */}
      {/* ========================================================================= */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[96vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Top Modal Controls */}
            <div className="p-3.5 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/20">
                  {selectedInvoice.invoiceNumber}
                </span>
                {getStatusBadge(selectedInvoice.status)}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadInvoice(selectedInvoice)}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                >
                  <Download size={14} /> Download Exact PDF
                </button>
                <button
                  onClick={() => downloadInvoiceDocx(selectedInvoice)}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                >
                  <FileText size={14} /> Download Word
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer size={14} /> Print
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* THE EXACT AURA TECH QUOTATION / INVOICE SHEET (Pixel-perfect recreation) */}
            <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-slate-950 flex items-start justify-center">
              <div ref={invoiceSheetRef} data-invoice-pdf-root className="w-full max-w-195 shrink-0 bg-white text-slate-800 p-8 sm:p-12 shadow-2xl font-sans rounded-none relative border border-slate-200">
                
                {/* 1. Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4">
                  <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Aura Tech" className="h-24 w-24 object-contain" />

                  {/* Right: 4 Services with Icons */}
                  <div className="text-[11px] font-semibold text-slate-600 space-y-0.5 sm:text-right">
                    <p className="flex items-center sm:justify-end gap-1.5"><span className="text-blue-600 font-mono text-xs">&lt;/&gt;</span> Web Development</p>
                    <p className="flex items-center sm:justify-end gap-1.5"><span className="text-blue-600 text-xs">📱</span> Mobile Applications</p>
                    <p className="flex items-center sm:justify-end gap-1.5"><span className="text-blue-600 text-xs">☁</span> Digital Solutions</p>
                    <p className="flex items-center sm:justify-end gap-1.5"><span className="text-blue-600 text-xs">👥</span> IT Consulting</p>
                  </div>
                </div>

                <div className="w-full h-px bg-slate-200 my-2"></div>

                {/* 2. Document Title & Meta Box */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4">
                  <div>
                    <h2 className="text-3xl font-black text-blue-700 uppercase tracking-tight">
                      {selectedInvoice.status === 'Draft'
                        ? 'QUOTATION'
                        : selectedInvoice.gstEnabled === false ? 'INVOICE' : 'TAX INVOICE'}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">Build. Grow. Succeed Together.</p>
                  </div>

                  {/* Metadata Card */}
                  <div className="p-3 px-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 min-w-50">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Quotation No :</span>
                      <span className="font-bold text-slate-900 font-mono">{selectedInvoice.invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Date :</span>
                      <span className="font-bold text-slate-900">{selectedInvoice.invoiceDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Validity :</span>
                      <span className="font-bold text-slate-900">{selectedInvoice.dueDate || '15 Days'}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Client "To" Section & Right Scope Highlight Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 text-xs">
                  {/* Left: To Client */}
                  <div className="space-y-1.5 pr-2">
                    <p className="text-slate-500 font-semibold">To,</p>
                    <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">
                      {selectedInvoice.clientCompany || selectedInvoice.clientName}
                    </h3>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      {selectedInvoiceProject?.description || `Please find the project scope and charges for ${selectedInvoice.projectTitle || 'the services listed below'}.`}
                    </p>
                  </div>

                  {/* Right: Client Project Scope Card */}
                  <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-100 space-y-1.5">
                    <div className="flex items-center gap-2">
                      {selectedInvoice.clientCompanyLogoUrl && (
                        <img
                          src={selectedInvoice.clientCompanyLogoUrl}
                          alt={`${selectedInvoice.clientCompany || selectedInvoice.clientName} logo`}
                          onError={(event) => { event.currentTarget.style.display = 'none'; }}
                          className="h-8 w-8 shrink-0 rounded-md bg-white object-contain p-1"
                        />
                      )}
                      {!selectedInvoice.clientCompanyLogoUrl && (
                        <span className="text-emerald-600 text-base">🌱</span>
                      )}
                      <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 text-xs">
                            {selectedInvoice.clientCompany || selectedInvoice.clientName}
                          </h4>
                          <p className="text-[10px] text-slate-500 font-medium">{selectedInvoice.projectTitle}</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {selectedInvoiceProject?.description || 'Scope of work is detailed in the invoice line items below.'}
                    </p>
                  </div>
                </div>

                {/* 4. Scope of Work Table (Solid Blue Header Row from Reference Image) */}
                <div className="py-4">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-sky-600 text-white font-bold text-xs uppercase">
                        <th className="py-2.5 px-3 w-12 text-center">No.</th>
                        <th className="py-2.5 px-4">Scope of Work</th>
                        <th className="py-2.5 px-4 text-right w-36">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 border-x border-b border-slate-200">
                      {(selectedInvoice.items || []).map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/40">
                          <td className="py-3 px-3 text-center text-slate-600 font-bold align-top">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-4 space-y-1">
                            <p className="font-bold text-slate-900 text-xs">{item.description}</p>
                          </td>
                          <td className="py-3 px-4 text-right font-black text-slate-900 font-mono text-sm align-top">
                            ₹ {(item.amount || 0).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Total Highlight Band (Matches Reference Image) */}
                  <div className="flex justify-end p-3 px-4 bg-sky-50 border-x border-b border-sky-200 text-xs">
                    <div className="w-full max-w-xs space-y-1.5 text-right">
                      <div className="flex justify-between text-slate-600">
                        <span>Subtotal</span>
                        <span className="font-mono">₹ {(selectedInvoice.subtotal || 0).toLocaleString('en-IN')}</span>
                      </div>
                      {selectedInvoice.discountAmount > 0 && (
                        <div className="flex justify-between text-slate-600">
                          <span>Discount ({selectedInvoice.discountRate}%)</span>
                          <span className="font-mono">− ₹ {(selectedInvoice.discountAmount || 0).toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {selectedInvoice.gstEnabled !== false ? (
                        <div className="flex justify-between text-slate-600">
                          <span>GST ({selectedInvoice.taxRate}%)</span>
                          <span className="font-mono">₹ {(selectedInvoice.taxAmount || 0).toLocaleString('en-IN')}</span>
                        </div>
                      ) : (
                        <div className="flex justify-between text-slate-500">
                          <span>GST</span>
                          <span>Not applied</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-sky-200 pt-1.5">
                        <span className="font-black text-slate-900 text-sm">Total Amount (INR)</span>
                        <span className="font-black text-blue-700 text-lg font-mono">
                          ₹ {(selectedInvoice.totalAmount || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Actual Work Items from the Linked Project */}
                <div className="py-4">
                  <h3 className="mb-2 text-[10px] font-black uppercase tracking-wide text-blue-700">Project Work Scope</h3>
                  {selectedInvoiceTasks.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedInvoiceTasks.map(task => (
                        <div key={task.id} className="rounded-lg border border-sky-100 bg-sky-50/70 p-2.5">
                          <p className="text-[10px] font-bold text-slate-800">{task.title}</p>
                          {task.description && <p className="mt-1 text-[9px] leading-relaxed text-slate-600">{task.description}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-lg border border-sky-100 bg-sky-50/70 p-2.5 text-[10px] leading-relaxed text-slate-600">
                      {selectedInvoiceProject?.description || 'Refer to the invoice line items for the agreed scope of work.'}
                    </p>
                  )}
                </div>

                {/* 6. Terms & Signature Block (3 Columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200 text-xs">
                  {/* Payment Terms */}
                  <div className="space-y-1">
                    <p className="font-bold text-blue-700 flex items-center gap-1">
                      <span>⬇</span> Payment Terms
                    </p>
                    <ul className="text-[10px] text-slate-600 space-y-1">
                      <li>• 50% advance before development starts.</li>
                      <li>• 50% on completion and final delivery.</li>
                      <li>• Balance Due: <span className="font-bold text-slate-800 font-mono">₹ {(selectedInvoice.outstandingBalance || 0).toLocaleString('en-IN')}</span></li>
                    </ul>
                  </div>

                  {/* Other Terms */}
                  <div className="space-y-1">
                    <p className="font-bold text-blue-700 flex items-center gap-1">
                      <span>🕒</span> Other Terms
                    </p>
                    <ul className="text-[10px] text-slate-600 space-y-0.5">
                      <li>• Quotation validity: 15 days.</li>
                      <li>• GST: {selectedInvoice.gstEnabled !== false ? `${selectedInvoice.taxRate}% included.` : 'Not applied.'}</li>
                      <li>• Delivery: 7 – 10 working days.</li>
                      <li>• Hosting & domain: Client responsibility.</li>
                      <li>• Maintenance: Separately discussable.</li>
                    </ul>
                  </div>

                  {/* Signature Section */}
                  <div className="space-y-1 sm:text-right">
                    <p className="text-[10px] text-slate-500">We look forward to your valuable confirmation.</p>
                    <p className="font-bold text-slate-900 text-xs mt-1">For AURA TECH</p>
                    
                    <div className="flex h-16 w-20 items-center sm:ml-auto">
                      <img src={founderSignature} alt="Niranjan A's signature" className="h-full w-full object-contain object-right" />
                    </div>

                    <div>
                      <p className="font-black text-slate-900 text-xs">Niranjan A</p>
                      <p className="text-[10px] text-slate-500">Founder & CEO</p>
                      <p className="text-[10px] font-bold text-slate-700">AURA TECH</p>
                    </div>
                  </div>
                </div>

                {/* 7. Dark Full-Width Bottom Bar (Exact footer from reference image) */}
                <div className="mt-8 -mx-8 -mb-8 sm:-mx-12 sm:-mb-12 bg-slate-950 text-white p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t-2 border-sky-500">
                  <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Aura Tech" className="h-14 w-14 rounded-lg bg-white p-1 object-contain" />

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-300">
                    <span className="flex items-center gap-1.5"><Mail size={12} className="text-sky-400" /> auratech008@gmail.com</span>
                    <span className="flex items-center gap-1.5"><Phone size={12} className="text-sky-400" /> +91 9025255617</span>
                    <span className="flex items-center gap-1.5"><MapPin size={12} className="text-sky-400" /> Coimbatore, Tamil Nadu, India</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: CREATE NEW INVOICE */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Generate Quotation / Invoice</h3>
                <p className="text-xs text-slate-400">Generated according to Aura Tech's official design template.</p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1.5">Client</label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => {
                      setSelectedClientId(e.target.value);
                      const nextClient = clients.find(client => client.id === e.target.value);
                      setSelectedClientType(nextClient?.clientType || 'Professional');
                      const nextProject = projects.find(project => project.clientId === e.target.value);
                      setSelectedProjectId(nextProject?.id || '');
                      setItems([createProjectInvoiceItem(nextProject)]);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name} — {c.company} ({c.clientType})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1.5">Client Type</label>
                  <select
                    value={selectedClientType}
                    onChange={(e) => setSelectedClientType(e.target.value as Client['clientType'])}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Professional">Professional / Startup</option>
                    <option value="Enterprise">Enterprise</option>
                    <option value="Student">Student (50% Concession)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1.5">Linked Project</label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => {
                      const nextProject = projects.find(project => project.id === e.target.value);
                      setSelectedProjectId(e.target.value);
                      setItems([createProjectInvoiceItem(nextProject)]);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="">No linked project — Custom Tech Services</option>
                    {linkedProjects.map(p => (
                      <option key={p.id} value={p.id}>{p.title} — {p.projectType} ({p.status})</option>
                    ))}
                  </select>
                  <p className="mt-1.5 text-[11px] text-slate-500">
                    {linkedProjects.length
                      ? `${linkedProjects.length} project${linkedProjects.length === 1 ? '' : 's'} linked to this client.`
                      : 'No projects are linked to this client; the invoice will use Custom Tech Services.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1.5">Date</label>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1.5">Validity (Days / Due Date)</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1.5">Client Company Logo URL</label>
                <input
                  type="url"
                  value={clientCompanyLogoUrl}
                  onChange={(e) => setClientCompanyLogoUrl(e.target.value)}
                  placeholder="https://example.com/company-logo.png"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500"
                />
                <p className="mt-1.5 text-[11px] text-slate-500">The logo will appear in the invoice preview and PDF.</p>
              </div>
              <div className="flex items-start">
                <label className="mt-6 flex w-full items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-3 cursor-pointer">
                  <span>
                    <span className="block font-bold uppercase tracking-wider text-slate-300">GST on invoice</span>
                    <span className="mt-1 block text-[11px] text-slate-500">
                      {gstEnabled ? `Add GST (${taxRate}%) to the bill total.` : 'GST will not be added to the bill total.'}
                    </span>
                  </span>
                  <input
                    type="checkbox"
                    checked={gstEnabled}
                    onChange={(e) => setGstEnabled(e.target.checked)}
                    className="h-4 w-4 accent-sky-500"
                  />
                </label>
              </div>
              </div>

              {/* Line Items */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <label className="font-bold uppercase tracking-wider text-slate-300">Deliverable Scope & Amount</label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={14} /> Add Deliverable Item
                  </button>
                </div>

                {items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="col-span-8">
                      <input
                        type="text"
                        placeholder="Scope description..."
                        value={item.description}
                        required
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        min="0"
                        placeholder="Amount (₹)"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-right text-xs font-mono"
                      />
                    </div>
                    <div className="col-span-1 text-center">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Banner */}
              <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 flex flex-wrap justify-between items-center gap-3 text-xs">
                <div>
                  <span className="text-slate-400">Total Scope Value: </span>
                  <span className="font-mono text-white font-bold">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="text-right">
                  <div className="text-slate-400">
                    {gstEnabled ? `GST (${taxRate}%): ₹${taxAmount.toLocaleString('en-IN')}` : 'GST: Not applied'}
                  </div>
                  <div>
                    <span className="text-slate-300 font-bold uppercase tracking-wider mr-2">Grand Total:</span>
                    <span className="text-base font-black text-sky-400 font-mono">₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold uppercase tracking-wider"
                >
                  Save & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RECORD PAYMENT */}
      {isPaymentModalOpen && paymentInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Record Payment</h3>
                <p className="text-xs text-slate-400">{paymentInvoice.invoiceNumber} — {paymentInvoice.clientName}</p>
              </div>
              <button onClick={() => setIsPaymentModalOpen(false)} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1.5">Amount (₹)</label>
                <input
                  type="number"
                  step="1"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="e.g. 5500"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono font-bold focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">Outstanding Balance: ₹{paymentInvoice.outstandingBalance.toLocaleString('en-IN')}</p>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1.5">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="Bank Transfer">Bank Transfer / NEFT / RTGS</option>
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="Card">Credit / Debit Card</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1.5">Transaction Reference / UTR</label>
                <input
                  type="text"
                  placeholder="e.g. UPI-REF-98172948"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold tracking-wider uppercase text-xs"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
