import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher';
import { api } from '../../services/api';
import { Expense, FinancialSummary, Payment, Invoice } from '../../types';
import { DashboardLayout, NAV_ITEMS } from '../../components/dashboard/DashboardLayout';
import { InvoiceModal } from '../../components/common/InvoiceModal';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Receipt,
  CreditCard,
  PlusCircle,
  FileText,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Calendar,
  LogOut,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  RefreshCw,
  Wallet,
  Building,
  Printer,
  Eye,
  X
} from 'lucide-react';

interface AccountantDashboardProps { onNavigateToWebsite: () => void; }

export const AccountantDashboard: React.FC<AccountantDashboardProps> = ({ onNavigateToWebsite }) => {
  const { user, logout } = useAuth();
  const { t, formatCurrency, formatDate } = useLanguage();

  const [activeTab, setActiveTab] = useState<'ledger' | 'payments' | 'invoices' | 'expenses' | 'reports'>('ledger');
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);

  // New Expense Modal State
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('utilities');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseMethod, setExpenseMethod] = useState('bank_transfer');
  const [expenseRef, setExpenseRef] = useState('');
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [expenseNotes, setExpenseNotes] = useState('');
  const [submittingExpense, setSubmittingExpense] = useState(false);

  // Search & Filters for Expenses
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Invoices Tab State
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<'all' | 'paid' | 'partially_paid' | 'unpaid'>('all');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | string | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Record Payment Modal State
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);
  const [recordPaymentAmount, setRecordPaymentAmount] = useState('');
  const [recordPaymentMethod, setRecordPaymentMethod] = useState('telebirr');
  const [recordPaymentRef, setRecordPaymentRef] = useState('');
  const [recordPaymentNotes, setRecordPaymentNotes] = useState('');
  const [recordingPayment, setRecordingPayment] = useState(false);

  useEffect(() => {
    loadAccountantData();
  }, []);

  const loadAccountantData = async () => {
    setLoading(true);
    try {
      const [sumRes, expRes, payRes, invRes] = await Promise.all([
        api.get<FinancialSummary>('/expenses/summary').catch(() => null),
        api.get<Expense[]>('/expenses').catch(() => []),
        api.get<Payment[]>('/payments').catch(() => []),
        api.get<Invoice[]>('/invoices').catch(() => []),
      ]);
      setSummary(sumRes);
      setExpenses(expRes || []);
      setPayments(payRes || []);
      setInvoices(invRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle || !expenseAmount) return;

    setSubmittingExpense(true);
    try {
      await api.post('/expenses', {
        title: expenseTitle,
        category: expenseCategory,
        amount: Number(expenseAmount),
        payment_method: expenseMethod,
        reference_number: expenseRef,
        expense_date: expenseDate,
        notes: expenseNotes,
      });

      setShowExpenseModal(false);
      setExpenseTitle('');
      setExpenseAmount('');
      setExpenseRef('');
      setExpenseNotes('');
      loadAccountantData();
    } catch (err: any) {
      alert(err.message || 'Failed to record expense');
    } finally {
      setSubmittingExpense(false);
    }
  };

  const filteredExpenses = expenses.filter((exp) => {
    const matchCat = filterCategory === 'all' || exp.category === filterCategory;
    const matchQuery =
      !searchQuery ||
      exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.reference_number?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  const handleOpenRecordPayment = (inv: Invoice, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedInvoiceForPayment(inv);
    setRecordPaymentAmount(inv.balance_due ? String(inv.balance_due) : '');
    setRecordPaymentRef(`PAY-${Date.now().toString().slice(-6)}`);
    setRecordPaymentNotes(`Settlement for invoice #${inv.invoice_number}`);
    setShowRecordPaymentModal(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForPayment || !recordPaymentAmount || Number(recordPaymentAmount) <= 0) return;

    setRecordingPayment(true);
    try {
      await api.post('/payments', {
        booking_id: selectedInvoiceForPayment.booking_id,
        amount: Number(recordPaymentAmount),
        payment_method: recordPaymentMethod,
        notes: recordPaymentNotes ? `${recordPaymentNotes} (Ref: ${recordPaymentRef})` : recordPaymentRef || undefined,
      });

      setShowRecordPaymentModal(false);
      setSelectedInvoiceForPayment(null);
      setRecordPaymentAmount('');
      setRecordPaymentRef('');
      setRecordPaymentNotes('');
      await loadAccountantData();
    } catch (err: any) {
      alert(err.message || 'Failed to record payment transaction');
    } finally {
      setRecordingPayment(false);
    }
  };

  // Summary Metrics for Invoices
  const totalInvoicesCount = invoices.length;
  const totalInvoicedAmount = invoices.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);
  const totalPaidAmount = invoices.reduce((sum, inv) => sum + Number(inv.paid_amount || 0), 0);
  const totalOutstandingBalance = invoices.reduce((sum, inv) => sum + Number(inv.balance_due || 0), 0);

  // Filtered Invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus = invoiceStatusFilter === 'all' || inv.status === invoiceStatusFilter;
    const q = invoiceSearchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      inv.invoice_number?.toLowerCase().includes(q) ||
      inv.customer_name?.toLowerCase().includes(q) ||
      inv.booking_reference?.toLowerCase().includes(q) ||
      inv.room_number?.toString().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab as any)}
      navItems={NAV_ITEMS.accountant}
      onNavigateToWebsite={onNavigateToWebsite}
      title="Finance & Accounting"
    >
      {/* Main Content Area */}
      <div className="space-y-8">
        {/* SUMMARY TAB */}
        {activeTab === 'ledger' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Top Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span>Total Payments Revenue</span>
                  <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-serif font-bold text-emerald-400 mb-1">
                  {formatCurrency(summary?.totalIncome || 0)}
                </div>
                <span className="text-[11px] text-slate-400">From guest bookings & hotel services</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span>Operating Expenses</span>
                  <ArrowDownRight className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-2xl font-serif font-bold text-rose-400 mb-1">
                  {formatCurrency(summary?.totalExpenses || 0)}
                </div>
                <span className="text-[11px] text-slate-400">Utilities, food supply, maintenance</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span>Net Hotel Balance (Profit)</span>
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                </div>
                <div className={`text-2xl font-serif font-bold mb-1 ${
                  (summary?.netProfit || 0) >= 0 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {formatCurrency(summary?.netProfit || 0)}
                </div>
                <span className="text-[11px] text-slate-400">Revenue minus total operational costs</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span>Outstanding Receivables</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-serif font-bold text-amber-300 mb-1">
                  {formatCurrency(summary?.outstandingInvoices || 0)}
                </div>
                <span className="text-[11px] text-slate-400">Unpaid & partially paid guest folios</span>
              </div>
            </div>

            {/* Breakdowns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Income by Payment Method */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-serif font-bold text-base text-white flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-emerald-400" /> Income by Payment Channel
                  </h3>
                  <span className="text-xs text-emerald-400 font-semibold">Verified Receipts</span>
                </div>

                <div className="space-y-3">
                  {summary?.paymentMethodBreakdown?.map((pm) => (
                    <div key={pm.payment_method} className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div>
                        <span className="font-bold text-slate-200 capitalize">
                          {pm.payment_method === 'telebirr' ? 'Telebirr (Ethio Telecom)' :
                           pm.payment_method === 'cbe_birr' ? 'CBE Birr (Commercial Bank)' :
                           pm.payment_method === 'bank_transfer' ? 'Direct Bank Transfer' :
                           pm.payment_method === 'cash' ? 'Cash at Front Desk' :
                           pm.payment_method}
                        </span>
                        <span className="text-[10px] text-slate-500 block">{pm.count} transactions</span>
                      </div>
                      <span className="font-bold text-emerald-400 font-serif text-sm">
                        {formatCurrency(pm.total)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expenses by Category */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-serif font-bold text-base text-white flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-rose-400" /> Operating Expenses by Category
                  </h3>
                  <button
                    onClick={() => setShowExpenseModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Record Expense
                  </button>
                </div>

                <div className="space-y-3">
                  {summary?.categoryBreakdown?.map((cat) => (
                    <div key={cat.category} className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div>
                        <span className="font-bold text-slate-200 capitalize">
                          {cat.category === 'utilities' ? 'Utilities (Electricity, Water, Generator)' :
                           cat.category === 'food_beverage' ? 'Food Supplies & Kitchen (Merkato)' :
                           cat.category === 'supplies' ? 'Linen, Cleaning & Guest Amenities' :
                           cat.category === 'maintenance' ? 'Facility Repairs & HVAC Systems' :
                           cat.category}
                        </span>
                        <span className="text-[10px] text-slate-500 block">{cat.count} recorded payments</span>
                      </div>
                      <span className="font-bold text-rose-400 font-serif text-sm">
                        {formatCurrency(cat.total)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EXPENSES TAB */}
        {activeTab === 'expenses' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-white">Hotel Expense Ledger</h3>
                <p className="text-xs text-slate-400">Track all operational payments made to Ethiopian suppliers and utilities</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowExpenseModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-lg cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" /> Add Hotel Expense
                </button>
              </div>
            </div>

            {/* Filter bar */}
            <div className="flex flex-wrap items-center gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search expenses by title or TX ref..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Categories</option>
                <option value="utilities">Utilities</option>
                <option value="food_beverage">Food & Beverage</option>
                <option value="supplies">Supplies & Linen</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            {/* Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Expense Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Ref Number</th>
                    <th className="py-3 px-4 text-right">Amount (ETB)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 whitespace-nowrap text-slate-400">{formatDate(exp.expense_date)}</td>
                      <td className="py-3 px-4 font-bold text-white">
                        <div>{exp.title}</div>
                        {exp.notes && <span className="text-[10px] text-slate-500 font-normal">{exp.notes}</span>}
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] uppercase font-bold text-slate-300">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 capitalize">{exp.payment_method?.replace('_', ' ')}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-amber-400">{exp.reference_number || 'N/A'}</td>
                      <td className="py-3 px-4 text-right font-serif font-bold text-rose-400 text-sm">
                        {formatCurrency(exp.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PAYMENTS TAB */}
        {activeTab === 'payments' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="font-serif text-xl font-bold text-white">Guest Payment Transactions</h3>
              <p className="text-xs text-slate-400">All confirmed guest payments via Telebirr, CBE Birr, Bank Transfers, and Cash</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Payment Ref</th>
                    <th className="py-3 px-4">Guest / Booking</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Amount (ETB)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono text-amber-400 font-bold">{p.payment_reference}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-white block">{p.customer_name || 'Guest Stay'}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{p.booking_reference}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] font-bold text-slate-300 uppercase">
                          {p.payment_method}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{formatDate(p.created_at)}</td>
                      <td className="py-3 px-4">
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Completed
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-serif font-bold text-emerald-400 text-sm">
                        {formatCurrency(p.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* INVOICES TAB */}
        {activeTab === 'invoices' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-white">Guest Folios & Invoices</h3>
                <p className="text-xs text-slate-400">Review room charges, hotel services, occupancy taxes, and settled folios</p>
              </div>
              <button
                onClick={loadAccountantData}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer w-fit"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Invoices</span>
              </button>
            </div>

            {/* 4 Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Total Invoices</span>
                  <FileText className="w-4 h-4 text-amber-400" />
                </div>
                <div className="font-serif text-2xl font-bold text-white">{totalInvoicesCount}</div>
                <span className="text-[10px] text-slate-500 mt-1 block">Issued guest folios</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Total Invoiced</span>
                  <DollarSign className="w-4 h-4 text-amber-400" />
                </div>
                <div className="font-serif text-2xl font-bold text-amber-400">{formatCurrency(totalInvoicedAmount)}</div>
                <span className="text-[10px] text-slate-500 mt-1 block">Gross billed charges</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Total Paid</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="font-serif text-2xl font-bold text-emerald-400">{formatCurrency(totalPaidAmount)}</div>
                <span className="text-[10px] text-slate-500 mt-1 block">Confirmed settlements</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Outstanding Balance</span>
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                </div>
                <div className="font-serif text-2xl font-bold text-rose-400">{formatCurrency(totalOutstandingBalance)}</div>
                <span className="text-[10px] text-slate-500 mt-1 block">Receivable from guests</span>
              </div>
            </div>

            {/* Search & Filter Bar ABOVE Table */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search invoices by invoice #, guest name, booking ref, or room..."
                  value={invoiceSearchQuery}
                  onChange={(e) => setInvoiceSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto">
                {(['all', 'paid', 'partially_paid', 'unpaid'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setInvoiceStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      invoiceStatusFilter === st
                        ? 'bg-amber-500 text-slate-950 font-bold shadow'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {st === 'all' ? 'All Invoices' : st === 'paid' ? 'Paid' : st === 'partially_paid' ? 'Partially Paid' : 'Unpaid'}
                  </button>
                ))}
              </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Invoice #</th>
                      <th className="py-3 px-4">Guest Name</th>
                      <th className="py-3 px-4">Booking Ref</th>
                      <th className="py-3 px-4">Room</th>
                      <th className="py-3 px-4">Total Amount</th>
                      <th className="py-3 px-4">Paid</th>
                      <th className="py-3 px-4">Balance Due</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-300">
                    {filteredInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-slate-500">
                          No invoices found matching your search and filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredInvoices.map((inv) => (
                        <tr
                          key={inv.id}
                          onClick={() => {
                            setSelectedInvoiceId(inv.id);
                            setShowInvoiceModal(true);
                          }}
                          className="hover:bg-slate-800/60 cursor-pointer transition-colors group"
                        >
                          <td className="py-3 px-4 font-mono text-amber-400 font-bold group-hover:underline">
                            {inv.invoice_number}
                          </td>
                          <td className="py-3 px-4 font-semibold text-white">
                            <div>{inv.customer_name}</div>
                            {inv.customer_email && (
                              <span className="text-[10px] text-slate-500 font-normal">{inv.customer_email}</span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-400">{inv.booking_reference}</td>
                          <td className="py-3 px-4 text-slate-300">
                            {inv.room_number ? `#${inv.room_number}` : 'N/A'}
                          </td>
                          <td className="py-3 px-4 font-serif font-bold text-white">
                            {formatCurrency(inv.total_amount)}
                          </td>
                          <td className="py-3 px-4 font-serif text-emerald-400 font-semibold">
                            {formatCurrency(inv.paid_amount)}
                          </td>
                          <td className="py-3 px-4 font-serif text-rose-400 font-bold">
                            {formatCurrency(inv.balance_due)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                                inv.status === 'paid'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : inv.status === 'partially_paid'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              {inv.status === 'paid' && <CheckCircle2 className="w-2.5 h-2.5" />}
                              {inv.status === 'partially_paid' && <Clock className="w-2.5 h-2.5" />}
                              {inv.status === 'unpaid' && <AlertCircle className="w-2.5 h-2.5" />}
                              {inv.status?.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              {/* View */}
                              <button
                                onClick={() => {
                                  setSelectedInvoiceId(inv.id);
                                  setShowInvoiceModal(true);
                                }}
                                title="View Details"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Print */}
                              <button
                                onClick={() => {
                                  setSelectedInvoiceId(inv.id);
                                  setShowInvoiceModal(true);
                                }}
                                title="Print Invoice"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>

                              {/* Download PDF */}
                              <button
                                onClick={() => {
                                  setSelectedInvoiceId(inv.id);
                                  setShowInvoiceModal(true);
                                }}
                                title="Download PDF"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>

                              {/* Record Payment */}
                              {Number(inv.balance_due) > 0 && (
                                <button
                                  onClick={(e) => handleOpenRecordPayment(inv, e)}
                                  title="Record Payment"
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-[11px] shadow transition-all cursor-pointer"
                                >
                                  <CreditCard className="w-3 h-3" />
                                  <span>Pay</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      
      {/* Record Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl text-slate-100">
            <h3 className="font-serif font-bold text-lg text-white mb-1">Record Hotel Operating Expense</h3>
            <p className="text-xs text-slate-400 mb-4">Add a verifiable expenditure in Ethiopian Birr (ETB)</p>

            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Expense Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ethiopian Electric Power - Bole Substation"
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category *</label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="utilities">Utilities (Power, Water)</option>
                    <option value="food_beverage">Food & Beverage (Supplies)</option>
                    <option value="supplies">Guest Amenities & Linen</option>
                    <option value="maintenance">Maintenance & Repairs</option>
                    <option value="salaries">Salaries & Payroll</option>
                    <option value="other">Other Operations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Amount (ETB) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    placeholder="e.g. 15000"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-serif font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Method</label>
                  <select
                    value={expenseMethod}
                    onChange={(e) => setExpenseMethod(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="bank_transfer">Bank Transfer (CBE / Awash)</option>
                    <option value="telebirr">Telebirr (Ethio Telecom)</option>
                    <option value="cbe_birr">CBE Birr</option>
                    <option value="cash">Cash Settlement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Reference / TX #</label>
                  <input
                    type="text"
                    placeholder="e.g. CBE-TX-998822"
                    value={expenseRef}
                    onChange={(e) => setExpenseRef(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Expense Date *</label>
                <input
                  type="date"
                  required
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Description</label>
                <textarea
                  rows={2}
                  placeholder="Optional details..."
                  value={expenseNotes}
                  onChange={(e) => setExpenseNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingExpense}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submittingExpense ? 'Recording...' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showRecordPaymentModal && selectedInvoiceForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-serif font-bold text-base text-white">Record Guest Payment</h3>
                  <p className="text-[11px] text-slate-400">Invoice #{selectedInvoiceForPayment.invoice_number}</p>
                </div>
              </div>
              <button
                onClick={() => setShowRecordPaymentModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Folio Summary */}
            <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Guest:</span>
                <span className="font-semibold text-white">{selectedInvoiceForPayment.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Booking Ref:</span>
                <span className="font-mono text-amber-400">{selectedInvoiceForPayment.booking_reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Billed:</span>
                <span className="font-bold text-white">{formatCurrency(selectedInvoiceForPayment.total_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Already Paid:</span>
                <span className="font-semibold text-emerald-400">{formatCurrency(selectedInvoiceForPayment.paid_amount)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-1.5">
                <span className="text-slate-300 font-bold">Outstanding Balance:</span>
                <span className="font-bold text-rose-400 font-serif">{formatCurrency(selectedInvoiceForPayment.balance_due)}</span>
              </div>
            </div>

            <form onSubmit={handleRecordPayment} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Amount (ETB) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  max={selectedInvoiceForPayment.balance_due}
                  placeholder={`Max: ${selectedInvoiceForPayment.balance_due}`}
                  value={recordPaymentAmount}
                  onChange={(e) => setRecordPaymentAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-serif text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Channel / Method *</label>
                <select
                  value={recordPaymentMethod}
                  onChange={(e) => setRecordPaymentMethod(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="telebirr">Telebirr (Ethiopian Telecom)</option>
                  <option value="cbe_birr">Commercial Bank of Ethiopia (CBE Birr)</option>
                  <option value="bank_transfer">Bank Wire (Awash / Dashen / CBE)</option>
                  <option value="card">Credit / Debit Card (Visa / Mastercard)</option>
                  <option value="cash">Front Desk Cash (ETB)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Transaction Ref / Slip #</label>
                <input
                  type="text"
                  placeholder="e.g. TX-ET-849204"
                  value={recordPaymentRef}
                  onChange={(e) => setRecordPaymentRef(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Receipt Notes / Folio Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Settled at checkout via Telebirr"
                  value={recordPaymentNotes}
                  onChange={(e) => setRecordPaymentNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRecordPaymentModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recordingPayment}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs transition-all cursor-pointer shadow-lg disabled:opacity-50"
                >
                  {recordingPayment ? 'Posting...' : 'Confirm & Post Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Invoice Details & Receipt Modal */}
      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        invoiceIdOrBookingId={selectedInvoiceId}
      />
      </div>
    </DashboardLayout>
  );
};

