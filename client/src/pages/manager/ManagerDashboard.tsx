import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Room, Booking, HousekeepingTask, MaintenanceRequest, Complaint, Employee, Customer, NotificationItem } from '../../types';
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
  RefreshBtn,
  EmptyState,
  LoadingSpinner
} from '../../components/dashboard/DashboardUI';
import {
  LayoutDashboard,
  CalendarCheck,
  BedDouble,
  Users,
  Sparkles,
  Wrench,
  UserCheck,
  MessageSquare,
  BarChart3,
  Bell,
  User,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Plus,
  Search,
  Download,
  ShieldCheck,
  Eye,
  DollarSign,
  Filter,
  Check,
  Building,
  Home,
  AlertCircle
} from 'lucide-react';

interface ManagerDashboardProps {
  onNavigateToWebsite: () => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ onNavigateToWebsite }) => {
  const { user, currency } = useAuth();

  // Active navigation tab (Default: overview)
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Core Data States
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [arrivals, setArrivals] = useState<Booking[]>([]);
  const [departures, setDepartures] = useState<Booking[]>([]);
  const [tasks, setTasks] = useState<HousekeepingTask[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [reportData, setReportData] = useState<any>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [resSearch, setResSearch] = useState('');
  const [resStatusFilter, setResStatusFilter] = useState('all');
  const [roomFloorFilter, setRoomFloorFilter] = useState('all');
  const [roomStatusFilter, setRoomStatusFilter] = useState('all');
  const [guestSearch, setGuestSearch] = useState('');
  const [staffDeptFilter, setStaffDeptFilter] = useState('all');

  // Modals & Details
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showMaintModal, setShowMaintModal] = useState(false);
  const [maintRoomId, setMaintRoomId] = useState<number>(0);
  const [maintTitle, setMaintTitle] = useState('');
  const [maintDesc, setMaintDesc] = useState('');
  const [maintPriority, setMaintPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [maintCost, setMaintCost] = useState(150);
  const [maintTechId, setMaintTechId] = useState<number | ''>('');

  // Complaint Resolve Modal
  const [resolvingComplaint, setResolvingComplaint] = useState<Complaint | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Housekeeping Task Creation Modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskRoomId, setTaskRoomId] = useState<number>(0);
  const [taskType, setTaskType] = useState<'standard_clean' | 'deep_clean' | 'turn_down' | 'inspection' | 'sanitization'>('standard_clean');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [taskInstructions, setTaskInstructions] = useState('');
  const [taskEmployeeId, setTaskEmployeeId] = useState<number | ''>('');

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [rRes, bRes, arrDepRes, tRes, mRes, cRes, empRes, custRes, repRes, notifRes] = await Promise.all([
        api.get<Room[]>('/rooms').catch(() => []),
        api.get<Booking[]>('/bookings').catch(() => []),
        api.get<{ arrivals: Booking[]; departures: Booking[] }>('/bookings/arrivals-departures').catch(() => ({ arrivals: [], departures: [] })),
        api.get<HousekeepingTask[]>('/housekeeping/tasks').catch(() => []),
        api.get<MaintenanceRequest[]>('/maintenance').catch(() => []),
        api.get<Complaint[]>('/complaints').catch(() => []),
        api.get<Employee[]>('/employees').catch(() => []),
        api.get<Customer[]>('/customers').catch(() => []),
        api.get<any>('/reports/overview').catch(() => null),
        api.get<NotificationItem[]>('/notifications').catch(() => []),
      ]);

      setRooms(rRes || []);
      setBookings(bRes || []);
      setArrivals(arrDepRes?.arrivals || []);
      setDepartures(arrDepRes?.departures || []);
      setTasks(tRes || []);
      setMaintenance(mRes || []);
      setComplaints(cRes || []);
      setEmployees(empRes || []);
      setCustomers(custRes || []);
      setReportData(repRes);
      setNotifications(notifRes || []);

      if (rRes && rRes.length > 0) {
        setMaintRoomId(rRes[0].id);
        setTaskRoomId(rRes[0].id);
      }
    } catch (err) {
      console.error('Manager load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // 10 Key Metrics for Manager Overview
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter(r => r.status === 'available').length;
  const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
  const dirtyRooms = rooms.filter(r => r.status === 'dirty' || r.operational_status === 'needs_cleaning').length;
  const maintenanceRooms = rooms.filter(r => r.status === 'maintenance' || r.operational_status === 'under_repair').length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
  const todaysArrivalsCount = arrivals.length;
  const todaysDeparturesCount = departures.length;
  const totalReservationsCount = bookings.length;
  const pendingHousekeepingCount = tasks.filter(t => t.status !== 'completed' && t.status !== 'verified').length;
  const pendingMaintenanceCount = maintenance.filter(m => m.status !== 'resolved' && m.status !== 'closed' && m.status !== 'cancelled').length;
  const unresolvedComplaintsCount = complaints.filter(c => c.status !== 'resolved' && c.status !== 'closed').length;

  // Actions
  const handleUpdateRoomStatus = async (roomId: number, status: string, operational_status: string) => {
    try {
      await api.patch(`/rooms/${roomId}/status`, { status, operational_status });
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to update room status');
    }
  };

  const handleCreateMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/maintenance', {
        room_id: maintRoomId,
        issue_title: maintTitle,
        description: maintDesc,
        priority: maintPriority,
        estimated_cost: maintCost,
        ...(maintTechId !== '' && { technician_id: maintTechId }),
      });
      setShowMaintModal(false);
      setMaintTitle('');
      setMaintDesc('');
      setMaintTechId('');
      await loadAllData();
      alert('Maintenance request submitted successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to submit maintenance alert');
    }
  };

  const handleResolveMaintenance = async (id: number) => {
    try {
      await api.patch(`/maintenance/${id}`, {
        status: 'resolved',
        resolution_notes: 'Verified and resolved by Operations Manager.',
      });
      await loadAllData();
      alert('Ticket marked as resolved.');
    } catch (err: any) {
      alert(err.message || 'Failed to resolve ticket');
    }
  };

  const handleResolveComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingComplaint) return;
    try {
      await api.patch(`/complaints/${resolvingComplaint.id}/resolve`, {
        status: 'resolved',
        resolution_notes: resolutionNotes || 'Resolved with guest satisfaction.',
      });
      setResolvingComplaint(null);
      setResolutionNotes('');
      await loadAllData();
      alert('Complaint resolved successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to resolve complaint');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/housekeeping/tasks', {
        room_id: taskRoomId,
        task_type: taskType,
        priority: taskPriority,
        instructions: taskInstructions,
        ...(taskEmployeeId !== '' && { assigned_employee_id: taskEmployeeId }),
      });
      setShowTaskModal(false);
      setTaskInstructions('');
      setTaskEmployeeId('');
      await loadAllData();
      alert('Housekeeping task assigned successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to assign task');
    }
  };

  const handleCompleteTask = async (taskId: number) => {
    try {
      await api.patch(`/housekeeping/tasks/${taskId}/status`, { status: 'completed' });
      await loadAllData();
      alert('Task marked as completed.');
    } catch (err: any) {
      alert(err.message || 'Failed to update task status');
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

  // CSV Report Generator
  const handleExportCSV = () => {
    if (bookings.length === 0) {
      alert('No booking records available for export.');
      return;
    }
    const headers = ['Booking Ref', 'Guest Name', 'Email', 'Room', 'Check In', 'Check Out', 'Nights', 'Total (ETB)', 'Status'];
    const rows = bookings.map(b => [
      b.booking_reference,
      `"${b.customer_name}"`,
      b.customer_email,
      b.room_number,
      b.check_in_date?.split('T')[0] || b.check_in_date,
      b.check_out_date?.split('T')[0] || b.check_out_date,
      b.nights_count,
      b.total_amount,
      b.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Habesha_Hotel_Operations_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered reservations
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchSearch = !resSearch ||
        b.booking_reference.toLowerCase().includes(resSearch.toLowerCase()) ||
        b.customer_name.toLowerCase().includes(resSearch.toLowerCase()) ||
        b.room_number.toLowerCase().includes(resSearch.toLowerCase());
      const matchStatus = resStatusFilter === 'all' || b.status === resStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [bookings, resSearch, resStatusFilter]);

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter(r => {
      const matchFloor = roomFloorFilter === 'all' || String(r.floor_number) === roomFloorFilter;
      const matchStatus = roomStatusFilter === 'all' || r.status === roomStatusFilter;
      return matchFloor && matchStatus;
    });
  }, [rooms, roomFloorFilter, roomStatusFilter]);

  // Filtered guests
  const filteredGuests = useMemo(() => {
    return customers.filter(c => {
      if (!guestSearch) return true;
      return (
        c.full_name?.toLowerCase().includes(guestSearch.toLowerCase()) ||
        c.email?.toLowerCase().includes(guestSearch.toLowerCase()) ||
        c.phone?.toLowerCase().includes(guestSearch.toLowerCase())
      );
    });
  }, [customers, guestSearch]);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      if (staffDeptFilter === 'all') return true;
      return e.department_name?.toLowerCase().includes(staffDeptFilter.toLowerCase()) ||
             e.position?.toLowerCase().includes(staffDeptFilter.toLowerCase());
    });
  }, [employees, staffDeptFilter]);

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      navItems={NAV_ITEMS.manager}
      onNavigateToWebsite={onNavigateToWebsite}
      title="Manager Operations Portal"
    >
      {/* ────────────────── TAB: OVERVIEW (DASHBOARD) ────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <PageHeader
            title="Operations Overview"
            subtitle="Real-time pulse of HABESHA-HOTEL accommodations, turnover, and guest services"
            actions={
              <div className="flex items-center gap-2">
                <RefreshBtn onClick={loadAllData} loading={loading} />
                <Btn
                  variant="primary"
                  size="sm"
                  onClick={() => setShowMaintModal(true)}
                >
                  <Plus className="w-4 h-4 mr-1" /> Report Maintenance
                </Btn>
              </div>
            }
          />

          {/* 10 Summary Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <StatCard
              label="Total Rooms"
              value={totalRooms}
              sub="Hotel inventory"
              icon={<Building className="w-4 h-4" />}
              color="default"
            />
            <StatCard
              label="Available Rooms"
              value={availableRooms}
              sub="Ready for sale"
              icon={<BedDouble className="w-4 h-4" />}
              color="emerald"
            />
            <StatCard
              label="Occupied Rooms"
              value={occupiedRooms}
              sub="In-house guests"
              icon={<Home className="w-4 h-4" />}
              color="blue"
            />
            <StatCard
              label="Occupancy Rate"
              value={`${occupancyRate}%`}
              sub={`${occupiedRooms} of ${totalRooms} rooms`}
              icon={<TrendingUp className="w-4 h-4" />}
              color="amber"
            />
            <StatCard
              label="Today's Arrivals"
              value={todaysArrivalsCount}
              sub="Expected check-ins"
              icon={<CalendarCheck className="w-4 h-4" />}
              color="sky"
            />
            <StatCard
              label="Today's Departures"
              value={todaysDeparturesCount}
              sub="Expected check-outs"
              icon={<Clock className="w-4 h-4" />}
              color="purple"
            />
            <StatCard
              label="Total Reservations"
              value={totalReservationsCount}
              sub="All-time bookings"
              icon={<CheckCircle2 className="w-4 h-4" />}
              color="default"
            />
            <StatCard
              label="Pending Housekeeping"
              value={pendingHousekeepingCount}
              sub={`${dirtyRooms} rooms need cleaning`}
              icon={<Sparkles className="w-4 h-4" />}
              color="rose"
            />
            <StatCard
              label="Pending Maintenance"
              value={pendingMaintenanceCount}
              sub={`${maintenanceRooms} rooms in repair`}
              icon={<Wrench className="w-4 h-4" />}
              color="orange"
            />
            <StatCard
              label="Guest Complaints"
              value={unresolvedComplaintsCount}
              sub="Requires resolution"
              icon={<AlertCircle className="w-4 h-4" />}
              color="amber"
            />
          </div>

          {/* Visual Occupancy Bar & Revenue Meter */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-white text-base">Room Portfolio Status Distribution</h3>
                  <p className="text-xs text-slate-400">Live breakdown of hotel accommodations across all floors</p>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                  {occupancyRate}% Occupied
                </span>
              </div>

              {/* Stacked bar */}
              <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden flex">
                <div style={{ width: `${totalRooms > 0 ? (availableRooms / totalRooms) * 100 : 0}%` }} className="bg-emerald-500 transition-all" title={`Available: ${availableRooms}`} />
                <div style={{ width: `${totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0}%` }} className="bg-blue-500 transition-all" title={`Occupied: ${occupiedRooms}`} />
                <div style={{ width: `${totalRooms > 0 ? (dirtyRooms / totalRooms) * 100 : 0}%` }} className="bg-rose-500 transition-all" title={`Needs Cleaning: ${dirtyRooms}`} />
                <div style={{ width: `${totalRooms > 0 ? (maintenanceRooms / totalRooms) * 100 : 0}%` }} className="bg-amber-500 transition-all" title={`Maintenance: ${maintenanceRooms}`} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-slate-300">Available: <strong className="text-white">{availableRooms}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
                  <span className="text-slate-300">Occupied: <strong className="text-white">{occupiedRooms}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
                  <span className="text-slate-300">Turnover: <strong className="text-white">{dirtyRooms}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                  <span className="text-slate-300">Maintenance: <strong className="text-white">{maintenanceRooms}</strong></span>
                </div>
              </div>
            </div>

            {/* Read-only Financial Summary */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-white text-base">Revenue Performance</h3>
                <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Read-Only</span>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80">
                  <span className="text-xs text-slate-400 block mb-0.5">Total System Revenue</span>
                  <span className="font-serif text-xl font-bold text-amber-400">
                    ETB {Number(reportData?.financials?.total_revenue || 0).toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-slate-400 block mb-0.5">Payments Received</span>
                    <span className="font-mono text-sm font-bold text-emerald-400">
                      ETB {Number(reportData?.financials?.total_payments || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block mb-0.5">Outstanding Balance</span>
                    <span className="font-mono text-sm font-bold text-rose-400">
                      ETB {Number(reportData?.financials?.outstanding_balance || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Arrivals & Departures Split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Arrivals */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="font-serif font-bold text-white text-sm flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-emerald-400" /> Today's Arrivals ({arrivals.length})
                </h3>
                <button onClick={() => setActiveTab('reservations')} className="text-xs text-amber-400 hover:underline">
                  View All &rarr;
                </button>
              </div>
              {arrivals.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center italic">No guest arrivals scheduled for today.</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {arrivals.slice(0, 5).map(b => (
                    <div key={b.id} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-slate-200 block">{b.customer_name}</span>
                        <span className="text-[11px] text-slate-400">Ref: <strong className="text-amber-400">{b.booking_reference}</strong> • Room #{b.room_number}</span>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Departures */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="font-serif font-bold text-white text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" /> Today's Departures ({departures.length})
                </h3>
                <button onClick={() => setActiveTab('reservations')} className="text-xs text-amber-400 hover:underline">
                  View All &rarr;
                </button>
              </div>
              {departures.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center italic">No guest departures scheduled for today.</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {departures.slice(0, 5).map(b => (
                    <div key={b.id} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-slate-200 block">{b.customer_name}</span>
                        <span className="text-[11px] text-slate-400">Ref: <strong className="text-amber-400">{b.booking_reference}</strong> • Room #{b.room_number}</span>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Operational Alerts Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h3 className="font-serif font-bold text-white text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Operational Attention Items
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <span className="font-bold text-rose-300 block mb-1">Rooms Awaiting Turnover ({dirtyRooms})</span>
                <p className="text-slate-300 text-[11px]">Housekeeping staff need to turnover dirty rooms before afternoon arrivals.</p>
                <button onClick={() => setActiveTab('housekeeping')} className="mt-2 text-[11px] font-semibold text-rose-300 underline">
                  Open Housekeeping &rarr;
                </button>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <span className="font-bold text-amber-300 block mb-1">Open Maintenance Tickets ({pendingMaintenanceCount})</span>
                <p className="text-slate-300 text-[11px]">Technicians currently assigned to room repairs and facilities checks.</p>
                <button onClick={() => setActiveTab('maintenance')} className="mt-2 text-[11px] font-semibold text-amber-300 underline">
                  Open Maintenance &rarr;
                </button>
              </div>

              <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl">
                <span className="font-bold text-sky-300 block mb-1">Guest Inquiries & Complaints ({unresolvedComplaintsCount})</span>
                <p className="text-slate-300 text-[11px]">Active guest complaints under review awaiting management resolution.</p>
                <button onClick={() => setActiveTab('complaints')} className="mt-2 text-[11px] font-semibold text-sky-300 underline">
                  Open Complaints &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── TAB: RESERVATIONS ────────────────── */}
      {activeTab === 'reservations' && (
        <div className="space-y-6">
          <PageHeader
            title="Reservations & Bookings"
            subtitle="Search, filter, and monitor all guest room reservations across HABESHA-HOTEL"
            actions={
              <div className="flex items-center gap-2">
                <Btn variant="secondary" size="sm" onClick={handleExportCSV}>
                  <Download className="w-4 h-4 mr-1" /> Export CSV
                </Btn>
                <RefreshBtn onClick={loadAllData} loading={loading} />
              </div>
            }
          />

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by reference, guest name, or room number..."
                value={resSearch}
                onChange={e => setResSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <select
              value={resStatusFilter}
              onChange={e => setResStatusFilter(e.target.value)}
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

          {/* Reservations Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Guest</th>
                  <th className="py-3 px-4">Room</th>
                  <th className="py-3 px-4">Dates</th>
                  <th className="py-3 px-4">Nights</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      No reservations matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map(b => (
                    <tr key={b.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">{b.booking_reference}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-white block">{b.customer_name}</span>
                        <span className="text-[10px] text-slate-400">{b.customer_email}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-white">#{b.room_number}</span>
                        <span className="text-[10px] text-slate-400 block">{b.room_type_name}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">
                        {b.check_in_date?.split('T')[0]} &rarr; {b.check_out_date?.split('T')[0]}
                      </td>
                      <td className="py-3 px-4 font-mono">{b.nights_count}N</td>
                      <td className="py-3 px-4 font-mono font-bold text-amber-300">
                        ETB {Number(b.total_amount).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-semibold transition-colors"
                        >
                          Details
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

      {/* ────────────────── TAB: ROOM STATUS ────────────────── */}
      {activeTab === 'rooms' && (
        <div className="space-y-6">
          <PageHeader
            title="Room Inventory & Operational Status"
            subtitle="Live status board separated by operational cleanliness and reservation status"
            actions={<RefreshBtn onClick={loadAllData} loading={loading} />}
          />

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Filter className="w-3.5 h-3.5" /> Floor:
            </div>
            {['all', '1', '2', '3', '4'].map(f => (
              <button
                key={f}
                onClick={() => setRoomFloorFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  roomFloorFilter === f ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {f === 'all' ? 'All Floors' : `Floor ${f}`}
              </button>
            ))}

            <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-400">
              Status:
              <select
                value={roomStatusFilter}
                onChange={e => setRoomStatusFilter(e.target.value)}
                className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none"
              >
                <option value="all">All</option>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="dirty">Dirty</option>
                <option value="reserved">Reserved</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredRooms.map(room => (
              <div
                key={room.id}
                className="p-4 bg-slate-900 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all shadow-md space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-lg text-amber-400">#{room.room_number}</span>
                    <span className="text-xs text-slate-300 font-semibold ml-2">{room.room_type_name}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    room.status === 'available' ? 'bg-emerald-500/20 text-emerald-300' :
                    room.status === 'occupied' ? 'bg-blue-500/20 text-blue-300' :
                    room.status === 'reserved' ? 'bg-amber-500/20 text-amber-300' :
                    room.status === 'dirty' ? 'bg-rose-500/20 text-rose-300' :
                    'bg-orange-500/20 text-orange-300'
                  }`}>
                    {room.status}
                  </span>
                </div>

                <div className="text-xs text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Floor Level:</span>
                    <span className="text-slate-200">Floor {room.floor_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Readiness:</span>
                    <span className={`font-mono font-semibold ${
                      room.operational_status === 'ready' ? 'text-emerald-400' :
                      room.operational_status === 'under_repair' ? 'text-orange-400' : 'text-amber-400'
                    }`}>
                      {room.operational_status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rate:</span>
                    <span className="font-mono text-amber-300">ETB {Number(room.price_per_night).toLocaleString()}/night</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-end gap-1.5">
                  {room.status !== 'occupied' && (
                    <>
                      <button
                        onClick={() => handleUpdateRoomStatus(room.id, 'available', 'ready')}
                        className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded text-[10px] font-semibold"
                      >
                        Mark Ready
                      </button>
                      <button
                        onClick={() => handleUpdateRoomStatus(room.id, 'dirty', 'needs_cleaning')}
                        className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded text-[10px] font-semibold"
                      >
                        Mark Dirty
                      </button>
                      <button
                        onClick={() => handleUpdateRoomStatus(room.id, 'maintenance', 'under_repair')}
                        className="px-2 py-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded text-[10px] font-semibold"
                      >
                        Repair
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ────────────────── TAB: GUEST MANAGEMENT ────────────────── */}
      {activeTab === 'guests' && (
        <div className="space-y-6">
          <PageHeader
            title="Guest Directory"
            subtitle="In-house residents and registered hotel guest database"
            actions={<RefreshBtn onClick={loadAllData} loading={loading} />}
          />

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search guests by name, email, or phone number..."
              value={guestSearch}
              onChange={e => setGuestSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Guest Name</th>
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
                    const inHouseBooking = bookings.find(b => b.customer_id === g.id && b.status === 'checked_in');
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
                        <td className="py-3 px-4 text-slate-500 font-mono">
                          {g.created_at ? g.created_at.split('T')[0] : 'Recent'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {inHouseBooking ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              In-House (Room #{inHouseBooking.room_number})
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

      {/* ────────────────── TAB: HOUSEKEEPING ────────────────── */}
      {activeTab === 'housekeeping' && (
        <div className="space-y-6">
          <PageHeader
            title="Housekeeping Task Management"
            subtitle="Oversee room turnover, cleanliness inspections, and staff task dispatching"
            actions={
              <div className="flex items-center gap-2">
                <Btn
                  variant="primary"
                  size="sm"
                  onClick={() => setShowTaskModal(true)}
                >
                  <Plus className="w-4 h-4 mr-1" /> Assign Task
                </Btn>
                <RefreshBtn onClick={loadAllData} loading={loading} />
              </div>
            }
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Clean & Ready" value={availableRooms} sub="Ready for arrivals" color="emerald" icon={<BedDouble className="w-4 h-4" />} />
            <StatCard label="Needs Cleaning" value={dirtyRooms} sub="Awaiting turnover" color="rose" icon={<Sparkles className="w-4 h-4" />} />
            <StatCard label="Active Tasks" value={tasks.filter(t => t.status === 'in_progress').length} sub="Currently in work" color="amber" icon={<Clock className="w-4 h-4" />} />
            <StatCard label="Total Tasks Today" value={tasks.length} sub="Logged housekeeping tasks" color="default" icon={<CheckCircle2 className="w-4 h-4" />} />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Room</th>
                  <th className="py-3 px-4">Task Type</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Assigned Attendant</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Instructions</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No housekeeping tasks logged.
                    </td>
                  </tr>
                ) : (
                  tasks.map(t => (
                    <tr key={t.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">Room #{t.room_number}</td>
                      <td className="py-3 px-4 font-medium capitalize text-slate-200">
                        {t.task_type.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          t.priority === 'urgent' || t.priority === 'high' ? 'bg-rose-500/20 text-rose-300' :
                          t.priority === 'medium' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-700 text-slate-300'
                        }`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {t.assigned_employee_name || 'Unassigned'}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="py-3 px-4 text-slate-400 italic max-w-xs truncate">
                        {t.instructions || 'Standard room turnover protocol'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {t.status !== 'completed' && t.status !== 'verified' && (
                          <button
                            onClick={() => handleCompleteTask(t.id)}
                            className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded text-[11px] font-semibold"
                          >
                            Mark Done
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

      {/* ────────────────── TAB: MAINTENANCE ────────────────── */}
      {activeTab === 'maintenance' && (
        <div className="space-y-6">
          <PageHeader
            title="Maintenance & Facilities Tickets"
            subtitle="Track equipment repairs, air conditioning, plumbing, and technician assignments"
            actions={
              <div className="flex items-center gap-2">
                <Btn
                  variant="primary"
                  size="sm"
                  onClick={() => setShowMaintModal(true)}
                >
                  <Plus className="w-4 h-4 mr-1" /> Create Maintenance Alert
                </Btn>
                <RefreshBtn onClick={loadAllData} loading={loading} />
              </div>
            }
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Open Tickets" value={pendingMaintenanceCount} sub="Awaiting technician" color="orange" icon={<Wrench className="w-4 h-4" />} />
            <StatCard label="Urgent Repairs" value={maintenance.filter(m => m.priority === 'critical' || m.priority === 'high').length} sub="High priority" color="rose" icon={<AlertTriangle className="w-4 h-4" />} />
            <StatCard label="Resolved Tickets" value={maintenance.filter(m => m.status === 'resolved' || m.status === 'closed').length} sub="Completed repairs" color="emerald" icon={<CheckCircle2 className="w-4 h-4" />} />
            <StatCard label="Rooms Under Repair" value={maintenanceRooms} sub="Out of booking inventory" color="amber" icon={<Building className="w-4 h-4" />} />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Room</th>
                  <th className="py-3 px-4">Issue Title</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Technician</th>
                  <th className="py-3 px-4">Reported At</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {maintenance.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      No maintenance tickets logged.
                    </td>
                  </tr>
                ) : (
                  maintenance.map(m => (
                    <tr key={m.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">#MNT-{m.id}</td>
                      <td className="py-3 px-4 font-bold text-white">Room #{m.room_number}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-200 block">{m.issue_title}</span>
                        <span className="text-[10px] text-slate-400 italic">{m.description}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          m.priority === 'critical' ? 'bg-rose-600/30 text-rose-300 border border-rose-500/40' :
                          m.priority === 'high' ? 'bg-rose-500/20 text-rose-300' :
                          m.priority === 'medium' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-700 text-slate-300'
                        }`}>
                          {m.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{m.technician_name || 'Unassigned'}</td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{m.reported_at?.split('T')[0] || 'Today'}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={m.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        {m.status !== 'resolved' && m.status !== 'closed' && (
                          <button
                            onClick={() => handleResolveMaintenance(m.id)}
                            className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded text-[11px] font-semibold"
                          >
                            Resolve
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

      {/* ────────────────── TAB: STAFF MANAGEMENT ────────────────── */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          <PageHeader
            title="Hotel Staff & Department Operations"
            subtitle="View employees across Reception, Housekeeping, Facilities, Dining, and Management"
            actions={<RefreshBtn onClick={loadAllData} loading={loading} />}
          />

          <div className="flex flex-wrap items-center gap-2">
            {['all', 'Reception', 'Housekeeping', 'Maintenance', 'Kitchen', 'Management'].map(dept => (
              <button
                key={dept}
                onClick={() => setStaffDeptFilter(dept)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  staffDeptFilter === dept ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {dept === 'all' ? 'All Departments' : dept}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map(emp => (
              <div key={emp.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-sm shrink-0">
                  {emp.full_name?.charAt(0) || 'E'}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-white text-xs truncate">{emp.full_name}</h4>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-300">
                      {emp.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-400 font-medium">{emp.position}</p>
                  <p className="text-[11px] text-slate-400">Dept: <strong className="text-slate-300">{emp.department_name || 'Operations'}</strong></p>
                  <p className="text-[10px] text-slate-500 truncate">{emp.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ────────────────── TAB: GUEST COMPLAINTS ────────────────── */}
      {activeTab === 'complaints' && (
        <div className="space-y-6">
          <PageHeader
            title="Guest Inquiries & Complaints"
            subtitle="Review customer feedback, resolve issues promptly, and preserve 5-star Ethiopian hospitality"
            actions={<RefreshBtn onClick={loadAllData} loading={loading} />}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complaints.length === 0 ? (
              <div className="col-span-2 py-12 text-center text-slate-500 bg-slate-900 rounded-2xl border border-slate-800">
                No guest complaints currently on file.
              </div>
            ) : (
              complaints.map(c => (
                <div key={c.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-serif font-bold text-white text-sm">{c.title}</h4>
                      <p className="text-xs text-slate-400">
                        Guest: <strong className="text-amber-400">{c.customer_name}</strong>
                        {c.booking_reference && <span> • Ref: #{c.booking_reference}</span>}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      c.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-300' :
                      c.status === 'under_investigation' ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {c.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                    "{c.description}"
                  </p>

                  {c.resolution_notes && (
                    <div className="text-[11px] text-emerald-400 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                      <strong>Resolution:</strong> {c.resolution_notes}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                    <span className="text-[10px] text-slate-500">Logged: {c.created_at?.split('T')[0] || 'Recently'}</span>
                    {c.status !== 'resolved' && c.status !== 'closed' && (
                      <button
                        onClick={() => {
                          setResolvingComplaint(c);
                          setResolutionNotes('');
                        }}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors"
                      >
                        Resolve Complaint
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ────────────────── TAB: REPORTS & ANALYTICS ────────────────── */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <PageHeader
            title="Reports & Operations Analytics"
            subtitle="Executive operational performance, occupancy trends, and room utilization"
            actions={
              <Btn variant="primary" size="sm" onClick={handleExportCSV}>
                <Download className="w-4 h-4 mr-1" /> Export Operations CSV
              </Btn>
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Revenue (ETB)" value={`ETB ${Number(reportData?.financials?.total_revenue || 0).toLocaleString()}`} sub="All booking charges" color="amber" icon={<DollarSign className="w-4 h-4" />} />
            <StatCard label="Average Occupancy" value={`${occupancyRate}%`} sub="Overall utilization" color="blue" icon={<TrendingUp className="w-4 h-4" />} />
            <StatCard label="Total Stays Handled" value={totalReservationsCount} sub="Customer check-ins" color="emerald" icon={<CalendarCheck className="w-4 h-4" />} />
            <StatCard label="Registered Customers" value={customers.length} sub="Unique customer profiles" color="purple" icon={<Users className="w-4 h-4" />} />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="font-serif font-bold text-white text-base">Room Type Utilization Summary</h3>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Room Category</th>
                  <th className="py-3 px-4">Inventory Count</th>
                  <th className="py-3 px-4">Occupied Currently</th>
                  <th className="py-3 px-4">Nightly Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {['Deluxe King Room', 'Twin Deluxe Room', 'Executive Club Room', 'Family Grand Suite', 'Junior Sovereign Suite', 'Presidential Penthouse Suite'].map((typeName, idx) => {
                  const ofType = rooms.filter(r => r.room_type_name === typeName);
                  const occOfType = ofType.filter(r => r.status === 'occupied').length;
                  const price = ofType[0]?.price_per_night || 5000;
                  return (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-semibold text-white">{typeName}</td>
                      <td className="py-3 px-4 font-mono">{ofType.length || 2} Rooms</td>
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">{occOfType} Occupied</td>
                      <td className="py-3 px-4 font-mono text-emerald-400">ETB {Number(price).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ────────────────── TAB: NOTIFICATIONS ────────────────── */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <PageHeader
            title="Operational Notifications"
            subtitle="System alerts, new reservations, guest requests, and maintenance status updates"
            actions={<RefreshBtn onClick={loadAllData} loading={loading} />}
          />

          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-slate-900 rounded-2xl border border-slate-800">
                No active notifications at this time.
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

      {/* ────────────────── TAB: MY PROFILE ────────────────── */}
      {activeTab === 'profile' && (
        <div className="space-y-6 max-w-4xl">
          <PageHeader
            title="Manager Profile & Credentials"
            subtitle="Account details, operational authorization, and security status"
          />

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-serif font-bold text-2xl">
                {user?.full_name?.charAt(0) || 'M'}
              </div>
              <div>
                <h3 className="font-serif font-bold text-white text-lg">{user?.full_name || 'Operations Manager'}</h3>
                <p className="text-xs text-slate-400">{user?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Hotel Operations Manager
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                    Bole Flagship Branch
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-white block">Manager Role Authorizations</span>
                <ul className="space-y-1.5 text-slate-300">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Room Readiness & Inventory Overrides</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Housekeeping & Maintenance Dispatch</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Guest Complaint Investigation & Resolution</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Read-only Financial & Occupancy Reports</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-white block">System Security Details</span>
                <div className="space-y-1 text-slate-400">
                  <p>Authentication: <strong className="text-slate-200">JWT Token Active</strong></p>
                  <p>Database: <strong className="text-slate-200">MySQL 8.0 Encrypted</strong></p>
                  <p>Hotel Location: <strong className="text-slate-200">Bole Sub-City, Addis Ababa</strong></p>
                  <p>Role Scope: <strong className="text-emerald-400">Operations Management</strong></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── MODALS ────────────────── */}

      {/* Booking Details Modal */}
      <Modal
        open={!!selectedBooking}
        title={selectedBooking ? `Booking Details #${selectedBooking.booking_reference}` : ''}
        onClose={() => setSelectedBooking(null)}
      >
        {selectedBooking && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Guest:</span>
                <span className="font-bold text-white">{selectedBooking.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="text-slate-200">{selectedBooking.customer_email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Room:</span>
                <span className="font-bold text-amber-400">#{selectedBooking.room_number} ({selectedBooking.room_type_name})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Stay Period:</span>
                <span className="font-mono text-slate-200">{selectedBooking.check_in_date?.split('T')[0]} &rarr; {selectedBooking.check_out_date?.split('T')[0]} ({selectedBooking.nights_count}N)</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2 font-bold text-sm">
                <span className="text-slate-300">Total Billed:</span>
                <span className="text-amber-400 font-mono">ETB {Number(selectedBooking.total_amount).toLocaleString()}</span>
              </div>
            </div>
            <div className="flex justify-end">
              <Btn variant="secondary" size="sm" onClick={() => setSelectedBooking(null)}>
                Close
              </Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Maintenance Modal */}
      <Modal
        open={showMaintModal}
        title="Create Maintenance Alert"
        onClose={() => setShowMaintModal(false)}
      >
        <form onSubmit={handleCreateMaintenance} className="space-y-4 text-xs">
          <Field label="Target Room">
            <Select value={maintRoomId} onChange={e => setMaintRoomId(Number(e.target.value))}>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>
                  Room #{r.room_number} - {r.room_type_name} (Floor {r.floor_number})
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Issue Title">
            <Input
              placeholder="e.g. AC cooling malfunction, shower valve leak"
              value={maintTitle}
              onChange={e => setMaintTitle(e.target.value)}
              required
            />
          </Field>

          <Field label="Description">
            <Textarea
              placeholder="Describe the issue, location inside the room, and technician safety notes..."
              value={maintDesc}
              onChange={e => setMaintDesc(e.target.value)}
              rows={3}
              required
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Priority Level">
              <Select value={maintPriority} onChange={e => setMaintPriority(e.target.value as any)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical / Urgent</option>
              </Select>
            </Field>

            <Field label="Estimated Cost (ETB)">
              <Input
                type="number"
                value={maintCost}
                onChange={e => setMaintCost(Number(e.target.value))}
              />
            </Field>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="secondary" size="sm" onClick={() => setShowMaintModal(false)} type="button">
              Cancel
            </Btn>
            <Btn variant="primary" size="sm" type="submit">
              Submit Maintenance Alert
            </Btn>
          </div>
        </form>
      </Modal>

      {/* Housekeeping Task Modal */}
      <Modal
        open={showTaskModal}
        title="Assign Housekeeping Task"
        onClose={() => setShowTaskModal(false)}
      >
        <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
          <Field label="Target Room">
            <Select value={taskRoomId} onChange={e => setTaskRoomId(Number(e.target.value))}>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>
                  Room #{r.room_number} - {r.room_type_name} (Status: {r.status})
                </option>
              ))}
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Task Type">
              <Select value={taskType} onChange={e => setTaskType(e.target.value as any)}>
                <option value="standard_clean">Standard Clean</option>
                <option value="deep_clean">Deep Clean / Turnover</option>
                <option value="inspection">Room Inspection</option>
                <option value="sanitization">Sanitization</option>
                <option value="turn_down">Evening Turn-Down</option>
              </Select>
            </Field>

            <Field label="Priority">
              <Select value={taskPriority} onChange={e => setTaskPriority(e.target.value as any)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </Select>
            </Field>
          </div>

          <Field label="Special Instructions">
            <Textarea
              placeholder="Specific instructions for housekeeping attendant (e.g. fresh linens, extra Ethiopian coffee setup)..."
              value={taskInstructions}
              onChange={e => setTaskInstructions(e.target.value)}
              rows={3}
            />
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="secondary" size="sm" onClick={() => setShowTaskModal(false)} type="button">
              Cancel
            </Btn>
            <Btn variant="primary" size="sm" type="submit">
              Assign Task
            </Btn>
          </div>
        </form>
      </Modal>

      {/* Resolve Complaint Modal */}
      <Modal
        open={!!resolvingComplaint}
        title={resolvingComplaint ? `Resolve Complaint #${resolvingComplaint.id}` : ''}
        onClose={() => setResolvingComplaint(null)}
      >
        {resolvingComplaint && (
          <form onSubmit={handleResolveComplaint} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="font-bold text-white block mb-1">{resolvingComplaint.title}</span>
              <p className="text-slate-300 italic">"{resolvingComplaint.description}"</p>
            </div>

            <Field label="Resolution Notes & Compensations">
              <Textarea
                placeholder="Explain the resolution provided to the guest (e.g. complimentary airport shuttle, room upgrade, direct apology)..."
                value={resolutionNotes}
                onChange={e => setResolutionNotes(e.target.value)}
                rows={4}
                required
              />
            </Field>

            <div className="flex justify-end gap-2 pt-2">
              <Btn variant="secondary" size="sm" onClick={() => setResolvingComplaint(null)} type="button">
                Cancel
              </Btn>
              <Btn variant="primary" size="sm" type="submit">
                Confirm Resolution
              </Btn>
            </div>
          </form>
        )}
      </Modal>
    </DashboardLayout>
  );
};
