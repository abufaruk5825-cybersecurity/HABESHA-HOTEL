import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Room, Booking, Payment, Invoice, Customer, NotificationItem } from '../../types';
import { InvoiceModal } from '../../components/common/InvoiceModal';
import { DashboardLayout, NAV_ITEMS } from '../../components/dashboard/DashboardLayout';
import {
  StatCard,
  PageHeader,
  SectionCard,
  StatusBadge,
  Btn,
  Modal,
  Field,
  Input,
  Textarea,
  Select,
  RefreshBtn
} from '../../components/dashboard/DashboardUI';
import {
  LayoutDashboard,
  CalendarCheck,
  Building,
  CheckCircle2,
  LogOut,
  LogIn,
  Search,
  UserPlus,
  CreditCard,
  Printer,
  Clock,
  Sparkles,
  RefreshCw,
  X,
  DollarSign,
  Users,
  Bell,
  User,
  BedDouble,
  ShieldCheck,
  Filter,
  Check,
  AlertTriangle,
  Receipt
} from 'lucide-react';

interface ReceptionDashboardProps {
  onNavigateToWebsite: () => void;
}

export const ReceptionDashboard: React.FC<ReceptionDashboardProps> = ({ onNavigateToWebsite }) => {
  const { user, currency, taxRate } = useAuth();

  // Active navigation tab (Default: dashboard)
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Core Data States
  const [arrivals, setArrivals] = useState<Booking[]>([]);
  const [departures, setDepartures] = useState<Booking[]>([]);
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [reservationSearch, setReservationSearch] = useState('');
  const [reservationStatusFilter, setReservationStatusFilter] = useState('all');
  const [gridFloorFilter, setGridFloorFilter] = useState('all');
  const [guestSearch, setGuestSearch] = useState('');

  // Walk-in form state
  const [walkinName, setWalkinName] = useState('');
  const [walkinEmail, setWalkinEmail] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinRoomId, setWalkinRoomId] = useState<number>(0);
  const [walkinNights, setWalkinNights] = useState<number>(1);
  const [walkinMethod, setWalkinMethod] = useState<'cash' | 'card' | 'bank_transfer'>('card');
  const [walkinSubmitting, setWalkinSubmitting] = useState(false);
  const [walkinSuccess, setWalkinSuccess] = useState<string | null>(null);

  // Payment Recording Modal
  const [paymentBooking, setPaymentBooking] = useState<Booking | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(100);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'bank_transfer'>('card');
  const [recordingPayment, setRecordingPayment] = useState(false);

  // Booking Details Modal
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);

  // Invoice modal
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | string | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const loadFrontDeskData = async () => {
    setLoading(true);
    try {
      const [arrDep, rooms, books, custs, pays, invs, notifs] = await Promise.all([
        api.get<{ arrivals: Booking[]; departures: Booking[] }>('/bookings/arrivals-departures').catch(() => ({ arrivals: [], departures: [] })),
        api.get<Room[]>('/rooms').catch(() => []),
        api.get<Booking[]>('/bookings').catch(() => []),
        api.get<Customer[]>('/customers').catch(() => []),
        api.get<Payment[]>('/payments').catch(() => []),
        api.get<Invoice[]>('/invoices').catch(() => []),
        api.get<NotificationItem[]>('/notifications').catch(() => []),
      ]);

      setArrivals(arrDep?.arrivals || []);
      setDepartures(arrDep?.departures || []);
      setAllRooms(rooms || []);
      setAllBookings(books || []);
      setCustomers(custs || []);
      setPayments(pays || []);
      setInvoices(invs || []);
      setNotifications(notifs || []);

      const readyAvailable = (rooms || []).filter(r => r.status === 'available' && r.operational_status === 'ready');
      if (readyAvailable.length > 0 && !walkinRoomId) {
        setWalkinRoomId(readyAvailable[0].id);
      }
    } catch (e) {
      console.error('Failed to load front desk data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFrontDeskData();
  }, []);

  // 8 Summary Metrics for Receptionist
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysArrivalsCount = arrivals.length;
  const todaysDeparturesCount = departures.length;
  const currentInHouseGuests = allBookings.filter(b => b.status === 'checked_in').length;
  const availableRoomsCount = allRooms.filter(r => r.status === 'available').length;
  const occupiedRoomsCount = allRooms.filter(r => r.status === 'occupied').length;
  const pendingCheckinsCount = arrivals.filter(b => b.status === 'confirmed').length;
  const pendingCheckoutsCount = departures.filter(b => b.status === 'checked_in').length;
  const todaysReservationsCount = allBookings.filter(b => b.created_at?.startsWith(todayStr)).length || allBookings.length;

  const handleCheckIn = async (bookingId: number) => {
    try {
      await api.post(`/bookings/${bookingId}/check-in`);
      await loadFrontDeskData();
      alert('Guest checked in successfully! Keycards issued & room marked occupied.');
    } catch (err: any) {
      alert(err.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async (bookingId: number) => {
    try {
      await api.post(`/bookings/${bookingId}/check-out`);
      await loadFrontDeskData();
      alert('Guest checked out successfully! Room dispatched to Housekeeping.');
    } catch (err: any) {
      alert(err.message || 'Check-out failed');
    }
  };

  const handleWalkInBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkinRoomId) {
      alert('Please select an available room');
      return;
    }

    setWalkinSubmitting(true);
    setWalkinSuccess(null);

    const today = new Date();
    const todayFormatted = today.toISOString().split('T')[0];
    const outDate = new Date();
    outDate.setDate(outDate.getDate() + walkinNights);
    const outFormatted = outDate.toISOString().split('T')[0];

    try {
      const selectedRoom = allRooms.find(r => r.id === walkinRoomId);
      const roomTotal = selectedRoom ? selectedRoom.price_per_night * walkinNights : 0;
      const taxAmount = (roomTotal * (taxRate || 12)) / 100;
      const grandTotal = roomTotal + taxAmount;

      const res = await api.post<any>('/bookings', {
        room_id: walkinRoomId,
        check_in_date: todayFormatted,
        check_out_date: outFormatted,
        adults_count: 1,
        children_count: 0,
        primary_guest_name: walkinName,
        primary_guest_email: walkinEmail || `walkin.${Date.now()}@habeshahotel.com`,
        primary_guest_phone: walkinPhone,
        initial_payment_amount: grandTotal,
        payment_method: walkinMethod,
        special_requests: 'Front Desk Walk-in Guest Registration',
      });

      // Automatically check in the walk-in guest
      await api.post(`/bookings/${res.booking_id}/check-in`);

      setWalkinSuccess(`Walk-in registered & checked in! Booking #${res.booking_reference}`);
      setWalkinName('');
      setWalkinEmail('');
      setWalkinPhone('');
      await loadFrontDeskData();
    } catch (err: any) {
      alert(err.message || 'Failed to process walk-in');
    } finally {
      setWalkinSubmitting(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentBooking) return;

    setRecordingPayment(true);
    try {
      await api.post('/payments', {
        booking_id: paymentBooking.id,
        amount: paymentAmount,
        payment_method: paymentMethod,
        notes: `Front Desk payment recorded by ${user?.full_name || 'Receptionist'}`,
      });
      alert('Payment recorded successfully! Invoice updated.');
      setPaymentBooking(null);
      await loadFrontDeskData();
    } catch (err: any) {
      alert(err.message || 'Failed to record payment');
    } finally {
      setRecordingPayment(false);
    }
  };

  const handleMarkNotificationRead = async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered reservations
  const filteredBookings = useMemo(() => {
    return allBookings.filter(b => {
      const matchSearch = !reservationSearch ||
        b.booking_reference.toLowerCase().includes(reservationSearch.toLowerCase()) ||
        b.customer_name.toLowerCase().includes(reservationSearch.toLowerCase()) ||
        b.room_number.toLowerCase().includes(reservationSearch.toLowerCase());
      const matchStatus = reservationStatusFilter === 'all' || b.status === reservationStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [allBookings, reservationSearch, reservationStatusFilter]);

  // Unified Search
  const unifiedSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return allBookings.filter(b =>
      b.booking_reference.toLowerCase().includes(q) ||
      b.customer_name.toLowerCase().includes(q) ||
      b.customer_email?.toLowerCase().includes(q) ||
      b.customer_phone?.toLowerCase().includes(q) ||
      b.room_number.toLowerCase().includes(q)
    );
  }, [allBookings, searchQuery]);

  // Filtered Grid Rooms
  const filteredGridRooms = useMemo(() => {
    return allRooms.filter(r => {
      if (gridFloorFilter === 'all') return true;
      return String(r.floor_number) === gridFloorFilter;
    });
  }, [allRooms, gridFloorFilter]);

  // Filtered Guests
  const filteredGuests = useMemo(() => {
    if (!guestSearch) return customers;
    const q = guestSearch.toLowerCase();
    return customers.filter(c =>
      c.full_name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q)
    );
  }, [customers, guestSearch]);

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      navItems={NAV_ITEMS.receptionist}
      onNavigateToWebsite={onNavigateToWebsite}
      title="Front Desk & Reception Portal"
    >
      {/* ────────────────── TAB: DASHBOARD (LANDING PAGE) ────────────────── */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <PageHeader
            title="Front Desk Dashboard"
            subtitle="Today's guest arrivals, departures, room keys, and front desk operations"
            actions={
              <div className="flex items-center gap-2">
                <Btn
                  variant="primary"
                  size="sm"
                  onClick={() => setActiveTab('walkin')}
                >
                  <UserPlus className="w-4 h-4 mr-1" /> New Walk-In Guest
                </Btn>
                <RefreshBtn onClick={loadFrontDeskData} loading={loading} />
              </div>
            }
          />

          {/* 8 Summary Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <StatCard
              label="Today's Arrivals"
              value={todaysArrivalsCount}
              sub={`${pendingCheckinsCount} awaiting check-in`}
              icon={<LogIn className="w-4 h-4" />}
              color="emerald"
            />
            <StatCard
              label="Today's Departures"
              value={todaysDeparturesCount}
              sub={`${pendingCheckoutsCount} awaiting checkout`}
              icon={<LogOut className="w-4 h-4" />}
              color="purple"
            />
            <StatCard
              label="Current In-House"
              value={currentInHouseGuests}
              sub="Guests currently registered"
              icon={<Users className="w-4 h-4" />}
              color="blue"
            />
            <StatCard
              label="Available Rooms"
              value={availableRoomsCount}
              sub="Ready for sale"
              icon={<BedDouble className="w-4 h-4" />}
              color="emerald"
            />
            <StatCard
              label="Occupied Rooms"
              value={occupiedRoomsCount}
              sub="Occupied by guests"
              icon={<Building className="w-4 h-4" />}
              color="amber"
            />
            <StatCard
              label="Pending Check-Ins"
              value={pendingCheckinsCount}
              sub="Expected today"
              icon={<Clock className="w-4 h-4" />}
              color="sky"
            />
            <StatCard
              label="Pending Check-Outs"
              value={pendingCheckoutsCount}
              sub="Due for turnover"
              icon={<Sparkles className="w-4 h-4" />}
              color="rose"
            />
            <StatCard
              label="Today's Bookings"
              value={todaysReservationsCount}
              sub="Total reservations logged"
              icon={<CalendarCheck className="w-4 h-4" />}
              color="default"
            />
          </div>

          {/* Quick Action Split Tables: Arrivals & Departures */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Arrivals */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="font-serif font-bold text-white text-sm flex items-center gap-2">
                  <LogIn className="w-4 h-4 text-emerald-400" /> Today's Expected Arrivals ({arrivals.length})
                </h3>
                <button onClick={() => setActiveTab('arrivals')} className="text-xs text-amber-400 hover:underline">
                  Full Queue &rarr;
                </button>
              </div>

              {arrivals.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center italic">No arrivals scheduled for today.</p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {arrivals.map(b => (
                    <div key={b.id} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-white block">{b.customer_name}</span>
                        <span className="text-[11px] text-slate-400">Ref: <strong className="text-amber-400">{b.booking_reference}</strong> • Room #{b.room_number}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {b.status === 'confirmed' ? (
                          <button
                            onClick={() => handleCheckIn(b.id)}
                            className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-colors"
                          >
                            Check In
                          </button>
                        ) : (
                          <StatusBadge status={b.status} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Departures */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="font-serif font-bold text-white text-sm flex items-center gap-2">
                  <LogOut className="w-4 h-4 text-purple-400" /> Today's Expected Departures ({departures.length})
                </h3>
                <button onClick={() => setActiveTab('departures')} className="text-xs text-amber-400 hover:underline">
                  Full Queue &rarr;
                </button>
              </div>

              {departures.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center italic">No departures scheduled for today.</p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {departures.map(b => (
                    <div key={b.id} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-white block">{b.customer_name}</span>
                        <span className="text-[11px] text-slate-400">Ref: <strong className="text-amber-400">{b.booking_reference}</strong> • Room #{b.room_number}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {b.status === 'checked_in' ? (
                          <button
                            onClick={() => handleCheckOut(b.id)}
                            className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs transition-colors"
                          >
                            Check Out
                          </button>
                        ) : (
                          <StatusBadge status={b.status} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── TAB: RESERVATIONS ────────────────── */}
      {activeTab === 'reservations' && (
        <div className="space-y-6">
          <PageHeader
            title="Reservations Management"
            subtitle="View, search, and verify all guest bookings with rate details and invoices"
            actions={<RefreshBtn onClick={loadFrontDeskData} loading={loading} />}
          />

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by reference, guest name, or room number..."
                value={reservationSearch}
                onChange={e => setReservationSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <select
              value={reservationStatusFilter}
              onChange={e => setReservationStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked_in">Checked In</option>
              <option value="checked_out">Checked Out</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Ref</th>
                  <th className="py-3 px-4">Guest</th>
                  <th className="py-3 px-4">Room</th>
                  <th className="py-3 px-4">Check-In</th>
                  <th className="py-3 px-4">Check-Out</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      No bookings matching search filter.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map(b => (
                    <tr key={b.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">{b.booking_reference}</td>
                      <td className="py-3 px-4 font-semibold text-white">{b.customer_name}</td>
                      <td className="py-3 px-4 font-bold text-slate-200">#{b.room_number}</td>
                      <td className="py-3 px-4 font-mono text-slate-300">{b.check_in_date?.split('T')[0]}</td>
                      <td className="py-3 px-4 font-mono text-slate-300">{b.check_out_date?.split('T')[0]}</td>
                      <td className="py-3 px-4 font-mono font-bold text-amber-300">ETB {Number(b.total_amount).toLocaleString()}</td>
                      <td className="py-3 px-4"><StatusBadge status={b.status} /></td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        <button
                          onClick={() => setViewingBooking(b)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-semibold"
                        >
                          View
                        </button>
                        {b.invoice_number && (
                          <button
                            onClick={() => {
                              setSelectedInvoiceId(b.invoice_number!);
                              setShowInvoiceModal(true);
                            }}
                            className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded text-[11px] font-semibold"
                          >
                            Invoice
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ────────────────── TAB: ARRIVALS / CHECK-IN ────────────────── */}
      {activeTab === 'arrivals' && (
        <div className="space-y-6">
          <PageHeader
            title="Guest Arrivals & Check-In Queue"
            subtitle="Verify guest identification, check room readiness, issue room keys, and complete check-in"
            actions={<RefreshBtn onClick={loadFrontDeskData} loading={loading} />}
          />

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Ref</th>
                  <th className="py-3 px-4">Guest</th>
                  <th className="py-3 px-4">Room & Type</th>
                  <th className="py-3 px-4">Nights</th>
                  <th className="py-3 px-4">Room Readiness</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {arrivals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No pending arrivals in queue.
                    </td>
                  </tr>
                ) : (
                  arrivals.map(b => {
                    const assignedRoom = allRooms.find(r => r.id === b.room_id || r.room_number === b.room_number);
                    const isReady = assignedRoom ? assignedRoom.operational_status === 'ready' : true;
                    return (
                      <tr key={b.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono font-bold text-amber-400">{b.booking_reference}</td>
                        <td className="py-3 px-4 font-semibold text-white">
                          {b.customer_name}
                          <span className="block text-[10px] text-slate-400">{b.customer_phone || b.customer_email}</span>
                        </td>
                        <td className="py-3 px-4">
                          <strong className="text-white">Room #{b.room_number}</strong>
                          <span className="block text-[10px] text-slate-400">{b.room_type_name}</span>
                        </td>
                        <td className="py-3 px-4 font-mono">{b.nights_count}N</td>
                        <td className="py-3 px-4">
                          {isReady ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                              Ready for Guest
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                              Housekeeping Turnover
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4"><StatusBadge status={b.status} /></td>
                        <td className="py-3 px-4 text-right">
                          {b.status === 'confirmed' ? (
                            <button
                              onClick={() => handleCheckIn(b.id)}
                              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-colors"
                            >
                              Confirm Check-In
                            </button>
                          ) : (
                            <span className="text-slate-500 text-xs font-semibold">Checked In</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ────────────────── TAB: DEPARTURES / CHECK-OUT ────────────────── */}
      {activeTab === 'departures' && (
        <div className="space-y-6">
          <PageHeader
            title="Guest Departures & Check-Out"
            subtitle="Settle outstanding charges, release keycards, print final receipt, and dispatch room to Housekeeping"
            actions={<RefreshBtn onClick={loadFrontDeskData} loading={loading} />}
          />

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Ref</th>
                  <th className="py-3 px-4">Guest</th>
                  <th className="py-3 px-4">Room</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Balance Due</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {departures.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No departures scheduled in queue.
                    </td>
                  </tr>
                ) : (
                  departures.map(b => {
                    const balance = (Number(b.total_amount) || 0) - (Number(b.paid_amount) || 0);
                    return (
                      <tr key={b.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono font-bold text-amber-400">{b.booking_reference}</td>
                        <td className="py-3 px-4 font-semibold text-white">{b.customer_name}</td>
                        <td className="py-3 px-4 font-bold text-slate-200">Room #{b.room_number}</td>
                        <td className="py-3 px-4 font-mono">ETB {Number(b.total_amount).toLocaleString()}</td>
                        <td className="py-3 px-4 font-mono font-bold">
                          {balance > 0 ? (
                            <span className="text-rose-400">ETB {balance.toLocaleString()} Due</span>
                          ) : (
                            <span className="text-emerald-400">Settled (ETB 0)</span>
                          )}
                        </td>
                        <td className="py-3 px-4"><StatusBadge status={b.status} /></td>
                        <td className="py-3 px-4 text-right space-x-1.5">
                          {balance > 0 && (
                            <button
                              onClick={() => {
                                setPaymentBooking(b);
                                setPaymentAmount(balance);
                              }}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-xs transition-colors"
                            >
                              Record Payment
                            </button>
                          )}
                          {b.status === 'checked_in' && (
                            <button
                              onClick={() => handleCheckOut(b.id)}
                              className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded text-xs transition-colors"
                            >
                              Check Out
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ────────────────── TAB: ROOM BOARD (GRID) ────────────────── */}
      {activeTab === 'grid' && (
        <div className="space-y-6">
          <PageHeader
            title="Live Room Board Matrix"
            subtitle="Visual rack of all hotel rooms across floors with real-time occupancy and readiness"
            actions={<RefreshBtn onClick={loadFrontDeskData} loading={loading} />}
          />

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Floor Level:</span>
            {['all', '1', '2', '3', '4'].map(f => (
              <button
                key={f}
                onClick={() => setGridFloorFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  gridFloorFilter === f ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 border border-slate-800 text-slate-300'
                }`}
              >
                {f === 'all' ? 'All Floors' : `Floor ${f}`}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
            {filteredGridRooms.map(r => (
              <div
                key={r.id}
                className={`p-3.5 rounded-2xl border transition-all shadow-md space-y-2 ${
                  r.status === 'occupied' ? 'bg-blue-950/40 border-blue-800/80 text-blue-200' :
                  r.status === 'available' ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-200' :
                  r.status === 'dirty' ? 'bg-rose-950/40 border-rose-800/80 text-rose-200' :
                  'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-base text-white">#{r.room_number}</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-black/40 border border-white/10">
                    {r.status}
                  </span>
                </div>
                <div className="text-[11px] opacity-80 leading-tight">
                  <p className="font-semibold truncate">{r.room_type_name}</p>
                  <p className="text-[10px] mt-0.5">Floor {r.floor_number} • {r.operational_status}</p>
                </div>
                <div className="pt-1.5 border-t border-white/10 flex justify-between items-center text-[11px] font-mono font-bold">
                  <span>ETB {Number(r.price_per_night).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ────────────────── TAB: WALK-IN GUEST ────────────────── */}
      {activeTab === 'walkin' && (
        <div className="space-y-6 max-w-2xl">
          <PageHeader
            title="Instant Walk-In Guest Registration"
            subtitle="Register an arriving guest on the spot, assign an available room, and immediately issue keycards"
          />

          {walkinSuccess && (
            <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center justify-between">
              <span>{walkinSuccess}</span>
              <button onClick={() => setWalkinSuccess(null)} className="text-emerald-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <form onSubmit={handleWalkInBooking} className="space-y-4 text-xs">
              <Field label="Guest Full Name">
                <Input
                  placeholder="e.g. Dawit Haile"
                  value={walkinName}
                  onChange={e => setWalkinName(e.target.value)}
                  required
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Phone Number">
                  <Input
                    placeholder="+251 9..."
                    value={walkinPhone}
                    onChange={e => setWalkinPhone(e.target.value)}
                    required
                  />
                </Field>
                <Field label="Email Address (Optional)">
                  <Input
                    type="email"
                    placeholder="guest@example.com"
                    value={walkinEmail}
                    onChange={e => setWalkinEmail(e.target.value)}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Assign Clean & Ready Room">
                  <Select value={walkinRoomId} onChange={e => setWalkinRoomId(Number(e.target.value))}>
                    {allRooms
                      .filter(r => r.status === 'available' && r.operational_status === 'ready')
                      .map(r => (
                        <option key={r.id} value={r.id}>
                          Room #{r.room_number} - {r.room_type_name} (ETB {r.price_per_night}/night)
                        </option>
                      ))}
                  </Select>
                </Field>

                <Field label="Number of Nights">
                  <Input
                    type="number"
                    min={1}
                    max={30}
                    value={walkinNights}
                    onChange={e => setWalkinNights(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  />
                </Field>
              </div>

              <Field label="Payment Method">
                <Select value={walkinMethod} onChange={e => setWalkinMethod(e.target.value as any)}>
                  <option value="card">Credit / Debit Card (POS)</option>
                  <option value="cash">Cash (ETB)</option>
                  <option value="bank_transfer">CBE / Telebirr Mobile Transfer</option>
                </Select>
              </Field>

              <div className="pt-2 flex justify-end">
                <Btn variant="primary" size="md" type="submit" disabled={walkinSubmitting}>
                  {walkinSubmitting ? 'Registering...' : 'Register & Check-In Immediately'}
                </Btn>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────── TAB: GUEST MANAGEMENT ────────────────── */}
      {activeTab === 'guests' && (
        <div className="space-y-6">
          <PageHeader
            title="Guest Management Directory"
            subtitle="Search and view historical guest profiles and contact details"
            actions={<RefreshBtn onClick={loadFrontDeskData} loading={loading} />}
          />

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search guests by name, email, or phone..."
              value={guestSearch}
              onChange={e => setGuestSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Country</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4 text-right">In-House Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredGuests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No guests found matching search.
                    </td>
                  </tr>
                ) : (
                  filteredGuests.map(g => {
                    const inHouse = allBookings.find(b => b.customer_id === g.id && b.status === 'checked_in');
                    return (
                      <tr key={g.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs">
                            {g.full_name?.charAt(0) || 'G'}
                          </div>
                          {g.full_name}
                        </td>
                        <td className="py-3 px-4 text-slate-300">{g.email}</td>
                        <td className="py-3 px-4 text-slate-400 font-mono">{g.phone || '—'}</td>
                        <td className="py-3 px-4 text-slate-300">{g.country || 'Ethiopia'}</td>
                        <td className="py-3 px-4 text-slate-500 font-mono">{g.created_at?.split('T')[0] || 'Recent'}</td>
                        <td className="py-3 px-4 text-right">
                          {inHouse ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              Room #{inHouse.room_number}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400">
                              Registered
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ────────────────── TAB: GUEST SEARCH ────────────────── */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          <PageHeader
            title="Fast Front Desk Search"
            subtitle="Search across guest names, booking references, room numbers, and phone numbers"
          />

          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Enter reference number (e.g. AG-2026-9287), guest name, or room number..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 shadow-xl"
              autoFocus
            />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Ref</th>
                  <th className="py-3 px-4">Guest</th>
                  <th className="py-3 px-4">Room</th>
                  <th className="py-3 px-4">Dates</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {unifiedSearchResults.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      {searchQuery ? 'No matching records found.' : 'Type above to begin searching across hotel records.'}
                    </td>
                  </tr>
                ) : (
                  unifiedSearchResults.map(b => (
                    <tr key={b.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">{b.booking_reference}</td>
                      <td className="py-3 px-4 font-semibold text-white">{b.customer_name}</td>
                      <td className="py-3 px-4 font-bold text-slate-200">Room #{b.room_number}</td>
                      <td className="py-3 px-4 font-mono">{b.check_in_date?.split('T')[0]} &rarr; {b.check_out_date?.split('T')[0]}</td>
                      <td className="py-3 px-4"><StatusBadge status={b.status} /></td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setViewingBooking(b)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-semibold"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ────────────────── TAB: PAYMENTS & RECEIPTS ────────────────── */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <PageHeader
            title="Payments, Folios & Receipts"
            subtitle="Record front desk payments, issue official receipts, and review settled guest folios"
            actions={<RefreshBtn onClick={loadFrontDeskData} loading={loading} />}
          />

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Receipt Ref</th>
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Recorded Date</th>
                  <th className="py-3 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No payments logged in the system.
                    </td>
                  </tr>
                ) : (
                  payments.map(p => (
                    <tr key={p.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">{p.payment_reference}</td>
                      <td className="py-3 px-4 font-mono text-slate-300">#{p.booking_reference || `BK-${p.booking_id}`}</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">ETB {Number(p.amount).toLocaleString()}</td>
                      <td className="py-3 px-4 capitalize font-semibold text-slate-200">{p.payment_method.replace('_', ' ')}</td>
                      <td className="py-3 px-4"><StatusBadge status={p.status} /></td>
                      <td className="py-3 px-4 text-slate-400 font-mono">{p.created_at?.split('T')[0]}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            const b = allBookings.find(bk => bk.id === p.booking_id);
                            if (b && b.invoice_number) {
                              setSelectedInvoiceId(b.invoice_number);
                              setShowInvoiceModal(true);
                            } else {
                              alert(`Receipt #${p.payment_reference} for ETB ${p.amount} verified.`);
                            }
                          }}
                          className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded text-[11px] font-semibold flex items-center gap-1 ml-auto"
                        >
                          <Receipt className="w-3.5 h-3.5" /> View Receipt
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ────────────────── TAB: NOTIFICATIONS ────────────────── */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <PageHeader
            title="Front Desk Notifications & Alerts"
            subtitle="Arrival notices, housekeeping room turnovers, and guest special requests"
            actions={<RefreshBtn onClick={loadFrontDeskData} loading={loading} />}
          />

          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-slate-900 rounded-2xl border border-slate-800">
                No active notifications.
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                    n.is_read ? 'bg-slate-900/60 border-slate-800/80 text-slate-400' : 'bg-slate-900 border-amber-500/40 text-slate-200 shadow-lg'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 mt-0.5">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-xs">{n.title}</h4>
                      <p className="text-xs text-slate-300 mt-0.5">{n.message}</p>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        {n.created_at ? n.created_at.replace('T', ' ').slice(0, 16) : 'Just now'}
                      </span>
                    </div>
                  </div>
                  {!n.is_read && (
                    <button
                      onClick={() => handleMarkNotificationRead(n.id)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-semibold shrink-0"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ────────────────── TAB: PROFILE ────────────────── */}
      {activeTab === 'profile' && (
        <div className="space-y-6 max-w-4xl">
          <PageHeader
            title="Front Desk Officer Profile"
            subtitle="Receptionist shift authorization and system security information"
          />

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-serif font-bold text-2xl">
                {user?.full_name?.charAt(0) || 'R'}
              </div>
              <div>
                <h3 className="font-serif font-bold text-white text-lg">{user?.full_name || 'Front Desk Officer'}</h3>
                <p className="text-xs text-slate-400">{user?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Front Desk & Reception
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                    Shift Active
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-white block">Front Desk Operational Scope</span>
                <ul className="space-y-1.5 text-slate-300">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Guest Check-In & Keycard Issuance</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Walk-In Guest Fast Registration</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Folio Payment Recording & Receipts</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Checkout & Housekeeping Turnover Dispatch</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-white block">Hotel Branch Details</span>
                <div className="space-y-1 text-slate-400">
                  <p>Branch: <strong className="text-slate-200">HABESHA-HOTEL Flagship Luxury & Suites</strong></p>
                  <p>Location: <strong className="text-slate-200">Africa Avenue, Bole Sub-City, Addis Ababa</strong></p>
                  <p>Currency: <strong className="text-amber-400">ETB (Ethiopian Birr)</strong></p>
                  <p>Tax Rate: <strong className="text-slate-200">{taxRate || 12}% Occupancy & Tourism Tax</strong></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── MODALS ────────────────── */}

      {/* Booking Details Modal */}
      <Modal
        open={!!viewingBooking}
        title={viewingBooking ? `Reservation Details #${viewingBooking.booking_reference}` : ''}
        onClose={() => setViewingBooking(null)}
      >
        {viewingBooking && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Guest Name:</span>
                <span className="font-bold text-white">{viewingBooking.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="text-slate-200">{viewingBooking.customer_email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phone:</span>
                <span className="text-slate-200">{viewingBooking.customer_phone || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Room:</span>
                <span className="font-bold text-amber-400">#{viewingBooking.room_number} ({viewingBooking.room_type_name})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Stay Period:</span>
                <span className="font-mono text-slate-200">{viewingBooking.check_in_date?.split('T')[0]} &rarr; {viewingBooking.check_out_date?.split('T')[0]} ({viewingBooking.nights_count}N)</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2 font-bold text-sm">
                <span className="text-slate-300">Total Charged:</span>
                <span className="text-amber-400 font-mono">ETB {Number(viewingBooking.total_amount).toLocaleString()}</span>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              {viewingBooking.invoice_number && (
                <Btn
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const inv = viewingBooking.invoice_number;
                    setViewingBooking(null);
                    setSelectedInvoiceId(inv!);
                    setShowInvoiceModal(true);
                  }}
                >
                  View Official Invoice
                </Btn>
              )}
              <Btn variant="secondary" size="sm" onClick={() => setViewingBooking(null)}>
                Close
              </Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        open={!!paymentBooking}
        title={paymentBooking ? `Record Payment — Booking #${paymentBooking.booking_reference}` : ''}
        onClose={() => setPaymentBooking(null)}
      >
        {paymentBooking && (
          <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Guest:</span>
                <span className="font-bold text-white">{paymentBooking.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Billed:</span>
                <span className="font-mono text-slate-200">ETB {Number(paymentBooking.total_amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Already Paid:</span>
                <span className="font-mono text-emerald-400">ETB {Number(paymentBooking.paid_amount || 0).toLocaleString()}</span>
              </div>
            </div>

            <Field label="Payment Amount (ETB)">
              <Input
                type="number"
                min={1}
                value={paymentAmount}
                onChange={e => setPaymentAmount(Number(e.target.value))}
                required
              />
            </Field>

            <Field label="Payment Method">
              <Select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as any)}>
                <option value="card">Credit / Debit Card (POS)</option>
                <option value="cash">Cash (ETB)</option>
                <option value="bank_transfer">CBE / Telebirr Mobile Transfer</option>
              </Select>
            </Field>

            <div className="flex justify-end gap-2 pt-2">
              <Btn variant="secondary" size="sm" onClick={() => setPaymentBooking(null)} type="button">
                Cancel
              </Btn>
              <Btn variant="primary" size="sm" type="submit" disabled={recordingPayment}>
                {recordingPayment ? 'Recording...' : 'Record Payment & Issue Receipt'}
              </Btn>
            </div>
          </form>
        )}
      </Modal>

      {/* Official Invoice & Receipt Modal */}
      <InvoiceModal
        invoiceIdOrBookingId={selectedInvoiceId}
        isOpen={showInvoiceModal}
        onClose={() => {
          setShowInvoiceModal(false);
          setSelectedInvoiceId(null);
        }}
      />
    </DashboardLayout>
  );
};
