import { UserRole } from '../types';

/**
 * Returns the correct dashboard view string for a given user role.
 * Centralised here to avoid duplication across App.tsx, Navbar.tsx, etc.
 */
export function getDashboardViewForRole(role?: string): string {
  switch (role) {
    case 'superadmin':  return 'superadmin';
    case 'admin':       return 'admin';
    case 'manager':     return 'manager';
    case 'receptionist': return 'reception';
    case 'housekeeper': return 'housekeeping';
    case 'accountant':  return 'accountant';
    case 'maintenance': return 'maintenance';
    case 'customer':
    default:            return 'customer';
  }
}

/**
 * Returns true when the authenticated user is allowed to visit the given view.
 */
export function isViewAuthorized(view: string, role?: string): boolean {
  if (view === 'website') return true;
  if (!role) return false;

  if (role === 'superadmin') return true;

  if (role === 'admin') {
    return ['admin', 'manager', 'reception', 'housekeeping', 'accountant', 'maintenance'].includes(view);
  }
  if (role === 'manager') {
    return ['manager', 'reception', 'housekeeping', 'maintenance'].includes(view);
  }
  if (role === 'receptionist')  return view === 'reception';
  if (role === 'housekeeper')   return view === 'housekeeping';
  if (role === 'accountant')    return view === 'accountant';
  if (role === 'maintenance')   return view === 'maintenance';
  if (role === 'customer')      return view === 'customer';

  return false;
}

/**
 * Returns the display-friendly label for a role.
 */
export function getRoleLabel(role?: string): string {
  switch (role) {
    case 'superadmin':   return 'Super Admin';
    case 'admin':        return 'Admin';
    case 'manager':      return 'Manager';
    case 'receptionist': return 'Receptionist';
    case 'housekeeper':  return 'Housekeeping';
    case 'accountant':   return 'Accountant';
    case 'maintenance':  return 'Maintenance';
    case 'customer':     return 'Guest';
    default:             return role ?? 'User';
  }
}

/**
 * Returns amber colour chip CSS classes for role badges.
 */
export function getRoleBadgeClass(role?: string): string {
  switch (role) {
    case 'superadmin':   return 'bg-violet-500/20 text-violet-300 border-violet-500/30';
    case 'admin':        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    case 'manager':      return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    case 'receptionist': return 'bg-teal-500/20 text-teal-300 border-teal-500/30';
    case 'accountant':   return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    case 'housekeeper':  return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
    case 'maintenance':  return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
    case 'customer':     return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    default:             return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  }
}
