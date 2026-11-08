import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { MaintenanceRequest, Room, Employee } from '../../types';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import {
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  ShieldAlert,
  Sparkles,
  Filter,
  RefreshCw,
  Search,
  UserCheck,
  Building,
  FileText,
  Hammer,
  Package,
  Layers,
  ChevronRight,
  Eye,
  Check,
  X,
  ExternalLink
} from 'lucide-react';

interface MaintenanceDashboardProps { onNavigateToWebsite: () => void; }

interface EquipmentAsset {
  id: string;
  name: string;
  category: string;
  location: string;
  condition: 'operational' | 'service_due' | 'needs_repair' | 'critical';
  lastService: string;
  nextInspection: string;
  technician: string;
}

export const MaintenanceDashboard: React.FC<MaintenanceDashboardProps> = ({ onNavigateToWebsite }) => {
  const { user } = useAuth();
  const { formatCurrency, formatDate } = useLanguage();

  const [activeTab, setActiveTab] = useState<'requests' | 'assigned' | 'equipment' | 'history'>('requests');
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [technicians, setTechnicians] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [floorFilter, setFloorFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // New ticket modal state
  const [showModal, setShowModal] = useState(false);
  const [roomId, setRoomId] = useState<number>(1);
  const [repairCategory, setRepairCategory] = useState('HVAC & Air Conditioning');
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDesc, setIssueDesc] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [assignedTo, setAssignedTo] = useState<number | undefined>(undefined);
  const [imageUrl, setImageUrl] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);

  // Manage Request Modal State
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [manageStatus, setManageStatus] = useState<string>('in_progress');
  const [manageTechnicianId, setManageTechnicianId] = useState<number | undefined>(undefined);
  const [manageActualCost, setManageActualCost] = useState<string>('');
  const [manageNotes, setManageNotes] = useState<string>('');
  const [updatingRequest, setUpdatingRequest] = useState(false);

  // Hotel Plant & Equipment (Live State)
  const [equipmentList] = useState<EquipmentAsset[]>([
    {
      id: 'EQ-CHILLER-01',
      name: 'Daikin Central Chiller & Heat Exchanger',
      category: 'HVAC & Climate Control',
      location: 'Rooftop Utility Deck',
      condition: 'operational',
      lastService: '2026-10-15',
      nextInspection: '2026-11-20',
      technician: 'Sumeya Ahmed (Chief Engineer)',
    },
    {
      id: 'EQ-BOILER-02',
      name: 'High-Pressure Dual Steam Boilers (Hot Water)',
      category: 'Plumbing & Steam',
      location: 'Basement Mechanical Room',
      condition: 'operational',
      lastService: '2026-09-30',
      nextInspection: '2026-11-30',
      technician: 'Dawit Bekele (Plumbing Specialist)',
    },
    {
      id: 'EQ-GEN-03',
      name: 'Cummins 500kVA Standby Diesel Generator',
      category: 'Electrical & Backup Power',
      location: 'East Wing Power Annex',
      condition: 'operational',
      lastService: '2026-10-28',
      nextInspection: '2026-11-28',
      technician: 'Yared Hailu (Electrical Engineer)',
    },
    {
      id: 'EQ-ELEV-01',
      name: 'Otis Panoramic Guest Elevator Bank (Car A & B)',
      category: 'Vertical Transport & Lifts',
      location: 'Central Lobby Atrium',
      condition: 'service_due',
      lastService: '2026-08-10',
      nextInspection: '2026-11-10',
      technician: 'Sumeya Ahmed (Chief Engineer)',
    },
    {
      id: 'EQ-WATER-04',
      name: 'Reverse Osmosis & UV Drinking Water Purification',
      category: 'Water Filtration',
      location: 'Ground Floor Plant Room',
      condition: 'operational',
      lastService: '2026-10-01',
      nextInspection: '2026-12-01',
      technician: 'Dawit Bekele (Plumbing Specialist)',
    },
    {
      id: 'EQ-LAUNDRY-05',
      name: 'Electrolux Industrial Steam Dryers & Ironers',
      category: 'Housekeeping & Laundry',
      location: 'Basement Laundry Bay',
      condition: 'needs_repair',
      lastService: '2026-09-12',
      nextInspection: '2026-11-12',
      technician: 'Yared Hailu (Electrical Engineer)',
    },
  ]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mRes, rRes, eRes] = await Promise.all([
        api.get<MaintenanceRequest[]>('/maintenance').catch(() => []),
        api.get<Room[]>('/rooms').catch(() => []),
        api.get<Employee[]>('/employees').catch(() => []),
      ]);
      setRequests(mRes || []);
      setRooms(rRes || []);
      setTechnicians((eRes || []).filter(e =>
        e.department_id === 4 ||
        e.position?.toLowerCase().includes('technician') ||
        e.position?.toLowerCase().includes('engineer') ||
        e.position?.toLowerCase().includes('maintenance')
      ));
      if (rRes && rRes.length > 0 && !roomId) {
        setRoomId(rRes[0].id);
      }
    } catch (err) {
      console.error('Failed to load maintenance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingTicket(true);
    try {
      await api.post('/maintenance', {
        room_id: roomId,
        issue_title: `[${repairCategory}] ${issueTitle}`,
        description: `${issueDesc}${imageUrl ? ` [Attachment: ${imageUrl}]` : ''}`,
        priority,
        technician_id: assignedTo,
      });
      setShowModal(false);
      setIssueTitle('');
      setIssueDesc('');
      setImageUrl('');
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to submit maintenance ticket');
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleOpenManageModal = (req: MaintenanceRequest) => {
    setSelectedRequest(req);
    setManageStatus(req.status || 'in_progress');
    setManageTechnicianId(req.technician_id || undefined);
    setManageActualCost(req.actual_cost ? String(req.actual_cost) : '');
    setManageNotes(req.resolution_notes || '');
    setShowManageModal(true);
  };

  const handleAcceptTask = async (req: MaintenanceRequest) => {
    try {
      // Find logged in user's employee record if any
      const matchingTech = technicians.find(t => t.user_id === user?.id);
      await api.patch(`/maintenance/${req.id}`, {
        status: 'in_progress',
        technician_id: matchingTech ? matchingTech.id : undefined,
        resolution_notes: `Task accepted by ${user?.full_name || 'Staff'}. Work commenced.`,
      });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to accept task');
    }
  };

  const handleUpdateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    setUpdatingRequest(true);
    try {
      await api.patch(`/maintenance/${selectedRequest.id}`, {
        status: manageStatus,
        technician_id: manageTechnicianId,
        actual_cost: manageActualCost ? Number(manageActualCost) : undefined,
        resolution_notes: manageNotes || undefined,
      });
      setShowManageModal(false);
      setSelectedRequest(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update maintenance request');
    } finally {
      setUpdatingRequest(false);
    }
  };

  const handleResolveTicket = async (id: number) => {
    try {
      await api.patch(`/maintenance/${id}`, {
        status: 'resolved',
        resolution_notes: `Resolved and cleared for occupancy by ${user?.full_name || 'Engineering'}`,
      });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to resolve ticket');
    }
  };

  // KPI Stats
  const totalTicketsCount = requests.length;
  const urgentCount = requests.filter(r => (r.priority === 'critical' || r.priority === 'high') && r.status !== 'resolved' && r.status !== 'closed').length;
  const inProgressCount = requests.filter(r => r.status === 'in_progress' || r.status === 'assigned' || r.status === 'waiting_parts').length;
  const pendingCount = requests.filter(r => r.status === 'reported' || r.status === 'pending').length;
  const resolvedCount = requests.filter(r => r.status === 'resolved' || r.status === 'closed').length;

  // Filter requests
  const filteredRequests = requests.filter(r => {
    // Search query
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      `#mnt-${r.id}`.includes(q) ||
      `mnt-${r.id}`.includes(q) ||
      r.id.toString().includes(q) ||
      r.room_number?.toLowerCase().includes(q) ||
      r.issue_title?.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q) ||
      r.technician_name?.toLowerCase().includes(q);

    // Status filter
    let matchStatus = true;
    if (statusFilter === 'reported') matchStatus = r.status === 'reported' || r.status === 'pending';
    else if (statusFilter === 'in_progress') matchStatus = r.status === 'in_progress' || r.status === 'assigned' || r.status === 'waiting_parts';
    else if (statusFilter === 'resolved') matchStatus = r.status === 'resolved' || r.status === 'closed';
    else if (statusFilter !== 'all') matchStatus = r.status === statusFilter;

    // Priority filter
    const matchPriority = priorityFilter === 'all' || r.priority === priorityFilter;

    // Floor filter
    const matchFloor = floorFilter === 'all' || (r.floor_number && String(r.floor_number) === floorFilter);

    // Tab filter: "assigned to me"
    let matchTab = true;
    if (activeTab === 'assigned') {
      const isAssigned = r.technician_name?.toLowerCase().includes(user?.full_name?.toLowerCase() || '') ||
                         (user?.email && r.technician_name?.toLowerCase().includes(user.email.toLowerCase()));
      matchTab = isAssigned || r.technician_id === user?.id;
    } else if (activeTab === 'history') {
      matchTab = r.status === 'resolved' || r.status === 'closed';
    }

    return matchSearch && matchStatus && matchPriority && matchFloor && matchTab;
  });

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'critical':
      case 'urgent':
        return 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold';
      case 'high':
        return 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold';
      case 'medium':
        return 'bg-sky-500/20 text-sky-300 border border-sky-500/40';
      default:
        return 'bg-slate-800 text-slate-400 border border-slate-700';
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'resolved':
      case 'closed':
        return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
      case 'in_progress':
        return 'bg-sky-500/20 text-sky-300 border border-sky-500/30';
      case 'assigned':
        return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
      case 'waiting_parts':
        return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
      default:
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    }
  };

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab as any)}
      navItems={[
        { id: 'requests', label: `Work Orders (${requests.length})`, icon: <Wrench className="w-4 h-4" /> },
        { id: 'assigned', label: 'Assigned to Me',                  icon: <UserCheck className="w-4 h-4" /> },
        { id: 'equipment',label: 'Equipment & Plant',               icon: <Package className="w-4 h-4" /> },
        { id: 'history',  label: 'Repair History',                  icon: <Clock className="w-4 h-4" /> },
      ]}
      onNavigateToWebsite={onNavigateToWebsite}
      title="Hotel Maintenance"
    >
      <div className="space-y-8 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <img
                src="/images/logo-hotel.png"
                alt="HABESHA-HOTEL"
                onError={e => { (e.currentTarget as HTMLImageElement).src = '/images/logo-hotel.png'; }}
                className="w-11 h-11 object-contain rounded-xl border border-amber-500/30 shadow-md"
              />
              <div>
                <h1 className="text-2xl font-serif font-bold text-slate-100">Hotel Repairs & Maintenance</h1>
                <p className="text-xs text-slate-400">Track room repairs, electrical, plumbing, air conditioning, and equipment engineering</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg flex items-center gap-2 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Report Room Repair</span>
            </button>
          </div>
        </div>

        {/* 5 Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider text-[10px]">
              <span>Total Tickets</span>
              <Wrench className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold font-serif text-slate-100 mt-2">{totalTicketsCount}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Across all 5 floors</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between text-rose-400 text-xs font-semibold uppercase tracking-wider text-[10px]">
              <span>Urgent / High</span>
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-bold font-serif text-rose-400 mt-2">{urgentCount}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Immediate priority</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between text-sky-400 text-xs font-semibold uppercase tracking-wider text-[10px]">
              <span>In Repair</span>
              <Hammer className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-bold font-serif text-sky-400 mt-2">{inProgressCount}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Technician active</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between text-amber-400 text-xs font-semibold uppercase tracking-wider text-[10px]">
              <span>Pending</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-serif text-amber-400 mt-2">{pendingCount}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Awaiting assignment</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold uppercase tracking-wider text-[10px]">
              <span>Resolved</span>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-serif text-emerald-400 mt-2">{resolvedCount}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Cleared for guests</div>
          </div>
        </div>

        {/* ===================== TAB: EQUIPMENT & PLANT ===================== */}
        {activeTab === 'equipment' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-400" />
                  <span>Hotel Equipment & Infrastructure Assets</span>
                </h3>
                <p className="text-xs text-slate-400">Continuous condition monitoring, preventive maintenance schedules, and engineering logs</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {equipmentList.map(eq => (
                <div key={eq.id} className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded font-bold">
                        {eq.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          eq.condition === 'operational'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : eq.condition === 'service_due'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {eq.condition.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 className="font-serif font-bold text-base text-white">{eq.name}</h4>
                    <p className="text-xs text-slate-400 mt-1">{eq.category}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <Building className="w-3 h-3 text-slate-400" /> Location: {eq.location}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Last Overhaul:</span>
                      <span className="font-semibold text-slate-200">{formatDate(eq.lastService)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Next Scheduled Inspection:</span>
                      <span className="font-semibold text-amber-400">{formatDate(eq.nextInspection)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-800 pt-1.5">
                      <span className="text-slate-400">Lead Specialist:</span>
                      <span className="font-medium text-slate-300">{eq.technician}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIssueTitle(`Preventive inspection for ${eq.name}`);
                      setIssueDesc(`Scheduled service inspection for asset ${eq.id} located at ${eq.location}.`);
                      setRepairCategory(eq.category);
                      setShowModal(true);
                    }}
                    className="w-full py-2 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 hover:font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Log Maintenance Activity</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== TABS: REQUESTS / ASSIGNED / HISTORY ===================== */}
        {activeTab !== 'equipment' && (
          <div className="space-y-6">
            {/* Search and Filters Bar ABOVE table */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search tickets by ID, room #, issue title, or technician..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5 text-xs">
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-300 focus:outline-none focus:border-amber-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="reported">Pending / Reported</option>
                  <option value="in_progress">In Repair</option>
                  <option value="resolved">Resolved / Closed</option>
                </select>

                {/* Priority Filter */}
                <select
                  value={priorityFilter}
                  onChange={e => setPriorityFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-300 focus:outline-none focus:border-amber-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="critical">Critical / Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                {/* Floor Filter */}
                <select
                  value={floorFilter}
                  onChange={e => setFloorFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-300 focus:outline-none focus:border-amber-500"
                >
                  <option value="all">All Floors</option>
                  <option value="1">Floor 1</option>
                  <option value="2">Floor 2</option>
                  <option value="3">Floor 3</option>
                  <option value="4">Floor 4</option>
                  <option value="5">Floor 5</option>
                </select>
              </div>
            </div>

            {/* Tickets Table / List */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  <span>
                    {activeTab === 'assigned'
                      ? `Tasks Assigned to Me (${filteredRequests.length})`
                      : activeTab === 'history'
                      ? `Completed Repair History (${filteredRequests.length})`
                      : `Active Maintenance Requests (${filteredRequests.length})`}
                  </span>
                </h2>
                <span className="text-[11px] text-slate-500">Live Engineering Log</span>
              </div>

              {loading ? (
                <div className="p-12 text-center text-slate-500 text-xs">Loading maintenance records...</div>
              ) : filteredRequests.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-xs">
                  No maintenance requests found matching your current filter.
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {filteredRequests.map(r => (
                    <div
                      key={r.id}
                      onClick={() => handleOpenManageModal(r)}
                      className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-950 text-amber-400 border border-slate-800">
                            #MNT-{r.id}
                          </span>
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-white border border-slate-700">
                            Room #{r.room_number || r.room_id} {r.floor_number ? `(Fl ${r.floor_number})` : ''}
                          </span>

                          <h3 className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors">
                            {r.issue_title}
                          </h3>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${getPriorityBadge(r.priority)}`}>
                            {r.priority}
                          </span>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${getStatusBadge(r.status)}`}>
                            {r.status.replace('_', ' ')}
                          </span>
                        </div>

                        {r.description && (
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {r.description}
                          </p>
                        )}

                        <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-4 pt-0.5">
                          <span>Reported: {formatDate(r.reported_at || (r as any).created_at)}</span>
                          {r.reported_by_name && <span>By: {r.reported_by_name}</span>}
                          <span>
                            Assigned:{' '}
                            <strong className={r.technician_name ? 'text-amber-300' : 'text-slate-500 italic'}>
                              {r.technician_name || 'Unassigned'}
                            </strong>
                          </span>
                          {(r.actual_cost || r.estimated_cost) ? (
                            <span className="text-emerald-400 font-serif font-bold">
                              Cost: {formatCurrency(r.actual_cost || r.estimated_cost)}
                            </span>
                          ) : null}
                          {r.resolution_notes && (
                            <span className="text-emerald-400/80 italic line-clamp-1">
                              Note: {r.resolution_notes}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center" onClick={e => e.stopPropagation()}>
                        {/* Accept Task if not assigned or pending */}
                        {r.status === 'reported' && (
                          <button
                            onClick={() => handleAcceptTask(r)}
                            className="px-3 py-1.5 bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                            <span>Accept Task</span>
                          </button>
                        )}

                        {/* Mark Resolved */}
                        {r.status !== 'resolved' && r.status !== 'closed' ? (
                          <button
                            onClick={() => handleResolveTicket(r.id)}
                            className="px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Mark Resolved</span>
                          </button>
                        ) : (
                          <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Resolved
                          </span>
                        )}

                        {/* Open Details */}
                        <button
                          onClick={() => handleOpenManageModal(r)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-400" />
                          <span>Manage</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== MODAL 1: REPORT ROOM REPAIR ===================== */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-6 space-y-4 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-amber-400" />
                  <div>
                    <h3 className="text-lg font-serif font-bold text-white">Report Room Repair</h3>
                    <p className="text-xs text-slate-400">Log an engineering ticket for room turnover or guest safety</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Select Room *</label>
                    <select
                      value={roomId}
                      onChange={e => setRoomId(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:border-amber-500"
                    >
                      {rooms.map(rm => (
                        <option key={rm.id} value={rm.id}>
                          Room #{rm.room_number} (Floor {rm.floor_number})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Repair Category *</label>
                    <select
                      value={repairCategory}
                      onChange={e => setRepairCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:border-amber-500"
                    >
                      <option value="HVAC & Air Conditioning">HVAC & Air Conditioning</option>
                      <option value="Plumbing & Sanitation">Plumbing & Sanitation</option>
                      <option value="Electrical & Lighting">Electrical & Lighting</option>
                      <option value="Door Locks & Keycards">Door Locks & Keycards</option>
                      <option value="Furniture & Carpentry">Furniture & Carpentry</option>
                      <option value="Electronics, TV & Wi-Fi">Electronics, TV & Wi-Fi</option>
                      <option value="Glass & Windows">Glass & Windows</option>
                      <option value="General Maintenance">General Maintenance</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Fault Title / Short Summary *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AC unit leaking water, balcony sliding door latch stiff"
                    value={issueTitle}
                    onChange={e => setIssueTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Issue Description & Instructions *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Provide details for the engineering crew..."
                    value={issueDesc}
                    onChange={e => setIssueDesc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:border-amber-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Priority Level *</label>
                    <select
                      value={priority}
                      onChange={e => setPriority(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:border-amber-500"
                    >
                      <option value="low">Low (Cosmetic, can wait)</option>
                      <option value="medium">Medium (Turnover before check-in)</option>
                      <option value="high">High (Occupied room urgency)</option>
                      <option value="critical">Critical / Urgent (Safety or flood)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Assign Technician</label>
                    <select
                      value={assignedTo || ''}
                      onChange={e => setAssignedTo(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:border-amber-500"
                    >
                      <option value="">Leave Unassigned</option>
                      {technicians.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.full_name} ({t.position})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Optional Image Attachment URL</label>
                  <input
                    type="url"
                    placeholder="https://... or /images/..."
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:border-amber-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingTicket}
                    className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold rounded-xl cursor-pointer shadow-lg disabled:opacity-50"
                  >
                    {submittingTicket ? 'Logging Ticket...' : 'Create Work Order'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===================== MODAL 2: MANAGE REQUEST & WORK ORDER ===================== */}
        {showManageModal && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-6 space-y-4 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-amber-400" />
                  <div>
                    <h3 className="font-serif font-bold text-lg text-white">Manage Work Order #MNT-{selectedRequest.id}</h3>
                    <p className="text-xs text-amber-400 font-mono">Room #{selectedRequest.room_number || selectedRequest.room_id} • Floor {selectedRequest.floor_number || 1}</p>
                  </div>
                </div>
                <button onClick={() => setShowManageModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Ticket Details Box */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-sm">{selectedRequest.issue_title}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getPriorityBadge(selectedRequest.priority)}`}>
                    {selectedRequest.priority} Priority
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                  {selectedRequest.description}
                </p>
                <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                  <span>Reported By: {selectedRequest.reported_by_name || 'Staff'}</span>
                  <span>Date: {formatDate(selectedRequest.reported_at || (selectedRequest as any).created_at)}</span>
                </div>
              </div>

              <form onSubmit={handleUpdateTicket} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Repair Status *</label>
                    <select
                      value={manageStatus}
                      onChange={e => setManageStatus(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:border-amber-500"
                    >
                      <option value="reported">Pending / Reported</option>
                      <option value="assigned">Assigned to Tech</option>
                      <option value="in_progress">In Progress / Under Repair</option>
                      <option value="waiting_parts">Waiting for Spare Parts</option>
                      <option value="resolved">Resolved & Ready for Inspection</option>
                      <option value="closed">Closed / Cleared</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Assigned Technician</label>
                    <select
                      value={manageTechnicianId || ''}
                      onChange={e => setManageTechnicianId(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:border-amber-500"
                    >
                      <option value="">Unassigned</option>
                      {technicians.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.full_name} ({t.position})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Actual Repair Cost (ETB)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 850.00"
                    value={manageActualCost}
                    onChange={e => setManageActualCost(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:border-amber-500 font-serif"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Work Notes & Resolution Summary</label>
                  <textarea
                    rows={3}
                    placeholder="Describe parts replaced, diagnostics completed, or handover notes..."
                    value={manageNotes}
                    onChange={e => setManageNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:border-amber-500 resize-none"
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => handleAcceptTask(selectedRequest)}
                    className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 rounded-xl font-semibold cursor-pointer flex items-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Assign to Myself</span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowManageModal(false)}
                      className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updatingRequest}
                      className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold rounded-xl cursor-pointer shadow-lg disabled:opacity-50"
                    >
                      {updatingRequest ? 'Updating...' : 'Save Work Order'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
