import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { HousekeepingTask, Room, MaintenanceRequest } from '../../types';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  Check,
  Wrench,
  RefreshCw,
  Building,
  Search,
  Filter,
  Eye,
  ShieldCheck,
  AlertCircle,
  X,
  Layers,
  ChevronRight,
  UserCheck,
  Bed,
  CheckSquare,
  Square
} from 'lucide-react';

interface HousekeepingDashboardProps { onNavigateToWebsite: () => void; }

interface RoomOverviewItem {
  id: number;
  room_number: string;
  floor_number: number;
  status: 'available' | 'reserved' | 'occupied' | 'dirty' | 'cleaning' | 'maintenance' | 'out_of_service';
  operational_status: 'ready' | 'needs_cleaning' | 'cleaning_in_progress' | 'under_repair' | 'out_of_order';
  room_type_name: string;
  active_task_id?: number;
  task_type?: string;
  task_priority?: string;
  task_status?: string;
  assigned_to?: string;
}

export const HousekeepingDashboard: React.FC<HousekeepingDashboardProps> = ({ onNavigateToWebsite }) => {
  const { user } = useAuth();
  const { formatCurrency, formatDate } = useLanguage();

  // Navigation tab: 'rooms' (Room Status) or 'tasks' (Cleaning Tasks)
  const [activeTab, setActiveTab] = useState<'rooms' | 'tasks'>('rooms');

  const [tasks, setTasks] = useState<HousekeepingTask[]>([]);
  const [roomsOverview, setRoomsOverview] = useState<RoomOverviewItem[]>([]);
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [maintenanceTickets, setMaintenanceTickets] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State for Room Status
  const [roomSearchQuery, setRoomSearchQuery] = useState('');
  const [floorFilter, setFloorFilter] = useState<string>('all');
  const [roomTypeFilter, setRoomTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter for Cleaning Tasks Tab
  const [filterPriority, setFilterPriority] = useState<string>('');

  // Selected Room Details Drawer / Modal
  const [selectedRoom, setSelectedRoom] = useState<RoomOverviewItem | null>(null);
  const [showRoomDrawer, setShowRoomDrawer] = useState(false);

  // Room Inspection Modal State
  const [showInspectModal, setShowInspectModal] = useState(false);
  const [inspectRoom, setInspectRoom] = useState<RoomOverviewItem | null>(null);
  const [checklist, setChecklist] = useState<{
    bedroom: boolean;
    bathroom: boolean;
    linen: boolean;
    toiletries: boolean;
    furniture: boolean;
    overall: boolean;
  }>({
    bedroom: false,
    bathroom: false,
    linen: false,
    toiletries: false,
    furniture: false,
    overall: false,
  });
  const [inspectorNotes, setInspectorNotes] = useState('');
  const [submittingInspection, setSubmittingInspection] = useState(false);

  // Report Maintenance Modal from room
  const [showMaintModal, setShowMaintModal] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [maintCategory, setMaintCategory] = useState('HVAC & Air Conditioning');
  const [maintTitle, setMaintTitle] = useState('');
  const [maintDesc, setMaintDesc] = useState('');
  const [maintPriority, setMaintPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [submittingMaint, setSubmittingMaint] = useState(false);

  const loadHousekeepingData = async () => {
    setLoading(true);
    try {
      const [t, ov, rms, mnts] = await Promise.all([
        api.get<HousekeepingTask[]>('/housekeeping/tasks').catch(() => []),
        api.get<{ summary: any; rooms: RoomOverviewItem[] }>('/housekeeping/rooms-overview').catch(() => ({ summary: {}, rooms: [] })),
        api.get<Room[]>('/rooms').catch(() => []),
        api.get<MaintenanceRequest[]>('/maintenance').catch(() => []),
      ]);
      setTasks(t || []);
      setRoomsOverview(ov?.rooms || []);
      setAllRooms(rms || []);
      setMaintenanceTickets(mnts || []);
    } catch (e) {
      console.error('Failed to load housekeeping data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHousekeepingData();
  }, []);

  // Update room cleaning / operational status in DB
  const handleUpdateRoomStatus = async (
    roomId: number,
    newStatus: 'available' | 'dirty' | 'cleaning' | 'out_of_service' | 'maintenance',
    newOpStatus: 'ready' | 'needs_cleaning' | 'cleaning_in_progress' | 'out_of_order' | 'under_repair'
  ) => {
    try {
      await api.patch(`/rooms/${roomId}/status`, {
        status: newStatus,
        operational_status: newOpStatus,
      });
      await loadHousekeepingData();
      if (selectedRoom && selectedRoom.id === roomId) {
        setSelectedRoom(prev => prev ? { ...prev, status: newStatus, operational_status: newOpStatus } : null);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update room status');
    }
  };

  // Update task status
  const handleUpdateTaskStatus = async (taskId: number, status: 'in_progress' | 'completed' | 'verified') => {
    try {
      await api.patch(`/housekeeping/tasks/${taskId}/status`, { status });
      await loadHousekeepingData();
    } catch (err: any) {
      alert(err.message || 'Failed to update task');
    }
  };

  // Open inspection modal
  const handleOpenInspection = (room: RoomOverviewItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setInspectRoom(room);
    setChecklist({
      bedroom: true,
      bathroom: true,
      linen: true,
      toiletries: true,
      furniture: true,
      overall: true,
    });
    setInspectorNotes(`Room #${room.room_number} passed standard Habesha luxury inspection.`);
    setShowInspectModal(true);
  };

  // Submit inspection and automatically mark clean & ready
  const handleSubmitInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectRoom) return;
    const allChecked = Object.values(checklist).every(Boolean);
    if (!allChecked) {
      alert('All 6 inspection checklist items must be verified to clear room for guest check-in.');
      return;
    }

    setSubmittingInspection(true);
    try {
      // Mark room available and ready in database
      await api.patch(`/rooms/${inspectRoom.id}/status`, {
        status: 'available',
        operational_status: 'ready',
      });

      // Complete active task if any
      if (inspectRoom.active_task_id) {
        await api.patch(`/housekeeping/tasks/${inspectRoom.active_task_id}/status`, {
          status: 'verified',
        }).catch(() => {});
      }

      setShowInspectModal(false);
      setInspectRoom(null);
      await loadHousekeepingData();
      alert(`Room #${inspectRoom.room_number} successfully inspected and marked Clean & Ready in database!`);
    } catch (err: any) {
      alert(err.message || 'Failed to submit room inspection');
    } finally {
      setSubmittingInspection(false);
    }
  };

  // Open Report Maintenance Modal
  const handleOpenMaintenance = (roomId: number, roomNumber: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedRoomId(roomId);
    setMaintTitle(`Room #${roomNumber} Defect`);
    setMaintDesc('');
    setMaintPriority('high');
    setShowMaintModal(true);
  };

  // Dispatch maintenance alert to engineering
  const handleReportMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId) return;

    setSubmittingMaint(true);
    try {
      await api.post('/maintenance', {
        room_id: selectedRoomId,
        issue_title: `[${maintCategory}] ${maintTitle}`,
        description: maintDesc,
        priority: maintPriority,
      });
      alert('Maintenance alert dispatched to Engineering department!');
      setShowMaintModal(false);
      setMaintTitle('');
      setMaintDesc('');
      await loadHousekeepingData();
    } catch (err: any) {
      alert(err.message || 'Failed to dispatch maintenance alert');
    } finally {
      setSubmittingMaint(false);
    }
  };

  // Summary Metrics for Rooms
  const totalRoomsCount = roomsOverview.length;
  const cleanRoomsCount = roomsOverview.filter(r => r.operational_status === 'ready' || r.status === 'available').length;
  const dirtyRoomsCount = roomsOverview.filter(r => r.status === 'dirty' || r.operational_status === 'needs_cleaning').length;
  const cleaningCount = roomsOverview.filter(r => r.status === 'cleaning' || r.operational_status === 'cleaning_in_progress').length;
  const outOfOrderCount = roomsOverview.filter(r =>
    r.status === 'out_of_service' ||
    r.status === 'maintenance' ||
    r.operational_status === 'under_repair' ||
    r.operational_status === 'out_of_order'
  ).length;

  // Filtered Rooms
  const filteredRooms = roomsOverview.filter(r => {
    // Search
    const q = roomSearchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      r.room_number?.toLowerCase().includes(q) ||
      r.room_type_name?.toLowerCase().includes(q) ||
      r.assigned_to?.toLowerCase().includes(q);

    // Floor
    const matchFloor = floorFilter === 'all' || String(r.floor_number) === floorFilter;

    // Room Type
    const matchType = roomTypeFilter === 'all' || r.room_type_name?.toLowerCase().includes(roomTypeFilter.toLowerCase());

    // Status
    let matchStatus = true;
    if (statusFilter === 'available') matchStatus = r.status === 'available' || r.operational_status === 'ready';
    else if (statusFilter === 'dirty') matchStatus = r.status === 'dirty' || r.operational_status === 'needs_cleaning';
    else if (statusFilter === 'cleaning') matchStatus = r.status === 'cleaning' || r.operational_status === 'cleaning_in_progress';
    else if (statusFilter === 'inspected') matchStatus = r.operational_status === 'ready' && r.status === 'available';
    else if (statusFilter === 'occupied') matchStatus = r.status === 'occupied';
    else if (statusFilter === 'reserved') matchStatus = r.status === 'reserved';
    else if (statusFilter === 'maintenance') matchStatus = r.status === 'maintenance' || r.operational_status === 'under_repair';
    else if (statusFilter === 'out_of_order') matchStatus = r.status === 'out_of_service' || r.operational_status === 'out_of_order';
    else if (statusFilter !== 'all') matchStatus = r.status === statusFilter;

    return matchSearch && matchFloor && matchType && matchStatus;
  });

  // Filtered Cleaning Tasks
  const filteredTasks = tasks.filter(t => {
    if (filterPriority && t.priority !== filterPriority) return false;
    return true;
  });

  const getStatusBadge = (status: string, opStatus?: string) => {
    if (status === 'maintenance' || opStatus === 'under_repair') {
      return { text: 'Under Maintenance', cls: 'bg-orange-500/20 text-orange-300 border-orange-500/40' };
    }
    if (status === 'out_of_service' || opStatus === 'out_of_order') {
      return { text: 'Out of Order', cls: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
    }
    if (status === 'cleaning' || opStatus === 'cleaning_in_progress') {
      return { text: 'Cleaning in Progress', cls: 'bg-sky-500/20 text-sky-300 border-sky-500/40' };
    }
    if (status === 'dirty' || opStatus === 'needs_cleaning') {
      return { text: 'Dirty / Turn Down', cls: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
    }
    if (status === 'occupied') {
      return { text: 'Occupied / In-House', cls: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
    }
    if (status === 'reserved') {
      return { text: 'Reserved / Arrival', cls: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
    }
    return { text: 'Available / Clean', cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
  };

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab as any)}
      navItems={[
        { id: 'rooms', label: `Room Status (${roomsOverview.length})`, icon: <Building className="w-4 h-4" /> },
        { id: 'tasks', label: `Cleaning Tasks (${tasks.length})`,      icon: <Sparkles className="w-4 h-4" /> },
      ]}
      onNavigateToWebsite={onNavigateToWebsite}
      title="Housekeeping Management"
    >
      <div className="space-y-8 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <img
                src="/images/logo-hotel.png"
                alt="HABESHA-HOTEL"
                onError={e => { (e.currentTarget as HTMLImageElement).src = '/images/logo-hotel.png'; }}
                className="w-11 h-11 object-contain rounded-xl border border-amber-500/30 shadow-md"
              />
              <div>
                <h1 className="text-2xl font-serif font-bold text-slate-100">
                  {activeTab === 'rooms' ? 'Room Status & Daily Turnaround' : 'Housekeeping & Sanitation Tasks'}
                </h1>
                <p className="text-xs text-slate-400">
                  {activeTab === 'rooms'
                    ? 'Real-time room cleanliness, floor overview, inspections, and maintenance faults'
                    : 'Assigned floor turnover queue, priority turnarounds, and sanitation schedules'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={loadHousekeepingData}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* 5 Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider text-[10px]">
              <span>Total Rooms</span>
              <Building className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold font-serif text-slate-100 mt-2">{totalRoomsCount}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Across all 5 hotel floors</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold uppercase tracking-wider text-[10px]">
              <span>Clean & Ready</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-serif text-emerald-400 mt-2">{cleanRoomsCount}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Ready for guest check-in</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between text-rose-400 text-xs font-semibold uppercase tracking-wider text-[10px]">
              <span>Dirty / Turnover</span>
              <AlertCircle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-bold font-serif text-rose-400 mt-2">{dirtyRoomsCount}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Awaiting housekeeping</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between text-sky-400 text-xs font-semibold uppercase tracking-wider text-[10px]">
              <span>Cleaning Active</span>
              <Sparkles className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-bold font-serif text-sky-400 mt-2">{cleaningCount}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Staff currently in room</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-orange-400 text-xs font-semibold uppercase tracking-wider text-[10px]">
              <span>Out of Order</span>
              <Wrench className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-2xl font-bold font-serif text-orange-400 mt-2">{outOfOrderCount}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Engineering / repair</div>
          </div>
        </div>

        {/* ===================== TAB 1: ROOM STATUS DASHBOARD ===================== */}
        {activeTab === 'rooms' && (
          <div className="space-y-6">
            {/* Search and Filters ABOVE Room Grid */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search room by number (e.g. 201), suite type, or assigned housekeeper..."
                  value={roomSearchQuery}
                  onChange={e => setRoomSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5 text-xs">
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

                {/* Room Type Filter */}
                <select
                  value={roomTypeFilter}
                  onChange={e => setRoomTypeFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-300 focus:outline-none focus:border-amber-500"
                >
                  <option value="all">All Room Types</option>
                  <option value="Single">Standard Single</option>
                  <option value="Deluxe">Deluxe Rooms</option>
                  <option value="Twin">Twin Deluxe</option>
                  <option value="Executive">Executive Club</option>
                  <option value="Presidential">Presidential Suite</option>
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-300 focus:outline-none focus:border-amber-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="available">Available / Clean</option>
                  <option value="dirty">Dirty / Needs Cleaning</option>
                  <option value="cleaning">Cleaning in Progress</option>
                  <option value="inspected">Inspected & Ready</option>
                  <option value="occupied">Occupied</option>
                  <option value="reserved">Reserved</option>
                  <option value="maintenance">Under Maintenance</option>
                  <option value="out_of_order">Out of Order</option>
                </select>
              </div>
            </div>

            {/* Room Status Grid */}
            {loading ? (
              <div className="p-16 text-center text-slate-500 text-xs">Loading hotel room status grid...</div>
            ) : filteredRooms.length === 0 ? (
              <div className="p-16 bg-slate-900 rounded-2xl border border-slate-800 text-center text-slate-500 text-xs">
                No hotel rooms found matching your search and filter criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredRooms.map(rm => {
                  const badge = getStatusBadge(rm.status, rm.operational_status);
                  const isClean = rm.operational_status === 'ready' || rm.status === 'available';
                  const isDirty = rm.status === 'dirty' || rm.operational_status === 'needs_cleaning';
                  const isCleaning = rm.status === 'cleaning' || rm.operational_status === 'cleaning_in_progress';
                  const isMaintenance = rm.status === 'maintenance' || rm.operational_status === 'under_repair';

                  return (
                    <div
                      key={rm.id}
                      onClick={() => {
                        setSelectedRoom(rm);
                        setShowRoomDrawer(true);
                      }}
                      className="bg-slate-900 rounded-2xl border border-slate-800 hover:border-amber-500/50 transition-all p-4 space-y-3.5 shadow-xl flex flex-col justify-between cursor-pointer group"
                    >
                      {/* Card Header: Room Number, Floor & Status */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xl font-bold text-amber-400 group-hover:text-amber-300 transition-colors">
                              #{rm.room_number}
                            </span>
                            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-medium">
                              Floor {rm.floor_number}
                            </span>
                          </div>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${badge.cls}`}>
                            {badge.text}
                          </span>
                        </div>

                        <h4 className="font-serif font-bold text-sm text-white">{rm.room_type_name}</h4>

                        {rm.assigned_to ? (
                          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-sky-400" />
                            <span>Housekeeper: <strong className="text-slate-200">{rm.assigned_to}</strong></span>
                          </p>
                        ) : (
                          <p className="text-[11px] text-slate-500 mt-1 italic">Unassigned</p>
                        )}

                        {rm.task_type && (
                          <div className="mt-2 text-[11px] bg-slate-950 p-2 rounded-xl border border-slate-800/80 text-slate-300">
                            <span className="text-amber-400 font-semibold uppercase text-[10px] block">
                              Active Task: {rm.task_type.replace('_', ' ')}
                            </span>
                            <span className="text-slate-400 text-[10px]">
                              Priority: <strong className="capitalize">{rm.task_priority || 'Standard'}</strong>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Quick 1-Click Status Controls & Inspection */}
                      <div className="pt-2 border-t border-slate-800/80 space-y-2" onClick={e => e.stopPropagation()}>
                        <div className="grid grid-cols-2 gap-1.5">
                          {/* Mark Clean & Ready / Inspect */}
                          <button
                            onClick={() => handleOpenInspection(rm)}
                            className="py-1.5 px-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-bold rounded-lg text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            <span>Inspect Room</span>
                          </button>

                          {/* Start Cleaning */}
                          <button
                            onClick={() => handleUpdateRoomStatus(rm.id, 'cleaning', 'cleaning_in_progress')}
                            className="py-1.5 px-2 bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 font-semibold rounded-lg text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3 text-sky-400" />
                            <span>Start Cleaning</span>
                          </button>

                          {/* Mark Dirty */}
                          <button
                            onClick={() => handleUpdateRoomStatus(rm.id, 'dirty', 'needs_cleaning')}
                            className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>Mark Dirty</span>
                          </button>

                          {/* Report Fault */}
                          <button
                            onClick={() => handleOpenMaintenance(rm.id, rm.room_number)}
                            className="py-1.5 px-2 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 font-medium rounded-lg text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            <Wrench className="w-3 h-3 text-rose-400" />
                            <span>Report Fault</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB 2: CLEANING TASKS ===================== */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-slate-100">Sanitation Schedule & Priority Turnarounds</h2>
                <p className="text-xs text-slate-400">Urgent checkout rooms must be cleaned and restocked before incoming arrivals</p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={filterPriority}
                  onChange={e => setFilterPriority(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:border-amber-500"
                >
                  <option value="">All Priorities</option>
                  <option value="urgent">Urgent First</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Standard Turn Down</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks.map(task => (
                <div
                  key={task.id}
                  className={`p-5 rounded-2xl border transition-all shadow-lg flex flex-col justify-between space-y-4 ${
                    task.status === 'completed' || task.status === 'verified'
                      ? 'bg-slate-950/60 border-slate-800/80 opacity-70'
                      : task.priority === 'urgent'
                      ? 'bg-rose-950/20 border-rose-500/40'
                      : task.priority === 'high'
                      ? 'bg-amber-950/20 border-amber-500/40'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-lg font-bold text-amber-400">
                        Room #{task.room_number}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          task.priority === 'urgent'
                            ? 'bg-rose-500 text-white animate-pulse'
                            : task.priority === 'high'
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {task.priority} Priority
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-200">
                      Floor {task.floor_number} • {task.room_type_name}
                    </div>

                    <div className="text-xs text-slate-300 font-medium mt-2 capitalize">
                      Task: {task.task_type.replace('_', ' ')}
                    </div>

                    <p className="text-xs text-slate-400 font-light mt-1 leading-relaxed">
                      Instructions: {task.instructions || 'Full turnover. Linen exchange, bath sanitization, restock espresso pods.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>
                        Status: <strong className="text-slate-200 uppercase font-mono">{task.status.replace('_', ' ')}</strong>
                      </span>
                      <button
                        onClick={() => handleOpenMaintenance(task.room_id, task.room_number)}
                        className="text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Wrench className="w-3 h-3" />
                        <span>Report Issue</span>
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {task.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateTaskStatus(task.id, 'in_progress')}
                          className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Start Cleaning</span>
                        </button>
                      )}

                      {task.status === 'in_progress' && (
                        <button
                          onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Mark Clean & Ready</span>
                        </button>
                      )}

                      {(task.status === 'completed' || task.status === 'verified') && (
                        <div className="w-full text-center py-1 bg-emerald-500/10 text-emerald-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Room Clean & Verified</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== MODAL 1: ROOM INSPECTION WITH 6-POINT CHECKLIST ===================== */}
        {showInspectModal && inspectRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="font-serif font-bold text-lg text-white">
                      Inspect Room #{inspectRoom.room_number}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {inspectRoom.room_type_name} • Floor {inspectRoom.floor_number}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInspectModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300">6-Point Luxury Sanitation Checklist:</span>
                <button
                  type="button"
                  onClick={() => {
                    const allTrue = Object.values(checklist).every(Boolean);
                    setChecklist({
                      bedroom: !allTrue,
                      bathroom: !allTrue,
                      linen: !allTrue,
                      toiletries: !allTrue,
                      furniture: !allTrue,
                      overall: !allTrue,
                    });
                  }}
                  className="text-amber-400 hover:underline font-semibold cursor-pointer"
                >
                  {Object.values(checklist).every(Boolean) ? 'Deselect All' : 'Verify All'}
                </button>
              </div>

              <form onSubmit={handleSubmitInspection} className="space-y-4 text-xs">
                <div className="space-y-2 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  {/* 1. Bedroom cleanliness */}
                  <label className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-900/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.bedroom}
                      onChange={e => setChecklist(prev => ({ ...prev, bedroom: e.target.checked }))}
                      className="mt-0.5 accent-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="font-semibold text-white block">1. Bedroom Cleanliness</span>
                      <span className="text-[11px] text-slate-400">
                        Dusting completed, window mirrors polished, carpet/floors vacuumed, waste bins sanitized.
                      </span>
                    </div>
                  </label>

                  {/* 2. Bathroom sanitation */}
                  <label className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-900/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.bathroom}
                      onChange={e => setChecklist(prev => ({ ...prev, bathroom: e.target.checked }))}
                      className="mt-0.5 accent-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="font-semibold text-white block">2. Bathroom Sanitation</span>
                      <span className="text-[11px] text-slate-400">
                        Disinfected toilet with paper seal, streak-free shower glass, sink and drains cleared.
                      </span>
                    </div>
                  </label>

                  {/* 3. Bed and linen condition */}
                  <label className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-900/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.linen}
                      onChange={e => setChecklist(prev => ({ ...prev, linen: e.target.checked }))}
                      className="mt-0.5 accent-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="font-semibold text-white block">3. Bed & Linen Condition</span>
                      <span className="text-[11px] text-slate-400">
                        Freshly laundered 400-thread count sheets, crisp pillowcases, wrinkle-free duvet.
                      </span>
                    </div>
                  </label>

                  {/* 4. Towels and toiletries */}
                  <label className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-900/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.toiletries}
                      onChange={e => setChecklist(prev => ({ ...prev, toiletries: e.target.checked }))}
                      className="mt-0.5 accent-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="font-semibold text-white block">4. Towels & Toiletries Restocked</span>
                      <span className="text-[11px] text-slate-400">
                        Full plush bath towel sets, hand towels, floor mat, luxury shampoos, soaps & vanity kit.
                      </span>
                    </div>
                  </label>

                  {/* 5. Furniture and equipment */}
                  <label className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-900/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.furniture}
                      onChange={e => setChecklist(prev => ({ ...prev, furniture: e.target.checked }))}
                      className="mt-0.5 accent-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="font-semibold text-white block">5. Furniture & Room Equipment</span>
                      <span className="text-[11px] text-slate-400">
                        AC thermostat verified, LED lamps tested, TV remote sanitized in sleeve, safe unlocked.
                      </span>
                    </div>
                  </label>

                  {/* 6. Overall condition */}
                  <label className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-900/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.overall}
                      onChange={e => setChecklist(prev => ({ ...prev, overall: e.target.checked }))}
                      className="mt-0.5 accent-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="font-semibold text-white block">6. Overall Room Condition & Scent</span>
                      <span className="text-[11px] text-slate-400">
                        Subtle natural eucalyptus scent, pleasant ambient temperature, balcony locked.
                      </span>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Inspector Notes / Verification Log</label>
                  <textarea
                    rows={2}
                    value={inspectorNotes}
                    onChange={e => setInspectorNotes(e.target.value)}
                    placeholder="e.g. Verified by Hiwot Tadesse (Lead Supervisor). Clean and ready for VIP guest."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-amber-500 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInspectModal(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingInspection || !Object.values(checklist).every(Boolean)}
                    className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-950 font-bold rounded-xl cursor-pointer shadow-lg disabled:opacity-50"
                  >
                    {submittingInspection ? 'Updating Database...' : 'Pass & Mark Clean in DB'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===================== MODAL 2: REPORT MAINTENANCE ALERT ===================== */}
        {showMaintModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl text-slate-100 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-2">
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-amber-400" />
                  <div>
                    <h3 className="font-serif font-bold text-base text-white">Report Room Defect</h3>
                    <p className="text-xs text-slate-400">Alerts hotel engineering & marks room in maintenance</p>
                  </div>
                </div>
                <button onClick={() => setShowMaintModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleReportMaintenance} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Issue Category *</label>
                  <select
                    value={maintCategory}
                    onChange={e => setMaintCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-amber-500"
                  >
                    <option value="HVAC & Air Conditioning">HVAC & Air Conditioning</option>
                    <option value="Plumbing & Bathroom">Plumbing & Bathroom</option>
                    <option value="Electrical & Lights">Electrical & Lights</option>
                    <option value="Door Locks & Keycards">Door Locks & Keycards</option>
                    <option value="Furniture & Fixtures">Furniture & Fixtures</option>
                    <option value="TV & Electronics">TV & Electronics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Issue Headline *</label>
                  <input
                    type="text"
                    required
                    value={maintTitle}
                    onChange={e => setMaintTitle(e.target.value)}
                    placeholder="e.g. Shower hot water valve dripping / AC sensor error"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Problem Description *</label>
                  <textarea
                    required
                    rows={3}
                    value={maintDesc}
                    onChange={e => setMaintDesc(e.target.value)}
                    placeholder="Provide details for the engineering technician..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-amber-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Severity Priority</label>
                  <select
                    value={maintPriority}
                    onChange={e => setMaintPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-amber-500"
                  >
                    <option value="low">Low (Cosmetic, can wait)</option>
                    <option value="medium">Medium</option>
                    <option value="high">High (Turnover urgency)</option>
                    <option value="critical">Critical (Water or electrical hazard)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowMaintModal(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingMaint}
                    className="px-5 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 text-white font-bold rounded-xl cursor-pointer shadow-lg disabled:opacity-50"
                  >
                    {submittingMaint ? 'Dispatching...' : 'Dispatch to Engineering'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===================== DRAWER: ROOM DETAILS & MAINTENANCE ALERTS ===================== */}
        {showRoomDrawer && selectedRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl text-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-amber-400" />
                  <div>
                    <h3 className="font-serif font-bold text-lg text-white">
                      Room #{selectedRoom.room_number} Details
                    </h3>
                    <p className="text-xs text-amber-400 font-mono">Floor {selectedRoom.floor_number} • {selectedRoom.room_type_name}</p>
                  </div>
                </div>
                <button onClick={() => setShowRoomDrawer(false)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Banner */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Current Status</span>
                  <span className="font-bold text-white text-sm capitalize">{selectedRoom.status.replace('_', ' ')}</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Operational: {selectedRoom.operational_status.replace('_', ' ')}
                  </span>
                </div>
                <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase border ${getStatusBadge(selectedRoom.status, selectedRoom.operational_status).cls}`}>
                  {getStatusBadge(selectedRoom.status, selectedRoom.operational_status).text}
                </span>
              </div>

              {/* Maintenance Alerts for this Room */}
              <div>
                <span className="text-xs font-semibold text-slate-300 block mb-2">Active Engineering & Maintenance Tickets:</span>
                {maintenanceTickets.filter(m => m.room_id === selectedRoom.id && m.status !== 'resolved').length === 0 ? (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>No active defects logged for Room #{selectedRoom.room_number}.</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {maintenanceTickets.filter(m => m.room_id === selectedRoom.id && m.status !== 'resolved').map(m => (
                      <div key={m.id} className="p-3 bg-slate-950 rounded-xl border border-orange-500/30 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="font-bold text-amber-300">{m.issue_title}</span>
                          <span className="text-[10px] uppercase font-bold text-orange-400 font-mono">#MNT-{m.id}</span>
                        </div>
                        <p className="text-slate-300 text-[11px]">{m.description}</p>
                        <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                          <span>Technician: {m.technician_name || 'Unassigned'}</span>
                          <span>Priority: {m.priority}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowRoomDrawer(false);
                    handleOpenInspection(selectedRoom);
                  }}
                  className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Inspect Room</span>
                </button>

                <button
                  onClick={() => {
                    setShowRoomDrawer(false);
                    handleOpenMaintenance(selectedRoom.id, selectedRoom.room_number);
                  }}
                  className="px-3 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Report Defect</span>
                </button>

                <button
                  onClick={() => setShowRoomDrawer(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
