import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Room, RoomType, Booking, Payment, Invoice, User, Employee } from '../../types';
import { InvoiceModal } from '../../components/common/InvoiceModal';
import { DashboardLayout, NAV_ITEMS } from '../../components/dashboard/DashboardLayout';
import { StatCard, PageHeader, SectionCard, StatusBadge, Btn, Modal, Field, Input, Textarea, Select, RefreshBtn, EmptyState, LoadingSpinner } from '../../components/dashboard/DashboardUI';
import { UserManagement } from '../superadmin/UserManagement';
import {
  TrendingUp,
  DollarSign,
  Building,
  Calendar,
  Users,
  ShieldCheck,
  Download,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Clock,
  Settings,
  FileText,
  Filter,
  Search,
  RefreshCw,
  Sparkles,
  X,
  BedDouble,
  CreditCard,
  BarChart3,
  LogOut,
  LogIn,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Hammer
} from 'lucide-react';

interface AdminDashboardProps { onNavigateToWebsite: () => void; }

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateToWebsite }) => {
  const { user } = useAuth();
  const { formatCurrency, formatDate } = useLanguage();

  const [activeTab, setActiveTab] = useState<'overview' | 'rooms' | 'bookings' | 'finance' | 'users' | 'settings' | 'reports'>('overview');

  // KPI Overview Data
  const [reportData, setReportData] = useState<any>(null);
  const [trendsData, setTrendsData] = useState<any>(null);
  const [arrivalsDepartures, setArrivalsDepartures] = useState<{ arrivals: Booking[]; departures: Booking[] }>({ arrivals: [], departures: [] });
  const [recentBookingsList, setRecentBookingsList] = useState<Booking[]>([]);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  // Entities state
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Search & Filters
  const [searchBooking, setSearchBooking] = useState('');
  const [filterBookingStatus, setFilterBookingStatus] = useState('');
  const [filterRoomStatus, setFilterRoomStatus] = useState('');

  // Modals & Active Selections
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | string | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // New Room Form state
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomTypeId, setNewRoomTypeId] = useState<number>(1);
  const [newRoomFloor, setNewRoomFloor] = useState<number>(1);
  const [newRoomPrice, setNewRoomPrice] = useState<number>(4500);
  const [newRoomNotes, setNewRoomNotes] = useState('');

  // New User Form state
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'manager' | 'receptionist' | 'housekeeper' | 'customer' | 'maintenance'>('customer');
  const [newUserPassword, setNewUserPassword] = useState('Welcome123!');
  const [newUserPhone, setNewUserPhone] = useState('');

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<Record<string, string>>({});
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Fetch report overview resiliently
  const fetchOverview = async () => {
    setLoadingOverview(true);
    setOverviewError(null);
    try {
      const [ov, tr, arrDep, bks, rms, emps] = await Promise.all([
        api.get<any>('/reports/overview').catch(() => null),
        api.get<any>('/reports/revenue-trends').catch(() => null),
        api.get<{ arrivals: Booking[]; departures: Booking[] }>('/bookings/arrivals-departures').catch(() => ({ arrivals: [], departures: [] })),
        api.get<Booking[]>('/bookings?limit=10').catch(() => []),
        api.get<Room[]>('/rooms').catch(() => []),
        api.get<Employee[]>('/employees').catch(() => []),
      ]);

      if (!ov && !tr && (!rms || rms.length === 0)) {
        throw new Error('Unable to connect to hotel metrics API. Please verify backend server is running.');
      }

      // If backend reports/overview responded
      if (ov) {
        setReportData(ov);
      } else if (rms && rms.length > 0) {
        // Fallback calculations from raw collections
        const totalR = rms.length;
        const occR = rms.filter(r => r.status === 'occupied').length;
        const resR = rms.filter(r => r.status === 'reserved').length;
        const availR = rms.filter(r => r.status === 'available').length;
        const dirtyR = rms.filter(r => r.status === 'dirty' || r.operational_status === 'needs_cleaning').length;
        const maintR = rms.filter(r => r.status === 'maintenance' || r.operational_status === 'under_repair').length;
        const occRate = totalR > 0 ? parseFloat((((occR + resR) / totalR) * 100).toFixed(1)) : 0;

        setReportData({
          revenue: { total_revenue: 0, outstanding_balance: 0, adr: 4500, revpar: 3800 },
          rooms: { total: totalR, available: availR, occupied: occR, reserved: resR, dirty: dirtyR, maintenance: maintR, occupancy_rate: occRate },
          bookings: { total: bks.length, active: occR + resR, completed: 0, cancelled: 0 },
          people: { customers: bks.length, employees: emps.length },
          recent_activities: [],
          recent_payments: [],
        });
      }

      setTrendsData(tr || null);
      setArrivalsDepartures(arrDep || { arrivals: [], departures: [] });
      setRecentBookingsList(bks || []);
      if (rms && rms.length > 0) setRooms(rms);
      if (emps && emps.length > 0) setEmployees(emps);
    } catch (e: any) {
      console.error('Failed to fetch overview stats:', e);
      setOverviewError(e.message || 'Failed to calculate real-time hotel operational metrics.');
    } finally {
      setLoadingOverview(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const [r, rt] = await Promise.all([
        api.get<Room[]>('/rooms').catch(() => []),
        api.get<RoomType[]>('/rooms/types').catch(() => []),
      ]);
      setRooms(r || []);
      setRoomTypes(rt || []);
      if (rt && rt.length > 0) {
        setNewRoomTypeId(rt[0].id);
        setNewRoomPrice(rt[0].base_price || 4500);
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
    }
  };

  const fetchBookings = async () => {
    try {
      let url = '/bookings?';
      if (searchBooking) url += `search=${encodeURIComponent(searchBooking)}&`;
      if (filterBookingStatus) url += `status=${encodeURIComponent(filterBookingStatus)}&`;
      const res = await api.get<Booking[]>(url);
      setBookings(res || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  const fetchFinancials = async () => {
    try {
      const [p, inv] = await Promise.all([
        api.get<Payment[]>('/payments').catch(() => []),
        api.get<Invoice[]>('/invoices').catch(() => []),
      ]);
      setPayments(p || []);
      setInvoices(inv || []);
    } catch (err) {
      console.error('Error fetching financials:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const [u, emp] = await Promise.all([
        api.get<User[]>('/users').catch(() => []),
        api.get<Employee[]>('/employees').catch(() => []),
      ]);
      const usersArray = Array.isArray(u) ? u : ((u as any)?.users || []);
      setUsersList(usersArray);
      setEmployees(emp || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await api.get<{ settings: Record<string, string> }>('/settings');
      if (res?.settings) {
        setSettingsForm(res.settings);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    if (activeTab === 'rooms') fetchRooms();
    else if (activeTab === 'bookings') fetchBookings();
    else if (activeTab === 'finance') fetchFinancials();
    else if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'settings') fetchSettings();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchBookings();
    }
  }, [searchBooking, filterBookingStatus]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/rooms', {
        room_number: newRoomNumber,
        room_type_id: newRoomTypeId,
        floor_number: newRoomFloor,
        price_per_night: newRoomPrice,
        notes: newRoomNotes,
      });
      setShowAddRoomModal(false);
      setNewRoomNumber('');
      setNewRoomNotes('');
      fetchRooms();
      fetchOverview();
    } catch (err: any) {
      alert(err.message || 'Failed to add room');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users', {
        full_name: newUserName,
        email: newUserEmail,
        role: newUserRole,
        password: newUserPassword,
        phone: newUserPhone,
      });
      setShowAddUserModal(false);
      setNewUserName('');
      setNewUserEmail('');
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to create user');
    }
  };

  const handleUpdateRoomStatus = async (roomId: number, status: string, operational_status: string) => {
    try {
      await api.patch(`/rooms/${roomId}/status`, { status, operational_status });
      fetchRooms();
      fetchOverview();
    } catch (err: any) {
      alert(err.message || 'Failed to update room');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/settings', settingsForm);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    }
  };

  const handleExport = (type: 'bookings' | 'payments' | 'rooms') => {
    window.open(`/api/reports/export?type=${type}&format=csv`, '_blank');
  };

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab as any)}
      navItems={NAV_ITEMS.admin}
      onNavigateToWebsite={onNavigateToWebsite}
      title="Hotel Administration"
    >
      {/* Top action bar */}
      <PageHeader
        title={activeTab === 'overview' ? 'Hotel Overview' : activeTab.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
        subtitle="Hotel room inventory, bookings, financials, staff roster, and operational reports"
        actions={
          <>
            <RefreshBtn onClick={fetchOverview} />
            <Btn variant="primary" size="sm" onClick={() => handleExport('bookings')}>
              <Download className="w-3.5 h-3.5" /> Export CSV
            </Btn>
          </>
        }
      />

      <div className="space-y-6 animate-in fade-in duration-200">
        {/* ===================== TAB 1: OVERVIEW & ANALYTICS ===================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {loadingOverview ? (
              <LoadingSpinner label="Calculating real-time hotel metrics…" />
            ) : overviewError && !reportData ? (
              <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-4 shadow-xl">
                <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
                <h3 className="font-serif text-lg font-bold text-white">Connection Error</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">{overviewError}</p>
                <button
                  onClick={fetchOverview}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all cursor-pointer inline-flex items-center gap-2 shadow-lg"
                >
                  <RefreshCw className="w-4 h-4" /> Retry Connection
                </button>
              </div>
            ) : reportData ? (
              <>
                {/* 12 Real Database Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5">
                  <StatCard
                    label="Total Rooms"
                    value={reportData.rooms?.total ?? rooms.length}
                    sub="Across 5 hotel floors"
                    icon={<Building className="w-4 h-4" />}
                    color="amber"
                  />
                  <StatCard
                    label="Available Rooms"
                    value={reportData.rooms?.available ?? 0}
                    sub="Clean & ready for check-in"
                    icon={<CheckCircle2 className="w-4 h-4" />}
                    color="emerald"
                  />
                  <StatCard
                    label="Occupied Rooms"
                    value={reportData.rooms?.occupied ?? 0}
                    sub="Current in-house guests"
                    icon={<BedDouble className="w-4 h-4" />}
                    color="sky"
                  />
                  <StatCard
                    label="Reserved Rooms"
                    value={reportData.rooms?.reserved ?? 0}
                    sub="Upcoming reservations"
                    icon={<Clock className="w-4 h-4" />}
                    color="purple"
                  />
                  <StatCard
                    label="Total Bookings"
                    value={reportData.bookings?.total ?? 0}
                    sub="All-time hotel stays"
                    icon={<Calendar className="w-4 h-4" />}
                    color="sky"
                  />
                  <StatCard
                    label="Today's Check-ins"
                    value={arrivalsDepartures.arrivals?.length ?? 0}
                    sub="Expected guest arrivals"
                    icon={<LogIn className="w-4 h-4" />}
                    color="emerald"
                  />
                  <StatCard
                    label="Today's Check-outs"
                    value={arrivalsDepartures.departures?.length ?? 0}
                    sub="Departures & room turnover"
                    icon={<LogOut className="w-4 h-4" />}
                    color="rose"
                  />
                  <StatCard
                    label="Total Revenue"
                    value={formatCurrency(reportData.revenue?.total_revenue ?? 0)}
                    sub="Gross billed charges"
                    icon={<DollarSign className="w-4 h-4" />}
                    color="emerald"
                  />
                  <StatCard
                    label="Payments Received"
                    value={formatCurrency(reportData.revenue?.total_revenue ?? 0)}
                    sub="Audited settlements"
                    icon={<CreditCard className="w-4 h-4" />}
                    color="emerald"
                  />
                  <StatCard
                    label="Outstanding Balances"
                    value={formatCurrency(reportData.revenue?.outstanding_balance ?? 0)}
                    sub="Uncollected folios"
                    icon={<AlertCircle className="w-4 h-4" />}
                    color="rose"
                  />
                  <StatCard
                    label="Registered Guests"
                    value={reportData.people?.customers ?? 0}
                    sub="Profiles in hotel registry"
                    icon={<Users className="w-4 h-4" />}
                    color="amber"
                  />
                  <StatCard
                    label="Total Hotel Staff"
                    value={reportData.people?.employees ?? employees.length}
                    sub="Active duty personnel"
                    icon={<UserCheck className="w-4 h-4" />}
                    color="purple"
                  />
                </div>

                {/* Live Room Operational Status Distribution */}
                <SectionCard title="Live Room Operational Status & Inventory" subtitle="Real-time occupancy and turnover breakdown">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <span className="block text-2xl font-serif font-bold text-emerald-400">{reportData.rooms?.available ?? 0}</span>
                      <span className="text-[11px] text-slate-400 font-medium">Clean & Available</span>
                    </div>
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                      <span className="block text-2xl font-serif font-bold text-blue-400">{reportData.rooms?.occupied ?? 0}</span>
                      <span className="text-[11px] text-slate-400 font-medium">Guest In-House</span>
                    </div>
                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                      <span className="block text-2xl font-serif font-bold text-purple-400">{reportData.rooms?.reserved ?? 0}</span>
                      <span className="text-[11px] text-slate-400 font-medium">Reserved Today</span>
                    </div>
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                      <span className="block text-2xl font-serif font-bold text-rose-400">{reportData.rooms?.dirty ?? 0}</span>
                      <span className="text-[11px] text-slate-400 font-medium">Needs Housekeeping</span>
                    </div>
                    <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                      <span className="block text-2xl font-serif font-bold text-orange-400">{reportData.rooms?.maintenance ?? 0}</span>
                      <span className="text-[11px] text-slate-400 font-medium">Under Maintenance</span>
                    </div>
                    <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl">
                      <span className="block text-2xl font-serif font-bold text-amber-400">{reportData.rooms?.occupancy_rate ?? 0}%</span>
                      <span className="text-[11px] text-slate-400 font-medium">Occupancy Rate</span>
                    </div>
                  </div>
                </SectionCard>

                {/* Today's Arrivals & Departures Split Table */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Today's Arrivals */}
                  <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <LogIn className="w-4 h-4 text-emerald-400" />
                        <h3 className="font-serif font-bold text-sm text-white">Today's Expected Arrivals</h3>
                      </div>
                      <span className="text-[11px] text-emerald-400 font-semibold">{arrivalsDepartures.arrivals?.length || 0} Guests</span>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {arrivalsDepartures.arrivals?.length === 0 ? (
                        <p className="text-xs text-slate-500 italic py-4 text-center">No more arrivals scheduled for today.</p>
                      ) : (
                        arrivalsDepartures.arrivals?.map(a => (
                          <div key={a.id} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                            <div>
                              <span className="font-semibold text-white block">{a.customer_name}</span>
                              <span className="text-[10px] text-amber-400 font-mono">{a.booking_reference} • Room #{a.room_number || 'TBA'}</span>
                            </div>
                            <span className="font-serif text-slate-300 font-bold">{formatCurrency(a.total_amount)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Today's Departures */}
                  <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <LogOut className="w-4 h-4 text-rose-400" />
                        <h3 className="font-serif font-bold text-sm text-white">Today's Expected Departures</h3>
                      </div>
                      <span className="text-[11px] text-rose-400 font-semibold">{arrivalsDepartures.departures?.length || 0} Guests</span>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {arrivalsDepartures.departures?.length === 0 ? (
                        <p className="text-xs text-slate-500 italic py-4 text-center">No departures scheduled for today.</p>
                      ) : (
                        arrivalsDepartures.departures?.map(d => (
                          <div key={d.id} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                            <div>
                              <span className="font-semibold text-white block">{d.customer_name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">Room #{d.room_number} • {d.room_type_name}</span>
                            </div>
                            <span className="text-[10px] text-amber-400 font-mono font-bold">Checkout 11:00</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Audit Trail & Recent Payments Split */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Audit Events */}
                  <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <h3 className="font-serif text-sm font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        <span>Security & Operational Audit Trail</span>
                      </h3>
                      <span className="text-[10px] text-slate-500 font-mono">Immutable</span>
                    </div>

                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {reportData.recent_activities?.length === 0 ? (
                        <p className="text-xs text-slate-500 italic py-4 text-center">No recent audit logs.</p>
                      ) : (
                        reportData.recent_activities?.map((al: any) => (
                          <div key={al.id} className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80 text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-amber-300 font-mono text-[11px]">{al.action}</span>
                              <span className="text-[10px] text-slate-500">
                                {formatDate(al.created_at)}
                              </span>
                            </div>
                            <p className="text-slate-300 text-[11px]">{al.details}</p>
                            <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                              <span>Actor: {al.user_name || 'System'} ({al.user_role || 'daemon'})</span>
                              <span>IP: {al.ip_address || '127.0.0.1'}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Recent Settled Transactions */}
                  <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <h3 className="font-serif text-sm font-bold text-white flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-emerald-400" />
                        <span>Settled Financial Payments (ETB)</span>
                      </h3>
                      <button onClick={() => setActiveTab('finance')} className="text-xs text-amber-400 hover:underline cursor-pointer">
                        View All
                      </button>
                    </div>

                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {reportData.recent_payments?.length === 0 ? (
                        <p className="text-xs text-slate-500 italic py-4 text-center">No payment transactions recorded yet.</p>
                      ) : (
                        reportData.recent_payments?.map((p: any) => (
                          <div key={p.id} className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80 text-xs flex items-center justify-between">
                            <div>
                              <div className="font-mono font-bold text-white text-[11px]">{p.payment_reference}</div>
                              <div className="text-slate-400 text-[11px]">
                                {p.customer_name} • {p.booking_reference}
                              </div>
                              <div className="text-[10px] text-slate-500 capitalize">{p.payment_method} • {formatDate(p.created_at)}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-emerald-400 text-sm">{formatCurrency(p.amount)}</div>
                              <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                                SETTLED
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* ===================== TAB 2: ROOM MANAGEMENT ===================== */}
        {activeTab === 'rooms' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-slate-100">Hotel Room Inventory & Operational Status</h2>
                <p className="text-xs text-slate-400">Configure room pricing, occupancy state, maintenance, and cleanliness</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddRoomModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Room</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Room #</th>
                      <th className="py-3 px-4">Suite Type</th>
                      <th className="py-3 px-4">Floor</th>
                      <th className="py-3 px-4">Nightly Rate (ETB)</th>
                      <th className="py-3 px-4">Occupancy Status</th>
                      <th className="py-3 px-4">Operational State</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-300">
                    {rooms.map((rm) => (
                      <tr key={rm.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono font-bold text-amber-400 text-sm">#{rm.room_number}</td>
                        <td className="py-3 px-4 font-semibold text-white">{rm.room_type_name}</td>
                        <td className="py-3 px-4 text-slate-400">Floor {rm.floor_number}</td>
                        <td className="py-3 px-4 font-serif font-bold text-white">{formatCurrency(rm.price_per_night)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            rm.status === 'available' ? 'bg-emerald-500/20 text-emerald-300' :
                            rm.status === 'occupied' ? 'bg-blue-500/20 text-blue-300' :
                            rm.status === 'reserved' ? 'bg-purple-500/20 text-purple-300' :
                            rm.status === 'dirty' ? 'bg-rose-500/20 text-rose-300' : 'bg-orange-500/20 text-orange-300'
                          }`}>
                            {rm.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-slate-400 font-mono text-[11px] capitalize">{rm.operational_status?.replace('_', ' ')}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {rm.status !== 'available' && (
                              <button
                                onClick={() => handleUpdateRoomStatus(rm.id, 'available', 'ready')}
                                className="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded text-[10px] font-bold hover:bg-emerald-500/30 cursor-pointer"
                              >
                                Set Available
                              </button>
                            )}
                            {rm.status !== 'maintenance' && (
                              <button
                                onClick={() => handleUpdateRoomStatus(rm.id, 'maintenance', 'under_repair')}
                                className="px-2 py-1 bg-orange-500/20 text-orange-300 rounded text-[10px] font-bold hover:bg-orange-500/30 cursor-pointer"
                              >
                                Set Maint
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
          </div>
        )}

        {/* ===================== TAB 3: BOOKINGS ===================== */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-slate-100">Guest Bookings & Front Desk Folios</h2>
                <p className="text-xs text-slate-400">Search reservations, verify arrivals, check folios, and print receipts</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search bookings by reference or guest name..."
                  value={searchBooking}
                  onChange={e => setSearchBooking(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <select
                value={filterBookingStatus}
                onChange={e => setFilterBookingStatus(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
              >
                <option value="">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="checked_in">Checked In</option>
                <option value="checked_out">Checked Out</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Booking Ref</th>
                      <th className="py-3 px-4">Guest Name</th>
                      <th className="py-3 px-4">Room Reserved</th>
                      <th className="py-3 px-4">Stay Period</th>
                      <th className="py-3 px-4">Total Amount (ETB)</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-300">
                    {bookings.map(b => (
                      <tr key={b.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono font-bold text-amber-400">{b.booking_reference}</td>
                        <td className="py-3 px-4 font-semibold text-white">{b.customer_name}</td>
                        <td className="py-3 px-4 text-slate-300">Room #{b.room_number} ({b.room_type_name})</td>
                        <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                          {formatDate(b.check_in_date)} &rarr; {formatDate(b.check_out_date)}
                        </td>
                        <td className="py-3 px-4 font-serif font-bold text-white">{formatCurrency(b.total_amount)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            b.status === 'checked_in' ? 'bg-blue-500/20 text-blue-300' :
                            b.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {b.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedInvoiceId(b.id);
                              setShowInvoiceModal(true);
                            }}
                            className="text-amber-400 hover:underline font-semibold cursor-pointer"
                          >
                            View Invoice
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 4: FINANCE ===================== */}
        {activeTab === 'finance' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-slate-100">Hotel Finance & Payment Transactions</h2>
                <p className="text-xs text-slate-400">Audited guest payments, Telebirr & CBE settlements, and outstanding folios</p>
              </div>
              <button
                onClick={() => handleExport('payments')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Export Payments CSV
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Payment Ref</th>
                      <th className="py-3 px-4">Booking</th>
                      <th className="py-3 px-4">Channel / Method</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Settled Amount (ETB)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-300">
                    {payments.map(p => (
                      <tr key={p.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono font-bold text-amber-400">{p.payment_reference}</td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-white block">{p.customer_name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{p.booking_reference}</span>
                        </td>
                        <td className="py-3 px-4 uppercase text-[10px] font-bold text-slate-300">{p.payment_method}</td>
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
          </div>
        )}

        {/* ===================== TAB 5: STAFF & USERS ===================== */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <UserManagement viewerRole="admin" />
          </div>
        )}

        {/* ===================== TAB 6: REPORTS & EXPORTS ===================== */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-xl font-bold text-slate-100">Hotel Operational & Financial Reports</h2>
              <p className="text-xs text-slate-400">Export audited CSV data for accounting, auditing, and tax compliance</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 space-y-3 shadow-xl">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-slate-100">All Reservations Report</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Export complete booking history including guest credentials, check-in dates, length of stay, and revenues.
                </p>
                <button
                  onClick={() => handleExport('bookings')}
                  className="w-full py-2 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-300 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Bookings CSV</span>
                </button>
              </div>

              <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 space-y-3 shadow-xl">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-slate-100">Payments & Transactions</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Export settled financial transactions across credit cards, bank wire transfers, and cash desk payments.
                </p>
                <button
                  onClick={() => handleExport('payments')}
                  className="w-full py-2 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-300 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Payments CSV</span>
                </button>
              </div>

              <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 space-y-3 shadow-xl">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                  <Building className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-slate-100">Room Inventory Audit</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Export current status of all rooms, assigned suites, floor locations, prices, and maintenance records.
                </p>
                <button
                  onClick={() => handleExport('rooms')}
                  className="w-full py-2 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-300 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Rooms CSV</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 7: SETTINGS ===================== */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
            <div>
              <h3 className="font-serif font-bold text-lg text-white">Hotel Global Configurations</h3>
              <p className="text-xs text-slate-400">Configure public hotel parameters, taxes, contacts, and check-in times</p>
            </div>

            {settingsSaved && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Hotel configurations successfully saved to database.</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Hotel Legal Name</label>
                <input
                  type="text"
                  value={settingsForm['hotel_name'] || 'HABESHA-HOTEL'}
                  onChange={e => setSettingsForm({ ...settingsForm, hotel_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Reception Phone</label>
                  <input
                    type="text"
                    value={settingsForm['hotel_phone'] || '+251 11 667 8000'}
                    onChange={e => setSettingsForm({ ...settingsForm, hotel_phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Reservation Email</label>
                  <input
                    type="email"
                    value={settingsForm['hotel_email'] || 'reservations@habeshahotel.com'}
                    onChange={e => setSettingsForm({ ...settingsForm, hotel_email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Hotel Physical Address</label>
                <input
                  type="text"
                  value={settingsForm['hotel_address'] || 'Africa Avenue, Bole Sub-City, Addis Ababa, Ethiopia'}
                  onChange={e => setSettingsForm({ ...settingsForm, hotel_address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Occupancy Tax Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={settingsForm['tax_rate'] || '12.0'}
                    onChange={e => setSettingsForm({ ...settingsForm, tax_rate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Currency Code</label>
                  <input
                    type="text"
                    value={settingsForm['currency_symbol'] || 'ETB'}
                    onChange={e => setSettingsForm({ ...settingsForm, currency_symbol: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-lg"
                >
                  Save Configurations
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Modal: Add Room */}
      {showAddRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl text-slate-100">
            <h3 className="text-lg font-serif font-bold text-white">Add New Hotel Room</h3>
            <form onSubmit={handleCreateRoom} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Room Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 501"
                    value={newRoomNumber}
                    onChange={e => setNewRoomNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Floor *</label>
                  <select
                    value={newRoomFloor}
                    onChange={e => setNewRoomFloor(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                  >
                    {[1, 2, 3, 4, 5].map(f => (
                      <option key={f} value={f}>Floor {f}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Room Type *</label>
                <select
                  value={newRoomTypeId}
                  onChange={e => {
                    const id = Number(e.target.value);
                    setNewRoomTypeId(id);
                    const sel = roomTypes.find(rt => rt.id === id);
                    if (sel) setNewRoomPrice(sel.base_price);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                >
                  {roomTypes.map(rt => (
                    <option key={rt.id} value={rt.id}>{rt.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nightly Rate (ETB) *</label>
                <input
                  type="number"
                  required
                  min="100"
                  value={newRoomPrice}
                  onChange={e => setNewRoomPrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-serif"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddRoomModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold rounded-xl cursor-pointer shadow"
                >
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        invoiceIdOrBookingId={selectedInvoiceId}
      />
    </DashboardLayout>
  );
};
