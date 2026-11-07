import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Booking, HotelService } from '../../types';
import { InvoiceModal } from '../../components/common/InvoiceModal';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import {
  Crown,
  Calendar,
  Clock,
  Sparkles,
  FileText,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  Send,
  Bed,
  CreditCard,
  Search,
  Eye,
  Printer,
  Download,
  RotateCcw,
  Building,
  Info,
  ChevronRight,
  ShieldAlert,
  X
} from 'lucide-react';

interface CustomerDashboardProps { onNavigateToWebsite: () => void; }

interface GuestComplaint {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'under_investigation' | 'resolved' | 'closed';
  resolution_notes?: string;
  created_at: string;
  resolved_at?: string;
  booking_reference?: string;
  department_name?: string;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ onNavigateToWebsite }) => {
  const { user } = useAuth();
  const { formatCurrency, formatDate } = useLanguage();

  const [activeTab, setActiveTab] = useState<'bookings' | 'services' | 'complaints'>('bookings');

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<HotelService[]>([]);
  const [complaints, setComplaints] = useState<GuestComplaint[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [stayFilter, setStayFilter] = useState<'all' | 'current' | 'upcoming' | 'past'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Booking Details Modal
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingDetailsModal, setShowBookingDetailsModal] = useState(false);

  // Invoice modal
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | string | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Housekeeping Request Modal
  const [housekeepingBooking, setHousekeepingBooking] = useState<Booking | null>(null);
  const [housekeepingType, setHousekeepingType] = useState('Extra Towels & Luxury Toiletries');
  const [housekeepingNotes, setHousekeepingNotes] = useState('');
  const [submittingHousekeeping, setSubmittingHousekeeping] = useState(false);

  // Late Checkout Request Modal
  const [lateCheckoutBooking, setLateCheckoutBooking] = useState<Booking | null>(null);
  const [requestedCheckoutTime, setRequestedCheckoutTime] = useState('14:00');
  const [lateCheckoutReason, setLateCheckoutReason] = useState('Late flight departure from Bole Airport');
  const [submittingLateCheckout, setSubmittingLateCheckout] = useState(false);

  // Order Service Modal
  const [orderBooking, setOrderBooking] = useState<Booking | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<number>(0);
  const [serviceQuantity, setServiceQuantity] = useState(1);
  const [serviceNotes, setServiceNotes] = useState('');
  const [orderingService, setOrderingService] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  // Complaint / Request Form
  const [complaintCategory, setComplaintCategory] = useState('Front Desk & Concierge');
  const [complaintTitle, setComplaintTitle] = useState('');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [complaintPriority, setComplaintPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [submittingComplaint, setSubmittingComplaint] = useState(false);
  const [complaintSuccess, setComplaintSuccess] = useState<string | null>(null);

  const loadGuestData = async () => {
    setLoading(true);
    try {
      const [bList, sList, cList] = await Promise.all([
        api.get<Booking[]>('/bookings').catch(() => []),
        api.get<HotelService[]>('/services?available_only=true').catch(() => []),
        api.get<GuestComplaint[]>('/complaints').catch(() => []),
      ]);
      setBookings(bList || []);
      setServices(sList || []);
      setComplaints(cList || []);
      if (sList && sList.length > 0 && !selectedServiceId) {
        setSelectedServiceId(sList[0].id);
      }
    } catch (e) {
      console.error('Failed to load guest data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGuestData();
  }, []);

  /** Helper to format ISO dates to clean, human-readable strings */
  const formatReadableDate = (dateStr?: string, includeTime = false) => {
    if (!dateStr) return 'N/A';
    try {
      const clean = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
      const parts = clean.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        const dateFormatted = d.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
        if (includeTime && dateStr.includes('T')) {
          const timePart = dateStr.split('T')[1].slice(0, 5);
          return `${dateFormatted} at ${timePart}`;
        }
        return dateFormatted;
      }
      return formatDate(dateStr);
    } catch {
      return dateStr;
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm('Are you sure you want to cancel this reservation? Free cancellation applies up to 48 hours prior to arrival.')) {
      return;
    }
    try {
      await api.post(`/bookings/${bookingId}/cancel`, { reason: 'Guest online cancellation' });
      alert('Reservation cancelled successfully.');
      loadGuestData();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel reservation');
    }
  };

  const handleHousekeepingRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!housekeepingBooking) return;
    setSubmittingHousekeeping(true);
    try {
      await api.post('/complaints', {
        booking_id: housekeepingBooking.id,
        title: `Housekeeping Request: ${housekeepingType} (Room #${housekeepingBooking.room_number})`,
        description: `Guest in Room #${housekeepingBooking.room_number} requested: ${housekeepingType}. ${housekeepingNotes ? `Notes: ${housekeepingNotes}` : ''}`,
        priority: 'medium',
      });
      alert(`Housekeeping dispatched for Room #${housekeepingBooking.room_number}! Our team will attend shortly.`);
      setHousekeepingBooking(null);
      setHousekeepingNotes('');
      loadGuestData();
    } catch (err: any) {
      alert(err.message || 'Failed to submit housekeeping request');
    } finally {
      setSubmittingHousekeeping(false);
    }
  };

  const handleLateCheckoutRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lateCheckoutBooking) return;
    setSubmittingLateCheckout(true);
    try {
      await api.post('/complaints', {
        booking_id: lateCheckoutBooking.id,
        title: `Late Checkout Request: ${requestedCheckoutTime} (Room #${lateCheckoutBooking.room_number})`,
        description: `Guest requests late departure until ${requestedCheckoutTime} for Booking ${lateCheckoutBooking.booking_reference}. Reason: ${lateCheckoutReason}`,
        priority: 'medium',
      });
      alert(`Late checkout request received for Room #${lateCheckoutBooking.room_number}. Front Desk will confirm shortly.`);
      setLateCheckoutBooking(null);
      loadGuestData();
    } catch (err: any) {
      alert(err.message || 'Failed to submit late checkout request');
    } finally {
      setSubmittingLateCheckout(false);
    }
  };

  const handleOrderService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderBooking || !selectedServiceId) return;

    setOrderingService(true);
    setOrderSuccess(null);

    try {
      const res = await api.post<{ message: string; total_added: number }>('/services/order', {
        booking_id: orderBooking.id,
        service_id: selectedServiceId,
        quantity: serviceQuantity,
        notes: serviceNotes,
      });
      setOrderSuccess(res.message);
      setServiceNotes('');
      setTimeout(() => {
        setOrderBooking(null);
        setOrderSuccess(null);
      }, 3000);
      loadGuestData();
    } catch (err: any) {
      alert(err.message || 'Failed to order service');
    } finally {
      setOrderingService(false);
    }
  };

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingComplaint(true);
    setComplaintSuccess(null);

    try {
      await api.post('/complaints', {
        title: `[${complaintCategory}] ${complaintTitle}`,
        description: complaintDesc,
        priority: complaintPriority,
      });
      setComplaintSuccess('Your request has been registered. Our hotel team is on it.');
      setComplaintTitle('');
      setComplaintDesc('');
      loadGuestData();
    } catch (err: any) {
      alert(err.message || 'Failed to submit request');
    } finally {
      setSubmittingComplaint(false);
    }
  };

  // Helper date calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const isCurrent = (b: Booking) => b.status === 'checked_in';
  const isUpcoming = (b: Booking) => b.status === 'confirmed' || (b.status === 'pending' && b.check_out_date >= todayStr);
  const isPast = (b: Booking) => b.status === 'checked_out' || b.status === 'cancelled';

  // Summary Metrics
  const totalBookingsCount = bookings.length;
  const currentStaysCount = bookings.filter(isCurrent).length;
  const upcomingCount = bookings.filter(isUpcoming).length;
  const pastCount = bookings.filter(isPast).length;

  // Filter Bookings
  const filteredBookings = bookings.filter((b) => {
    // Search match
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      b.booking_reference?.toLowerCase().includes(q) ||
      b.room_number?.toString().includes(q) ||
      b.room_type_name?.toLowerCase().includes(q);

    // Stay category filter
    let matchStay = true;
    if (stayFilter === 'current') matchStay = isCurrent(b);
    else if (stayFilter === 'upcoming') matchStay = isUpcoming(b);
    else if (stayFilter === 'past') matchStay = isPast(b);

    // Status filter
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;

    return matchSearch && matchStay && matchStatus;
  });

  const activeOrUpcomingList = filteredBookings.filter(b => isCurrent(b) || isUpcoming(b));
  const pastList = filteredBookings.filter(isPast);

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab as any)}
      navItems={[
        { id: 'bookings',   label: `My Bookings (${bookings.length})`, icon: <Calendar className="w-4 h-4" /> },
        { id: 'services',   label: 'Room Service & Dining',             icon: <Sparkles className="w-4 h-4" /> },
        { id: 'complaints', label: `Help & Requests (${complaints.length})`, icon: <MessageSquare className="w-4 h-4" /> },
      ]}
      onNavigateToWebsite={onNavigateToWebsite}
      title={`Welcome, ${user?.full_name?.split(' ')[0] || 'Guest'}`}
    >
      <div className="space-y-8">
        {/* ===================== TAB 1: RESERVATIONS ===================== */}
        {activeTab === 'bookings' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-slate-100">Guest Stays & Reservations</h2>
                <p className="text-xs text-slate-400">Manage your active suite stays, invoices, room service, and booking history</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={loadGuestData}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={onNavigateToWebsite}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Book Another Room</span>
                </button>
              </div>
            </div>

            {/* 4 Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Total Bookings</span>
                  <Calendar className="w-4 h-4 text-amber-400" />
                </div>
                <div className="font-serif text-2xl font-bold text-white">{totalBookingsCount}</div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Lifetime reservations</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Current Stays</span>
                  <Bed className="w-4 h-4 text-blue-400" />
                </div>
                <div className="font-serif text-2xl font-bold text-blue-400">{currentStaysCount}</div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Checked in now</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Upcoming</span>
                  <Clock className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="font-serif text-2xl font-bold text-emerald-400">{upcomingCount}</div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Confirmed reservations</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Past Stays</span>
                  <CheckCircle2 className="w-4 h-4 text-slate-400" />
                </div>
                <div className="font-serif text-2xl font-bold text-slate-300">{pastCount}</div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Completed visits</span>
              </div>
            </div>

            {/* Working Search & Filter Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by booking reference, room number, or room type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Stay Type Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {(['all', 'current', 'upcoming', 'past'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setStayFilter(tab)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      stayFilter === tab
                        ? 'bg-amber-500 text-slate-950 font-bold shadow'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {tab === 'all' ? 'All Stays' : tab === 'current' ? 'Current Stays' : tab === 'upcoming' ? 'Upcoming' : 'Past Stays'}
                  </button>
                ))}
              </div>

              {/* Status Select */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="checked_in">Checked In</option>
                <option value="checked_out">Checked Out</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Current & Upcoming Stays Section */}
            {(stayFilter === 'all' || stayFilter === 'current' || stayFilter === 'upcoming') && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                    <Bed className="w-5 h-5 text-amber-400" />
                    <span>Current & Upcoming Hotel Stays</span>
                  </h3>
                  <span className="text-xs text-slate-400">{activeOrUpcomingList.length} suites scheduled</span>
                </div>

                {activeOrUpcomingList.length === 0 ? (
                  <div className="p-8 bg-slate-900 rounded-2xl border border-slate-800 text-center text-slate-400">
                    <Calendar className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-60" />
                    <p className="text-sm font-semibold text-slate-200">No active or upcoming stays found matching your criteria.</p>
                    <p className="text-xs text-slate-500 mt-1">Ready to book a luxury room at HABESHA-HOTEL?</p>
                    <button
                      onClick={onNavigateToWebsite}
                      className="mt-3 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Book Your Suite
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {activeOrUpcomingList.map((b) => {
                      const balanceDue = Math.max(0, Number(b.total_amount) - Number(b.paid_amount));
                      return (
                        <div
                          key={b.id}
                          className="bg-slate-900 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all shadow-xl p-5 space-y-4 flex flex-col justify-between"
                        >
                          {/* Top: Reference & Status Badge */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-amber-400 text-sm tracking-wider">
                                {b.booking_reference}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                (Booked {formatReadableDate(b.created_at)})
                              </span>
                            </div>
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                                b.status === 'checked_in'
                                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                  : b.status === 'confirmed'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {b.status === 'checked_in' && <Bed className="w-3 h-3" />}
                              {b.status === 'confirmed' && <CheckCircle2 className="w-3 h-3" />}
                              {b.status.replace('_', ' ')}
                            </span>
                          </div>

                          {/* Room Preview */}
                          <div className="flex gap-4 items-center">
                            <img
                              src={b.room_type_image || '/images/rooms/standard-single.jpg'}
                              alt={b.room_type_name}
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = '/images/rooms/standard-single.jpg';
                              }}
                              className="w-24 h-24 object-cover rounded-xl shrink-0 border border-slate-800"
                            />
                            <div className="min-w-0 flex-1">
                              <h4 className="font-serif font-bold text-base text-white truncate">{b.room_type_name}</h4>
                              <p className="text-xs text-amber-400 font-mono mt-0.5">
                                Assigned Room: #{b.room_number || 'TBA'}
                              </p>
                              <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-2">
                                <span>{b.adults_count} Adult{b.adults_count > 1 ? 's' : ''}</span>
                                {b.children_count ? <span>• {b.children_count} Children</span> : null}
                                <span>• {b.nights_count || 1} Night{(b.nights_count || 1) > 1 ? 's' : ''}</span>
                                {b.floor_number && <span>• Floor {b.floor_number}</span>}
                              </div>
                            </div>
                          </div>

                          {/* Stay Dates & Financial Breakdown in ETB (Clean formatting, no raw ISO timestamps) */}
                          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs space-y-1.5">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Check-In:</span>
                              <span className="font-semibold text-slate-200">
                                {formatReadableDate(b.check_in_date)} (from 14:00)
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Check-Out:</span>
                              <span className="font-semibold text-slate-200">
                                {formatReadableDate(b.check_out_date)} (until 11:00)
                              </span>
                            </div>
                            <div className="border-t border-slate-800/80 pt-1.5 flex justify-between">
                              <span className="text-slate-400">Total Charges:</span>
                              <span className="font-bold text-white font-serif">{formatCurrency(b.total_amount)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Amount Paid:</span>
                              <span className="font-semibold text-emerald-400 font-serif">{formatCurrency(b.paid_amount)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-semibold">Remaining Balance:</span>
                              <span className={`font-serif font-bold ${balanceDue > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                {formatCurrency(balanceDue)}
                              </span>
                            </div>
                          </div>

                          {/* Functional Booking Actions */}
                          <div className="pt-2 border-t border-slate-800/60 flex flex-wrap gap-2 items-center">
                            {/* View Details */}
                            <button
                              onClick={() => {
                                setSelectedBooking(b);
                                setShowBookingDetailsModal(true);
                              }}
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5 text-amber-400" />
                              <span>View Details</span>
                            </button>

                            {/* View Official Invoice */}
                            <button
                              onClick={() => {
                                setSelectedInvoiceId(b.id);
                                setShowInvoiceModal(true);
                              }}
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5 text-amber-400" />
                              <span>Invoice & Receipt</span>
                            </button>

                            {/* Order Room Service */}
                            <button
                              onClick={() => setOrderBooking(b)}
                              className="px-2.5 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                              <span>Room Service</span>
                            </button>

                            {/* Request Housekeeping */}
                            <button
                              onClick={() => setHousekeepingBooking(b)}
                              className="px-2.5 py-1.5 bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                              <span>Housekeeping</span>
                            </button>

                            {/* Request Late Checkout */}
                            <button
                              onClick={() => setLateCheckoutBooking(b)}
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <Clock className="w-3.5 h-3.5 text-teal-400" />
                              <span>Late Checkout</span>
                            </button>

                            {/* Cancel Booking (only allowed when confirmed) */}
                            {b.status === 'confirmed' && (
                              <button
                                onClick={() => handleCancelBooking(b.id)}
                                className="px-2.5 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 rounded-lg text-xs font-semibold ml-auto cursor-pointer transition-colors"
                              >
                                Cancel Booking
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Past Hotel Stays Section */}
            {(stayFilter === 'all' || stayFilter === 'past') && (
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg font-bold text-slate-300 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Past Hotel Stays</span>
                  </h3>
                  <span className="text-xs text-slate-500">{pastList.length} past stays</span>
                </div>

                {pastList.length === 0 ? (
                  <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800/80 text-center text-slate-500 text-xs">
                    No past hotel stays found.
                  </div>
                ) : (
                  <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-semibold">
                          <tr>
                            <th className="p-3.5">Reference</th>
                            <th className="p-3.5">Suite Reserved</th>
                            <th className="p-3.5">Stay Dates</th>
                            <th className="p-3.5">Total Amount</th>
                            <th className="p-3.5">Status</th>
                            <th className="p-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {pastList.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                              <td className="p-3.5 font-mono font-bold text-amber-400">{p.booking_reference}</td>
                              <td className="p-3.5">
                                <span className="font-semibold text-slate-200 block">
                                  {p.room_type_name}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  Room #{p.room_number || 'N/A'}
                                </span>
                              </td>
                              <td className="p-3.5 text-slate-400 whitespace-nowrap">
                                {formatReadableDate(p.check_in_date)} — {formatReadableDate(p.check_out_date)}
                              </td>
                              <td className="p-3.5 font-serif font-bold text-white">
                                {formatCurrency(p.total_amount)}
                              </td>
                              <td className="p-3.5">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    p.status === 'checked_out'
                                      ? 'bg-slate-800 text-slate-300'
                                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  }`}
                                >
                                  {p.status.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="p-3.5 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => {
                                      setSelectedBooking(p);
                                      setShowBookingDetailsModal(true);
                                    }}
                                    className="text-slate-300 hover:text-white text-xs font-semibold cursor-pointer underline"
                                  >
                                    View Details
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedInvoiceId(p.id);
                                      setShowInvoiceModal(true);
                                    }}
                                    className="text-amber-400 hover:underline font-semibold cursor-pointer"
                                  >
                                    Print Receipt
                                  </button>
                                  <button
                                    onClick={onNavigateToWebsite}
                                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-[11px] cursor-pointer transition-colors shadow"
                                  >
                                    Book Again
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB 2: IN-ROOM SERVICES CATALOG ===================== */}
        {activeTab === 'services' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="font-serif text-xl font-bold text-slate-100">Delicious Food, Drinks & Hotel Services</h2>
              <p className="text-xs text-slate-400">Order authentic Ethiopian meals, Buna coffee ceremonies, fresh juices, and amenities directly to your suite</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map(svc => (
                <div key={svc.id} className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-3 shadow-lg flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider bg-amber-500/10 px-2 py-0.5 rounded">
                        {svc.category}
                      </span>
                      <span className="font-serif text-lg font-bold text-amber-400">{formatCurrency(svc.price)}</span>
                    </div>

                    <h3 className="font-bold text-base text-white">{svc.name}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1">{svc.description}</p>
                  </div>

                  {activeOrUpcomingList.length > 0 ? (
                    <button
                      onClick={() => {
                        setOrderBooking(activeOrUpcomingList[0]);
                        setSelectedServiceId(svc.id);
                      }}
                      className="w-full py-2 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-300 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Order to Room #{activeOrUpcomingList[0].room_number || 'Suite'}</span>
                    </button>
                  ) : (
                    <div className="text-[11px] text-slate-500 italic text-center py-1">
                      Available during active in-house stay
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== TAB 3: HELP & REQUESTS ===================== */}
        {activeTab === 'complaints' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div>
              <h2 className="font-serif text-2xl font-bold text-slate-100">Concierge Help, Assistance & Requests</h2>
              <p className="text-xs text-slate-400">Submit requests, complaints, or hotel assistance and track live status with hotel staff</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Submit New Request */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="font-serif font-bold text-base text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-amber-400" />
                  <span>Submit New Guest Request</span>
                </h3>

                {complaintSuccess && (
                  <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{complaintSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitComplaint} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Assistance Category *</label>
                    <select
                      value={complaintCategory}
                      onChange={(e) => setComplaintCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-amber-500"
                    >
                      <option value="Front Desk & Concierge">Front Desk & Concierge</option>
                      <option value="Housekeeping & Linens">Housekeeping & Linens</option>
                      <option value="Room Repairs & Maintenance">Room Repairs & Maintenance</option>
                      <option value="Dining & Room Service">Dining & Room Service</option>
                      <option value="Airport Shuttle & Transport">Airport Shuttle & Transport</option>
                      <option value="Billing & Accounting">Billing & Accounting</option>
                      <option value="Other Assistance">Other Assistance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Subject / Summary *</label>
                    <input
                      type="text"
                      required
                      value={complaintTitle}
                      onChange={e => setComplaintTitle(e.target.value)}
                      placeholder="e.g. Extra pillows, AC thermostat check, wake-up call"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Details & Special Instructions *</label>
                    <textarea
                      required
                      rows={4}
                      value={complaintDesc}
                      onChange={e => setComplaintDesc(e.target.value)}
                      placeholder="Describe what you need so our team can help promptly..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-amber-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Priority Level</label>
                    <select
                      value={complaintPriority}
                      onChange={e => setComplaintPriority(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-amber-500"
                    >
                      <option value="low">Standard (Can be handled during regular turnover)</option>
                      <option value="medium">Medium (Please assist today)</option>
                      <option value="high">Urgent (Immediate attention required)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingComplaint}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submittingComplaint ? 'Submitting...' : 'Submit Request'}</span>
                  </button>
                </form>
              </div>

              {/* Right Column: Track Request Status */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-base text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Track Request Status ({complaints.length})</span>
                  </h3>
                  <button
                    onClick={loadGuestData}
                    className="text-xs text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Refresh
                  </button>
                </div>

                {complaints.length === 0 ? (
                  <div className="p-8 bg-slate-900 rounded-2xl border border-slate-800 text-center text-slate-400">
                    <MessageSquare className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-semibold text-slate-200">No requests or complaints registered yet.</p>
                    <p className="text-xs text-slate-500 mt-1">Whenever you need assistance, submit the form on the left.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {complaints.map((c) => (
                      <div
                        key={c.id}
                        className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2.5 shadow-lg"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-amber-400">#REQ-{c.id}</span>
                              <span className="text-[10px] text-slate-500">{formatReadableDate(c.created_at, true)}</span>
                              {c.booking_reference && (
                                <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono">
                                  {c.booking_reference}
                                </span>
                              )}
                            </div>
                            <h4 className="font-semibold text-white text-sm mt-0.5">{c.title}</h4>
                          </div>

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                              c.status === 'resolved' || c.status === 'closed'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : c.status === 'under_investigation'
                                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {c.status.replace('_', ' ')}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                          {c.description}
                        </p>

                        {c.resolution_notes && (
                          <div className="p-2.5 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-xs space-y-1">
                            <span className="font-bold text-emerald-400 text-[11px] block flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Hotel Response / Resolution:
                            </span>
                            <p className="text-emerald-200/90">{c.resolution_notes}</p>
                            {c.resolved_at && (
                              <span className="text-[10px] text-emerald-400/60 block">
                                Resolved on {formatReadableDate(c.resolved_at, true)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===================== MODALS ===================== */}

      {/* 1. Booking Details Modal */}
      {showBookingDetailsModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-serif font-bold text-lg text-white">Booking Details</h3>
                  <p className="text-xs text-amber-400 font-mono">{selectedBooking.booking_reference}</p>
                </div>
              </div>
              <button
                onClick={() => setShowBookingDetailsModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Room Banner */}
            <div className="flex gap-4 items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
              <img
                src={selectedBooking.room_type_image || '/images/rooms/standard-single.jpg'}
                alt={selectedBooking.room_type_name}
                className="w-20 h-20 object-cover rounded-lg border border-slate-800 shrink-0"
              />
              <div>
                <h4 className="font-serif font-bold text-base text-white">{selectedBooking.room_type_name}</h4>
                <p className="text-xs text-amber-400 font-mono">Assigned Room: #{selectedBooking.room_number || 'TBA'}</p>
                <p className="text-xs text-slate-400 mt-0.5">Floor: {selectedBooking.floor_number || 1} • {selectedBooking.nights_count || 1} Nights</p>
              </div>
            </div>

            {/* Stay Period */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Check-In</span>
                <span className="font-bold text-white mt-1 block">{formatReadableDate(selectedBooking.check_in_date)}</span>
                <span className="text-[10px] text-slate-500">From 14:00 (2:00 PM)</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Check-Out</span>
                <span className="font-bold text-white mt-1 block">{formatReadableDate(selectedBooking.check_out_date)}</span>
                <span className="text-[10px] text-slate-500">Until 11:00 (11:00 AM)</span>
              </div>
            </div>

            {/* Guest Details */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5">
              <span className="font-semibold text-slate-300 block mb-1">Reservation Information:</span>
              <div className="flex justify-between"><span className="text-slate-400">Lead Guest:</span><span className="font-semibold text-white">{selectedBooking.customer_name}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Email:</span><span className="text-slate-300">{selectedBooking.customer_email}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Occupancy:</span><span className="text-slate-300">{selectedBooking.adults_count} Adults{selectedBooking.children_count ? `, ${selectedBooking.children_count} Children` : ''}</span></div>
              {selectedBooking.special_requests && (
                <div className="pt-1.5 border-t border-slate-800">
                  <span className="text-slate-400 block">Special Requests:</span>
                  <p className="text-slate-300 italic mt-0.5">{selectedBooking.special_requests}</p>
                </div>
              )}
            </div>

            {/* Financial Charges in ETB */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5">
              <span className="font-semibold text-slate-300 block mb-1">Folio & Accounting (ETB):</span>
              <div className="flex justify-between"><span className="text-slate-400">Nightly Rate:</span><span className="text-slate-200 font-serif">{formatCurrency(selectedBooking.room_rate)}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Services & Add-ons:</span><span className="text-slate-200 font-serif">{formatCurrency(selectedBooking.services_total || 0)}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Occupancy Tax:</span><span className="text-slate-200 font-serif">{formatCurrency(selectedBooking.tax_amount || 0)}</span></div>
              <div className="flex justify-between border-t border-slate-800 pt-1 font-bold"><span className="text-white">Total Amount:</span><span className="text-amber-400 font-serif">{formatCurrency(selectedBooking.total_amount)}</span></div>
              <div className="flex justify-between"><span className="text-emerald-400">Amount Settled:</span><span className="text-emerald-400 font-serif">{formatCurrency(selectedBooking.paid_amount)}</span></div>
              <div className="flex justify-between border-t border-slate-800 pt-1 font-bold"><span className="text-rose-400">Remaining Balance:</span><span className="text-rose-400 font-serif">{formatCurrency(Math.max(0, Number(selectedBooking.total_amount) - Number(selectedBooking.paid_amount)))}</span></div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowBookingDetailsModal(false);
                  setSelectedInvoiceId(selectedBooking.id);
                  setShowInvoiceModal(true);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Official Invoice</span>
              </button>
              <button
                onClick={() => setShowBookingDetailsModal(false)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Housekeeping Request Modal */}
      {housekeepingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sky-400" />
                <div>
                  <h3 className="font-serif font-bold text-base text-white">Request Housekeeping</h3>
                  <p className="text-xs text-slate-400">Room #{housekeepingBooking.room_number} ({housekeepingBooking.room_type_name})</p>
                </div>
              </div>
              <button onClick={() => setHousekeepingBooking(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleHousekeepingRequest} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Service Needed *</label>
                <select
                  value={housekeepingType}
                  onChange={(e) => setHousekeepingType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-amber-500"
                >
                  <option value="Extra Towels & Luxury Toiletries">Extra Bath Towels & Toiletries</option>
                  <option value="Daily Suite Cleaning & Turnover">Daily Suite Cleaning & Turnover</option>
                  <option value="Fresh Bedding & Linen Replacement">Fresh Bedding & Linen Replacement</option>
                  <option value="Evening Turndown & Aromatherapy">Evening Turndown & Aromatherapy</option>
                  <option value="Waste Bin Removal & Restock">Waste Bin Removal & Restock</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Special Notes / Preferred Time</label>
                <textarea
                  rows={3}
                  value={housekeepingNotes}
                  onChange={(e) => setHousekeepingNotes(e.target.value)}
                  placeholder="e.g. Please service between 10:00 AM and 11:30 AM while we are at breakfast..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setHousekeepingBooking(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingHousekeeping}
                  className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl cursor-pointer shadow"
                >
                  {submittingHousekeeping ? 'Dispatching...' : 'Dispatch Housekeeping'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Late Checkout Request Modal */}
      {lateCheckoutBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-400" />
                <div>
                  <h3 className="font-serif font-bold text-base text-white">Request Late Checkout</h3>
                  <p className="text-xs text-slate-400">Standard checkout is at 11:00 AM</p>
                </div>
              </div>
              <button onClick={() => setLateCheckoutBooking(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLateCheckoutRequest} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Requested Departure Time *</label>
                <select
                  value={requestedCheckoutTime}
                  onChange={(e) => setRequestedCheckoutTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-amber-500"
                >
                  <option value="13:00">1:00 PM (13:00) — Complimentary upon availability</option>
                  <option value="14:00">2:00 PM (14:00) — Subject to front desk approval</option>
                  <option value="16:00">4:00 PM (16:00) — Extended Day Stay</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reason for Request</label>
                <textarea
                  rows={3}
                  value={lateCheckoutReason}
                  onChange={(e) => setLateCheckoutReason(e.target.value)}
                  placeholder="e.g. Ethiopian Airlines evening flight from Bole..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setLateCheckoutBooking(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingLateCheckout}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl cursor-pointer shadow"
                >
                  {submittingLateCheckout ? 'Sending...' : 'Request Late Checkout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Order Service Modal */}
      {orderBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-serif font-bold text-lg text-slate-100">Order to Room #{orderBooking.room_number || 'Suite'}</h3>
              <button onClick={() => setOrderBooking(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {orderSuccess ? (
              <div className="py-6 text-center text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2" />
                {orderSuccess}
              </div>
            ) : (
              <form onSubmit={handleOrderService} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Choose Food, Drink or Service *</label>
                  <select
                    value={selectedServiceId}
                    onChange={e => setSelectedServiceId(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-amber-500"
                  >
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({formatCurrency(s.price)})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={serviceQuantity}
                    onChange={e => setServiceQuantity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Delivery Time / Special Requests</label>
                  <textarea
                    rows={2}
                    value={serviceNotes}
                    onChange={e => setServiceNotes(e.target.value)}
                    placeholder="e.g. Please deliver at 08:30 AM with awaze and fresh injera..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-amber-500 resize-none"
                  />
                </div>

                <div className="p-3 bg-slate-950 rounded-xl text-slate-400 text-[11px]">
                  Charges in ETB will be charged to your hotel room bill and settled at check-out.
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setOrderBooking(null)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={orderingService}
                    className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold rounded-xl cursor-pointer shadow"
                  >
                    {orderingService ? 'Ordering...' : 'Confirm Order'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 5. Official Invoice Modal */}
      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        invoiceIdOrBookingId={selectedInvoiceId}
      />
    </DashboardLayout>
  );
};
