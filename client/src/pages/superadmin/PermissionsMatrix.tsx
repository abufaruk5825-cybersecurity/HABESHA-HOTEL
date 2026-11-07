/**
 * PermissionsMatrix — visual role × permission grid for SuperAdmin only.
 * Allows granting/revoking permissions per role with real API persistence.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { RefreshCw, CheckSquare, Square, AlertTriangle, Info } from 'lucide-react';

interface Role { id: number; name: string; description?: string; }
interface Permission { id: number; code: string; description?: string; module: string; }

// Human-readable module labels
const MODULE_LABELS: Record<string, string> = {
  users: 'User Management',
  rooms: 'Room Management',
  bookings: 'Reservations',
  frontdesk: 'Front Desk',
  finance: 'Finance',
  housekeeping: 'Housekeeping',
  reports: 'Reports',
  settings: 'System Settings',
};

// Role name display
const ROLE_COLORS: Record<string, string> = {
  superadmin: 'text-violet-300',
  admin:      'text-rose-300',
  manager:    'text-blue-300',
  receptionist:'text-teal-300',
  accountant: 'text-emerald-300',
  housekeeper:'text-sky-300',
  maintenance:'text-orange-300',
  customer:   'text-amber-300',
};

export const PermissionsMatrix: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [granted, setGranted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null); // "roleId:permId"
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchMatrix = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<{ roles: Role[]; permissions: Permission[]; granted: string[] }>('/permissions/matrix');
      setRoles(data.roles);
      setPermissions(data.permissions);
      setGranted(new Set(data.granted));
    } catch (err: any) {
      setError(err.message || 'Failed to load permissions matrix');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMatrix(); }, [fetchMatrix]);

  const key = (roleId: number, permId: number) => `${roleId}:${permId}`;

  const handleToggle = async (roleId: number, permId: number, roleName: string) => {
    // Superadmin always has all permissions — protect that
    if (roleName === 'superadmin') return;

    const k = key(roleId, permId);
    const isGranted = granted.has(k);
    setSaving(k);
    setSuccessMsg(null);
    try {
      if (isGranted) {
        await api.post('/role-permissions/revoke', { roleId, permissionId: permId });
        setGranted(prev => { const n = new Set(prev); n.delete(k); return n; });
        setSuccessMsg('Permission revoked');
      } else {
        await api.post('/role-permissions/assign', { roleId, permissionId: permId });
        setGranted(prev => new Set([...prev, k]));
        setSuccessMsg('Permission granted');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update permission');
    } finally {
      setSaving(null);
      setTimeout(() => setSuccessMsg(null), 2000);
    }
  };

  // Group permissions by module
  const byModule = permissions.reduce<Record<string, Permission[]>>((acc, p) => {
    if (!acc[p.module]) acc[p.module] = [];
    acc[p.module].push(p);
    return acc;
  }, {});
  const modules = Object.keys(byModule).sort();

  // Non-customer, non-superadmin roles for the matrix columns
  const staffRoles = roles.filter(r => r.name !== 'customer');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
        <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
        <p className="text-sm">Loading permissions matrix…</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-bold text-white">Roles & Permissions Matrix</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Check a cell to grant a permission to a role · Superadmin always has all permissions
          </p>
        </div>
        <button onClick={fetchMatrix} className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm rounded-xl transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl text-rose-300 text-sm">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-2 p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-emerald-300 text-sm">
          {successMsg}
        </div>
      )}

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-300">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>These permissions are stored in the database and used for reference. Backend API access is enforced via <code className="bg-slate-800 px-1 rounded">requireRole()</code> middleware on each route.</span>
      </div>

      {/* Matrix table — scrollable horizontally */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60">
                <th className="py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider min-w-[200px] sticky left-0 bg-slate-950/90 z-10">
                  Permission
                </th>
                {staffRoles.map(r => (
                  <th key={r.id} className="py-3 px-3 text-center min-w-[100px]">
                    <span className={`text-xs font-bold capitalize ${ROLE_COLORS[r.name] ?? 'text-slate-300'}`}>
                      {r.name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modules.map(module => (
                <React.Fragment key={module}>
                  {/* Module header row */}
                  <tr className="bg-slate-950/40">
                    <td colSpan={staffRoles.length + 1} className="py-2 px-4 text-[11px] font-bold text-amber-400 uppercase tracking-wider sticky left-0 bg-slate-950/40 z-10">
                      {MODULE_LABELS[module] ?? module}
                    </td>
                  </tr>
                  {/* Permission rows */}
                  {byModule[module].map(perm => (
                    <tr key={perm.id} className="border-t border-slate-800/40 hover:bg-slate-800/20 transition-colors">
                      <td className="py-2.5 px-4 sticky left-0 bg-slate-900 z-10 hover:bg-slate-800/20">
                        <p className="text-xs font-semibold text-slate-200">{perm.code.replace('.', ' · ')}</p>
                        {perm.description && (
                          <p className="text-[10px] text-slate-500 mt-0.5">{perm.description}</p>
                        )}
                      </td>
                      {staffRoles.map(r => {
                        const k = key(r.id, perm.id);
                        const isGranted = granted.has(k);
                        const isSaving = saving === k;
                        const isSuperAdmin = r.name === 'superadmin';
                        return (
                          <td key={r.id} className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => handleToggle(r.id, perm.id, r.name)}
                              disabled={isSaving || isSuperAdmin}
                              title={isSuperAdmin ? 'Superadmin always has all permissions' : isGranted ? 'Click to revoke' : 'Click to grant'}
                              className={`
                                inline-flex items-center justify-center w-6 h-6 rounded
                                transition-all cursor-pointer
                                ${isSaving ? 'opacity-50 cursor-wait' : ''}
                                ${isSuperAdmin ? 'cursor-not-allowed opacity-60' : 'hover:scale-110'}
                                ${isGranted || isSuperAdmin
                                  ? 'text-emerald-400'
                                  : 'text-slate-600 hover:text-slate-400'
                                }
                              `}
                            >
                              {isGranted || isSuperAdmin
                                ? <CheckSquare className="w-5 h-5" />
                                : <Square className="w-5 h-5" />
                              }
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
