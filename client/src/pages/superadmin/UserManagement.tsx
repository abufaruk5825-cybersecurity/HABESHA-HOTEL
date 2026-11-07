/**
 * UserManagement — complete user CRUD table for SuperAdmin and Admin dashboards.
 * SuperAdmin sees all 8 roles; Admin sees only ADMIN_VISIBLE_ROLES.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { User, UserRole } from '../../types';
import { getRoleLabel, getRoleBadgeClass } from '../../utils/roleUtils';
import {
  Plus, Search, RefreshCw, Edit2, Trash2, UserX, UserCheck,
  X, ChevronLeft, ChevronRight, Eye, EyeOff, AlertTriangle,
  Filter, Key, Activity, Building, User as UserIcon
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserRow extends User {
  employee_id?: number;
  employee_code?: string;
  position?: string;
  department_id?: number;
  department_name?: string;
  updated_at?: string;
}

interface Department { id: number; name: string; description?: string; employee_count?: number; }

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_ROLES: UserRole[] = ['superadmin', 'admin', 'manager', 'receptionist', 'housekeeper', 'accountant', 'maintenance', 'customer'];
const ADMIN_VISIBLE_ROLES: UserRole[] = ['manager', 'receptionist', 'housekeeper', 'accountant', 'maintenance', 'customer'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  const cls = getRoleBadgeClass(role as UserRole);
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${cls}`}>
      {getRoleLabel(role as UserRole)}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  /** 'superadmin' can manage all roles; 'admin' is restricted */
  viewerRole: 'superadmin' | 'admin';
}

export const UserManagement: React.FC<Props> = ({ viewerRole }) => {
  const { user: currentUser } = useAuth();

  // ── Data ──────────────────────────────────────────────────────────────────
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Filters / Pagination ──────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // ── Modals ────────────────────────────────────────────────────────────────
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [activityTarget, setActivityTarget] = useState<UserRow | null>(null);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);

  // ── Create form ───────────────────────────────────────────────────────────
  const [cName, setCName] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cRole, setCRole] = useState<UserRole>('customer');
  const [cPassword, setCPassword] = useState('Welcome123!');
  const [cDept, setCDept] = useState('');
  const [cPosition, setCPosition] = useState('');
  const [cShowPwd, setCShowPwd] = useState(false);
  const [cSubmitting, setCSubmitting] = useState(false);
  const [cError, setCError] = useState<string | null>(null);

  // ── Edit form ─────────────────────────────────────────────────────────────
  const [eRole, setERole] = useState<UserRole>('customer');
  const [eName, setEName] = useState('');
  const [ePhone, setEPhone] = useState('');
  const [eActive, setEActive] = useState(true);
  const [eDept, setEDept] = useState('');
  const [ePosition, setEPosition] = useState('');
  const [ePassword, setEPassword] = useState('');
  const [eShowPwd, setEShowPwd] = useState(false);
  const [eSubmitting, setESubmitting] = useState(false);
  const [eError, setEError] = useState<string | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search)      params.set('search', search);
      if (filterRole)  params.set('role', filterRole);
      if (filterStatus)params.set('is_active', filterStatus === 'active' ? 'true' : 'false');
      if (filterDept)  params.set('department_id', filterDept);
      params.set('page', String(page));
      params.set('limit', String(pageSize));

      const res = await api.get<any>(`/users?${params}`);
      const list = Array.isArray(res) ? res : (res?.users ?? []);
      const count = typeof res?.total === 'number' ? res.total : list.length;
      setUsers(list);
      setTotal(count);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search, filterRole, filterStatus, filterDept, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => {
    api.get<Department[]>('/departments')
      .then(d => setDepartments(d || []))
      .catch(() => {});
  }, []);

  // ── Available roles based on viewer ──────────────────────────────────────
  const availableRoles = viewerRole === 'superadmin' ? ALL_ROLES : ADMIN_VISIBLE_ROLES;

  // ── Create ────────────────────────────────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCError(null);
    setCSubmitting(true);
    try {
      await api.post('/users', {
        full_name: cName,
        email: cEmail,
        phone: cPhone || undefined,
        role: cRole,
        password: cPassword,
        department_id: cDept || undefined,
        position: cPosition || undefined,
      });
      setShowCreate(false);
      setCName(''); setCEmail(''); setCPhone(''); setCRole('customer');
      setCPassword('Welcome123!'); setCDept(''); setCPosition('');
      fetchUsers();
    } catch (err: any) {
      setCError(err.message || 'Failed to create user');
    } finally {
      setCSubmitting(false);
    }
  };

  // ── Open edit modal ───────────────────────────────────────────────────────
  const openEdit = (u: UserRow) => {
    setEditUser(u);
    setERole(u.role);
    setEName(u.full_name);
    setEPhone(u.phone || '');
    setEActive(u.is_active === 1);
    setEDept(u.department_id ? String(u.department_id) : '');
    setEPosition(u.position || '');
    setEPassword('');
    setEError(null);
  };

  // ── Save edit ─────────────────────────────────────────────────────────────
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setEError(null);
    setESubmitting(true);
    try {
      await api.put(`/users/${editUser.id}`, {
        full_name: eName,
        role: eRole,
        phone: ePhone || undefined,
        is_active: eActive,
        department_id: eDept || undefined,
        position: ePosition || undefined,
        password: ePassword || undefined,
      });
      setEditUser(null);
      fetchUsers();
    } catch (err: any) {
      setEError(err.message || 'Failed to update user');
    } finally {
      setESubmitting(false);
    }
  };

  // ── Toggle active ─────────────────────────────────────────────────────────
  const handleToggleActive = async (u: UserRow) => {
    try {
      await api.put(`/users/${u.id}`, { is_active: u.is_active ? 0 : 1 });
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.del(`/users/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to delete user');
    }
  };

  // ── View activity ─────────────────────────────────────────────────────────
  const viewActivity = async (u: UserRow) => {
    setActivityTarget(u);
    try {
      const logs = await api.get<any[]>(`/users/${u.id}/activity`);
      setActivityLogs(logs || []);
    } catch { setActivityLogs([]); }
  };

  const totalPages = Math.ceil(total / pageSize);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* ── Header bar ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-bold text-white">User Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {total} total accounts · search, filter, create, edit, activate/deactivate
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-colors cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" /> Create User
        </button>
      </div>

      {/* ── Filters bar ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search name, email, phone…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Role filter */}
        <select
          value={filterRole}
          onChange={e => { setFilterRole(e.target.value); setPage(1); }}
          className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
        >
          <option value="">All Roles</option>
          {availableRoles.map(r => <option key={r} value={r}>{getRoleLabel(r)}</option>)}
        </select>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
          className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Deactivated</option>
        </select>

        {/* Department filter */}
        <select
          value={filterDept}
          onChange={e => { setFilterDept(e.target.value); setPage(1); }}
          className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
        >
          <option value="">All Departments</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>

        <button onClick={fetchUsers} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors" title="Refresh">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl text-rose-300 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* ── Table ──────────────────────────────────────────────────────── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60">
                <th className="py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">User</th>
                <th className="py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Role</th>
                <th className="py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Department / Position</th>
                <th className="py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Phone</th>
                <th className="py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                <th className="py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading && users.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center text-slate-500 text-sm">Loading users…</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center text-slate-500 text-sm">No users found</td></tr>
              ) : users.map(u => {
                const isSelf = currentUser?.id === u.id;
                const isSuperAdmin = u.role === 'superadmin';
                return (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* User */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${getRoleBadgeClass(u.role)}`}>
                          {u.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {u.full_name}
                            {isSelf && <span className="ml-1.5 text-[10px] text-amber-400">(you)</span>}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    {/* Role */}
                    <td className="py-3 px-4"><RoleBadge role={u.role} /></td>
                    {/* Department */}
                    <td className="py-3 px-4 hidden md:table-cell">
                      {u.department_name ? (
                        <div>
                          <p className="text-xs text-slate-200">{u.department_name}</p>
                          {u.position && <p className="text-[11px] text-slate-500">{u.position}</p>}
                        </div>
                      ) : <span className="text-slate-600 text-xs">—</span>}
                    </td>
                    {/* Phone */}
                    <td className="py-3 px-4 text-xs text-slate-400 hidden lg:table-cell">{u.phone || '—'}</td>
                    {/* Status */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${u.is_active ? 'text-emerald-400' : 'text-rose-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                        {u.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    {/* Joined */}
                    <td className="py-3 px-4 text-[11px] text-slate-500 hidden lg:table-cell">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    {/* Actions */}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        {/* Activity */}
                        <button
                          onClick={() => viewActivity(u)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-700 transition-colors"
                          title="View Activity"
                        >
                          <Activity className="w-3.5 h-3.5" />
                        </button>
                        {/* Edit — cannot edit superadmin if viewer is admin */}
                        {!(isSuperAdmin && viewerRole === 'admin') && (
                          <button
                            onClick={() => openEdit(u)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-300 hover:bg-amber-500/10 transition-colors"
                            title="Edit User"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {/* Toggle active */}
                        {!isSelf && !isSuperAdmin && (
                          <button
                            onClick={() => handleToggleActive(u)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              u.is_active
                                ? 'text-slate-500 hover:text-rose-300 hover:bg-rose-500/10'
                                : 'text-slate-500 hover:text-emerald-300 hover:bg-emerald-500/10'
                            }`}
                            title={u.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {u.is_active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>
                        )}
                        {/* Delete — superadmin only */}
                        {viewerRole === 'superadmin' && !isSelf && !isSuperAdmin && (
                          <button
                            onClick={() => setDeleteTarget(u)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
            <span className="text-xs text-slate-500">
              Showing {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of {total}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-slate-300 px-2">{page} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          CREATE USER MODAL
      ══════════════════════════════════════════════════════════════════ */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700/60 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h3 className="font-serif text-base font-bold text-white">Create New User Account</h3>
              <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {cError && (
                <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl text-rose-300 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {cError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name *</label>
                  <input required value={cName} onChange={e => setCName(e.target.value)}
                    placeholder="e.g. Hana Tesfaye"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address *</label>
                  <input required type="email" value={cEmail} onChange={e => setCEmail(e.target.value)}
                    placeholder="staff@habeshahotel.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone</label>
                  <input value={cPhone} onChange={e => setCPhone(e.target.value)}
                    placeholder="+251 91 234 5678"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Role *</label>
                  <select required value={cRole} onChange={e => setCRole(e.target.value as UserRole)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none">
                    {availableRoles.map(r => <option key={r} value={r}>{getRoleLabel(r)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Department</label>
                  <select value={cDept} onChange={e => setCDept(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none">
                    <option value="">— None —</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Position / Job Title</label>
                  <input value={cPosition} onChange={e => setCPosition(e.target.value)}
                    placeholder="e.g. Front Desk Officer"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Initial Password *</label>
                  <div className="relative">
                    <input required minLength={6} type={cShowPwd ? 'text' : 'password'}
                      value={cPassword} onChange={e => setCPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 pr-10 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none" />
                    <button type="button" onClick={() => setCShowPwd(v => !v)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300">
                      {cShowPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Minimum 6 characters. User should change on first login.</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={cSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {cSubmitting ? 'Creating…' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          EDIT USER MODAL
      ══════════════════════════════════════════════════════════════════ */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700/60 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div>
                <h3 className="font-serif text-base font-bold text-white">Edit User</h3>
                <p className="text-xs text-slate-400">{editUser.email}</p>
              </div>
              <button onClick={() => setEditUser(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              {eError && (
                <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl text-rose-300 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {eError}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                  <input value={eName} onChange={e => setEName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone</label>
                  <input value={ePhone} onChange={e => setEPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Role</label>
                  <select value={eRole} onChange={e => setERole(e.target.value as UserRole)}
                    disabled={editUser.role === 'superadmin' && viewerRole !== 'superadmin'}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none disabled:opacity-50">
                    {availableRoles.map(r => <option key={r} value={r}>{getRoleLabel(r)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Department</label>
                  <select value={eDept} onChange={e => setEDept(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none">
                    <option value="">— None —</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Position</label>
                  <input value={ePosition} onChange={e => setEPosition(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none" />
                </div>
                <div className="sm:col-span-2 flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={eActive} onChange={e => setEActive(e.target.checked)}
                      className="w-4 h-4 rounded accent-amber-500" />
                    <span className="text-sm text-slate-300">Account is Active</span>
                  </label>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    <Key className="w-3.5 h-3.5 inline mr-1" />New Password <span className="font-normal text-slate-500">(leave blank to keep current)</span>
                  </label>
                  <div className="relative">
                    <input type={eShowPwd ? 'text' : 'password'} minLength={6}
                      value={ePassword} onChange={e => setEPassword(e.target.value)}
                      placeholder="Leave blank to keep unchanged"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none" />
                    <button type="button" onClick={() => setEShowPwd(v => !v)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300">
                      {eShowPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={eSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-colors disabled:opacity-50">
                  {eSubmitting ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          DELETE CONFIRM MODAL
      ══════════════════════════════════════════════════════════════════ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-rose-500/40 w-full max-w-sm rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-400 flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-white">Delete User Account</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
              <strong className="text-white">{deleteTarget.full_name}</strong><br />
              <span className="text-slate-400">{deleteTarget.email}</span><br />
              <RoleBadge role={deleteTarget.role} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition-colors">
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          ACTIVITY LOG MODAL
      ══════════════════════════════════════════════════════════════════ */}
      {activityTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700/60 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div>
                <h3 className="font-serif text-base font-bold text-white">Activity History</h3>
                <p className="text-xs text-slate-400">{activityTarget.full_name} · {activityTarget.email}</p>
              </div>
              <button onClick={() => setActivityTarget(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto space-y-2">
              {activityLogs.length === 0 ? (
                <p className="text-center text-slate-500 text-sm py-8">No activity recorded yet.</p>
              ) : activityLogs.map((log, i) => (
                <div key={i} className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-amber-300 text-[11px]">{log.action}</span>
                    <span className="text-slate-500">{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-300">{log.details}</p>
                  {log.ip_address && <p className="text-slate-600 text-[10px] mt-0.5">IP: {log.ip_address}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
