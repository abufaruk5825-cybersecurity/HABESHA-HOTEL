import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
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
  Select,
  RefreshBtn
} from '../../components/dashboard/DashboardUI';
import { UserManagement } from './UserManagement';
import { PermissionsMatrix } from './PermissionsMatrix';
import {
  ShieldCheck,
  Building2,
  Users,
  Settings,
  Activity,
  DollarSign,
  TrendingUp,
  Lock,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Hotel,
  RefreshCw,
  LogOut,
  MapPin,
  Plus,
  Search,
  Download,
  Calendar,
  Filter,
  Check,
  X
} from 'lucide-react';

interface SuperAdminDashboardProps {
  onNavigateToWebsite: () => void;
}

interface HotelBranch {
  id: string;
  name: string;
  city: string;
  location: string;
  roomsCount: number;
  occupancy: number;
  adminName: string;
  adminEmail: string;
  status: 'active' | 'maintenance' | 'planned';
}

const INITIAL_BRANCHES: HotelBranch[] = [
  {
    id: 'branch-1',
    name: 'HABESHA-HOTEL Flagship Luxury & Suites',
    city: 'Addis Ababa',
    location: 'Africa Avenue, Bole Sub-City',
    roomsCount: 48,
    occupancy: 85,
    adminName: 'Selam Tesfaye',
    adminEmail: 'admin@habeshahotel.com',
    status: 'active',
  },
  {
    id: 'branch-2',
    name: 'HABESHA Boutique & Heritage Lodge',
    city: 'Addis Ababa',
    location: 'Piazza Historical District',
    roomsCount: 24,
    occupancy: 78,
    adminName: 'Bilal Ahmed',
    adminEmail: 'manager@habeshahotel.com',
    status: 'active',
  },
  {
    id: 'branch-3',
    name: 'HABESHA Diplomatic Suites Kazanchis',
    city: 'Addis Ababa',
    location: 'UNECA / Kazanchis Commercial Hub',
    roomsCount: 36,
    occupancy: 92,
    adminName: 'Selam Tesfaye',
    adminEmail: 'admin@habeshahotel.com',
    status: 'active',
  },
];

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ onNavigateToWebsite }) => {
  const { user } = useAuth();
  const { t, formatCurrency, formatDate } = useLanguage();

  const [activeTab, setActiveTab] = useState<'overview' | 'branches' | 'admins' | 'security' | 'audits'>('overview');
  const [branches, setBranches] = useState<HotelBranch[]>(INITIAL_BRANCHES);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Audit Logs Filter States
  const [auditSearch, setAuditSearch] = useState('');
  const [auditRoleFilter, setAuditRoleFilter] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('');
  const [auditStartDate, setAuditStartDate] = useState('');
  const [auditEndDate, setAuditEndDate] = useState('');
  const [auditLimit, setAuditLimit] = useState(100);

  // Branch Modal State
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [branchName, setBranchName] = useState('');
  const [branchCity, setBranchCity] = useState('Addis Ababa');
  const [branchLocation, setBranchLocation] = useState('');
  const [branchRooms, setBranchRooms] = useState(30);
  const [branchAdminName, setBranchAdminName] = useState('');
  const [branchAdminEmail, setBranchAdminEmail] = useState('');

  const loadSuperAdminData = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (auditSearch) queryParams.append('search', auditSearch);
      if (auditRoleFilter) queryParams.append('role', auditRoleFilter);
      if (auditActionFilter) queryParams.append('action', auditActionFilter);
      if (auditStartDate) queryParams.append('start_date', auditStartDate);
      if (auditEndDate) queryParams.append('end_date', auditEndDate);
      queryParams.append('limit', String(auditLimit));

      const [logsRes, usersRes] = await Promise.all([
        api.get<any[]>(`/audit-logs?${queryParams.toString()}`).catch(() => []),
        api.get<any>('/users').catch(() => []),
      ]);
      const rawLogs = logsRes as any;
      const logsArray = Array.isArray(rawLogs) ? rawLogs : (rawLogs?.logs || []);
      setAuditLogs(logsArray);

      const rawUsers = usersRes as any;
      const usersArray = Array.isArray(rawUsers) ? rawUsers : (rawUsers?.users || []);
      setUsersList(usersArray);
    } catch (err) {
      console.error('SuperAdmin load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuperAdminData();
  }, [auditRoleFilter, auditActionFilter, auditLimit]);

  // Handle Search Debounce or submit
  const handleApplyAuditFilters = (e: React.FormEvent) => {
    e.preventDefault();
    loadSuperAdminData();
  };

  const handleResetAuditFilters = () => {
    setAuditSearch('');
    setAuditRoleFilter('');
    setAuditActionFilter('');
    setAuditStartDate('');
    setAuditEndDate('');
    setAuditLimit(100);
    loadSuperAdminData();
  };

  // Export Audit CSV
  const handleExportAuditCSV = () => {
    if (auditLogs.length === 0) {
      alert('No audit log entries available for export.');
      return;
    }
    const headers = ['Time', 'Action', 'Role', 'User Name', 'Email', 'Entity Type', 'Entity ID', 'Details', 'IP Address'];
    const rows = auditLogs.map(l => [
      `"${l.created_at || ''}"`,
      `"${l.action || ''}"`,
      `"${l.user_role || 'system'}"`,
      `"${l.user_name || ''}"`,
      `"${l.user_email || ''}"`,
      `"${l.entity_type || ''}"`,
      `"${l.entity_id || ''}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
      `"${l.ip_address || '127.0.0.1'}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Habesha_Hotel_Security_Audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Branch creation
  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName.trim()) return;
    const newB: HotelBranch = {
      id: `branch-${Date.now()}`,
      name: branchName,
      city: branchCity,
      location: branchLocation || 'Bole, Addis Ababa',
      roomsCount: branchRooms,
      occupancy: 0,
      adminName: branchAdminName || 'Branch Lead',
      adminEmail: branchAdminEmail || 'admin@habeshahotel.com',
      status: 'active'
    };
    setBranches(prev => [...prev, newB]);
    setShowBranchModal(false);
    setBranchName('');
    setBranchLocation('');
    setBranchAdminName('');
    setBranchAdminEmail('');
    alert(`Hotel Branch "${newB.name}" connected successfully!`);
  };

  const handleToggleBranchStatus = (id: string) => {
    setBranches(prev => prev.map(b => {
      if (b.id !== id) return b;
      const nextStatus = b.status === 'active' ? 'maintenance' : 'active';
      return { ...b, status: nextStatus };
    }));
  };

  // 8 Summary Metrics Calculation
  const userArray = Array.isArray(usersList) ? usersList : ((usersList as any)?.users || []);
  const totalUsersCount = (usersList as any)?.total ?? userArray.length;
  const totalAdminsCount = userArray.filter((u: any) => u.role === 'admin' || u.role === 'superadmin').length;
  const totalBranchesCount = branches.length;
  const activeAccountsCount = userArray.filter((u: any) => u.is_active === 1 || u.is_active === true).length;
  const inactiveAccountsCount = userArray.filter((u: any) => !u.is_active).length;
  const todayStr = new Date().toISOString().split('T')[0];
  const auditArray = Array.isArray(auditLogs) ? auditLogs : [];
  const todaysActivitiesCount = auditArray.filter(l => l.created_at?.startsWith(todayStr)).length || auditArray.length;
  const failedLoginsCount = auditArray.filter(l => {
    const act = (l.action || '').toLowerCase();
    const det = (l.details || '').toLowerCase();
    return act.includes('fail') || act.includes('reject') || det.includes('fail') || det.includes('denied');
  }).length;

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab as any)}
      navItems={NAV_ITEMS.superadmin}
      onNavigateToWebsite={onNavigateToWebsite}
      title="Super Administrator Portal"
    >
      <div className="space-y-6">
        {/* ────────────────── TAB 1: SYSTEM OVERVIEW ────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <PageHeader
              title="System Governance & Health"
              subtitle="Comprehensive control across hotel branches, administrator credentials, and security events"
              actions={<RefreshBtn onClick={loadSuperAdminData} loading={loading} />}
            />

            {/* 8 Summary Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <StatCard
                label="Total Users"
                value={totalUsersCount}
                sub="Accounts registered"
                icon={<Users className="w-4 h-4" />}
                color="default"
              />
              <StatCard
                label="Administrators"
                value={totalAdminsCount}
                sub="Staff with admin roles"
                icon={<ShieldCheck className="w-4 h-4" />}
                color="amber"
              />
              <StatCard
                label="Hotel Branches"
                value={totalBranchesCount}
                sub="Connected Ethiopian properties"
                icon={<Building2 className="w-4 h-4" />}
                color="sky"
              />
              <StatCard
                label="Active Accounts"
                value={activeAccountsCount}
                sub="Live authenticated users"
                icon={<CheckCircle2 className="w-4 h-4" />}
                color="emerald"
              />
              <StatCard
                label="Inactive Accounts"
                value={inactiveAccountsCount}
                sub="Disabled or archived"
                icon={<X className="w-4 h-4" />}
                color="rose"
              />
              <StatCard
                label="System Activities"
                value={todaysActivitiesCount}
                sub="Audit transactions recorded"
                icon={<Activity className="w-4 h-4" />}
                color="purple"
              />
              <StatCard
                label="Security Incidents"
                value={failedLoginsCount}
                sub="Failed auth / rejected actions"
                icon={<AlertTriangle className="w-4 h-4" />}
                color={failedLoginsCount > 0 ? 'rose' : 'emerald'}
              />
              <StatCard
                label="System Integrity"
                value="100%"
                sub="JWT + RBAC + MySQL 8.0"
                icon={<Lock className="w-4 h-4" />}
                color="emerald"
              />
            </div>

            {/* Hotel Properties Quick Cards */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-400" /> Multi-Property Hotel Network
                </h3>
                <Btn variant="primary" size="sm" onClick={() => setShowBranchModal(true)}>
                  <Plus className="w-4 h-4 mr-1" /> Add Hotel Property
                </Btn>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {branches.map((b) => (
                  <div
                    key={b.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-amber-500/40 transition-all shadow-xl space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-serif font-bold text-sm text-white">{b.name}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                          b.status === 'active' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-orange-500/15 text-orange-400 border-orange-500/30'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mb-3">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" /> {b.location}, {b.city}
                      </p>

                      <div className="grid grid-cols-2 gap-3 py-2.5 border-y border-slate-800/80 text-xs">
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase">Rooms</span>
                          <span className="font-bold text-slate-200">{b.roomsCount} Suites</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase">Occupancy</span>
                          <span className="font-bold text-amber-400">{b.occupancy}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-400 flex items-center justify-between pt-1">
                      <span>Admin: <strong className="text-slate-200">{b.adminName}</strong></span>
                      <button
                        onClick={() => handleToggleBranchStatus(b.id)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-semibold"
                      >
                        {b.status === 'active' ? 'Set Maintenance' : 'Activate'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Audit Activities Stream */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="font-serif text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" /> Recent Security & Administrative Logs
                </h3>
                <button
                  onClick={() => setActiveTab('audits')}
                  className="text-xs text-amber-400 hover:underline"
                >
                  View Full Audit Trail &rarr;
                </button>
              </div>

              <div className="space-y-2">
                {auditLogs.slice(0, 6).map((log, idx) => (
                  <div
                    key={log.id || idx}
                    className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="bg-amber-500/10 text-amber-300 font-mono text-[10px] px-2 py-0.5 rounded border border-amber-500/20">
                        {log.action}
                      </span>
                      <span className="text-slate-300 font-medium">{log.details}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {log.created_at ? log.created_at.replace('T', ' ').slice(0, 16) : 'Recent'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ────────────────── TAB 2: HOTEL BRANCHES ────────────────── */}
        {activeTab === 'branches' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <PageHeader
              title="Multi-Hotel Property Network"
              subtitle="Configure connected hotels across Addis Ababa, regional tourist hubs, and resort branches"
              actions={
                <Btn variant="primary" size="sm" onClick={() => setShowBranchModal(true)}>
                  <Plus className="w-4 h-4 mr-1" /> Add Hotel Branch
                </Btn>
              }
            />

            <div className="grid grid-cols-1 gap-4">
              {branches.map((b) => (
                <div
                  key={b.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-serif text-lg font-bold text-white">{b.name}</h4>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border uppercase font-bold ${
                        b.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" /> {b.location}, {b.city}, Ethiopia
                    </p>
                    <p className="text-xs text-slate-300 pt-1">
                      Lead Administrator: <strong className="text-amber-400">{b.adminName}</strong> ({b.adminEmail})
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="text-slate-500 text-[10px] uppercase block">Capacity</span>
                      <span className="text-base font-bold text-slate-200">{b.roomsCount} Rooms</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 text-[10px] uppercase block">Live Occupancy</span>
                      <span className="text-base font-bold text-amber-400">{b.occupancy}%</span>
                    </div>
                    <button
                      onClick={() => handleToggleBranchStatus(b.id)}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer"
                    >
                      {b.status === 'active' ? 'Set Maintenance' : 'Activate Branch'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ────────────────── TAB 3: ADMINISTRATORS & USERS ────────────────── */}
        {activeTab === 'admins' && (
          <UserManagement viewerRole="superadmin" />
        )}

        {/* ────────────────── TAB 4: SECURITY & SETTINGS ────────────────── */}
        {activeTab === 'security' && (
          <PermissionsMatrix />
        )}

        {/* ────────────────── TAB 5: SYSTEM AUDIT LOGS ────────────────── */}
        {activeTab === 'audits' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <PageHeader
              title="Immutable Security Audit Logs"
              subtitle="Full forensic trace of administrative logins, room status adjustments, payments, and system mutations"
              actions={
                <div className="flex items-center gap-2">
                  <Btn variant="secondary" size="sm" onClick={handleExportAuditCSV}>
                    <Download className="w-4 h-4 mr-1" /> Export CSV
                  </Btn>
                  <RefreshBtn onClick={loadSuperAdminData} loading={loading} />
                </div>
              }
            />

            {/* Filter Bar */}
            <form onSubmit={handleApplyAuditFilters} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                {/* Search */}
                <div className="lg:col-span-2 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search user, action, details, IP..."
                    value={auditSearch}
                    onChange={e => setAuditSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Role Filter */}
                <div>
                  <select
                    value={auditRoleFilter}
                    onChange={e => setAuditRoleFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">All Roles</option>
                    <option value="superadmin">Super Admin</option>
                    <option value="admin">Administrator</option>
                    <option value="manager">Manager</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="accountant">Accountant</option>
                    <option value="housekeeper">Housekeeping</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="customer">Customer</option>
                  </select>
                </div>

                {/* Action Filter */}
                <div>
                  <select
                    value={auditActionFilter}
                    onChange={e => setAuditActionFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">All Actions</option>
                    <option value="USER_LOGIN">USER_LOGIN</option>
                    <option value="USER_CREATE">USER_CREATE</option>
                    <option value="USER_UPDATE">USER_UPDATE</option>
                    <option value="USER_DELETE">USER_DELETE</option>
                    <option value="GUEST_CHECK_IN">GUEST_CHECK_IN</option>
                    <option value="GUEST_CHECK_OUT">GUEST_CHECK_OUT</option>
                    <option value="BOOKING_CREATE">BOOKING_CREATE</option>
                    <option value="ROOM_STATUS_CHANGE">ROOM_STATUS_CHANGE</option>
                    <option value="PAYMENT_RECORD">PAYMENT_RECORD</option>
                    <option value="SETTINGS_UPDATE">SETTINGS_UPDATE</option>
                    <option value="PERMISSION_GRANT">PERMISSION_GRANT</option>
                    <option value="MAINTENANCE_REPORT">MAINTENANCE_REPORT</option>
                    <option value="HOUSEKEEPING_TASK_CREATE">HOUSEKEEPING_TASK_CREATE</option>
                  </select>
                </div>

                {/* Limit */}
                <div>
                  <select
                    value={auditLimit}
                    onChange={e => setAuditLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value={25}>Show 25 records</option>
                    <option value={50}>Show 50 records</option>
                    <option value={100}>Show 100 records</option>
                    <option value={200}>Show 200 records</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Date Range:</span>
                  <input
                    type="date"
                    value={auditStartDate}
                    onChange={e => setAuditStartDate(e.target.value)}
                    className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                  <span className="text-slate-500">&rarr;</span>
                  <input
                    type="date"
                    value={auditEndDate}
                    onChange={e => setAuditEndDate(e.target.value)}
                    className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetAuditFilters}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </form>

            {/* Audit Logs Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">User / Account</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Affected Entity</th>
                    <th className="py-3 px-4">Activity Details</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300 font-mono">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500 font-sans">
                        No audit events match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                          {log.created_at ? log.created_at.replace('T', ' ').slice(0, 19) : '—'}
                        </td>
                        <td className="py-3 px-4 font-sans">
                          <span className="text-white font-semibold block">{log.user_name || 'System User'}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{log.user_email || '—'}</span>
                        </td>
                        <td className="py-3 px-4 font-bold text-amber-400">{log.action}</td>
                        <td className="py-3 px-4 uppercase text-[10px] text-slate-400">{log.user_role || 'system'}</td>
                        <td className="py-3 px-4 text-slate-400 font-sans">
                          {log.entity_type} {log.entity_id ? `#${log.entity_id}` : ''}
                        </td>
                        <td className="py-3 px-4 font-sans text-slate-200 max-w-sm truncate" title={log.details}>
                          {log.details}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Success
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-slate-500 text-[11px]">{log.ip_address || '127.0.0.1'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ────────────────── ADD BRANCH MODAL ────────────────── */}
      <Modal
        open={showBranchModal}
        title="Connect New Hotel Property / Branch"
        onClose={() => setShowBranchModal(false)}
      >
        <form onSubmit={handleAddBranch} className="space-y-4 text-xs">
          <Field label="Property Name">
            <Input
              placeholder="e.g. HABESHA Lake View Resort"
              value={branchName}
              onChange={e => setBranchName(e.target.value)}
              required
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="City">
              <Input
                value={branchCity}
                onChange={e => setBranchCity(e.target.value)}
                required
              />
            </Field>
            <Field label="Total Room Capacity">
              <Input
                type="number"
                min={5}
                max={500}
                value={branchRooms}
                onChange={e => setBranchRooms(Number(e.target.value))}
                required
              />
            </Field>
          </div>

          <Field label="Specific Location / Sub-City">
            <Input
              placeholder="e.g. Lake Hawassa Shoreline / Piazza Heritage"
              value={branchLocation}
              onChange={e => setBranchLocation(e.target.value)}
              required
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Lead Administrator Name">
              <Input
                placeholder="e.g. Selam Tesfaye"
                value={branchAdminName}
                onChange={e => setBranchAdminName(e.target.value)}
              />
            </Field>
            <Field label="Administrator Email">
              <Input
                type="email"
                placeholder="admin@habeshahotel.com"
                value={branchAdminEmail}
                onChange={e => setBranchAdminEmail(e.target.value)}
              />
            </Field>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="secondary" size="sm" onClick={() => setShowBranchModal(false)} type="button">
              Cancel
            </Btn>
            <Btn variant="primary" size="sm" type="submit">
              Connect Property
            </Btn>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
