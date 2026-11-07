import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getDashboardViewForRole, getRoleLabel, getRoleBadgeClass } from '../../utils/roleUtils';
import {
  LayoutDashboard, BedDouble, CalendarCheck, Users, DollarSign, FileText,
  Settings, BarChart3, Wrench, Sparkles, ShieldCheck, Building2, LogOut,
  Bell, ChevronDown, ChevronRight, Menu, X, Home, CreditCard, ClipboardList,
  UserCog, Lock, Activity, Hammer, Package, ChevronLeft, User, UserCheck, MessageSquare,
  Sun, Moon
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
}

interface DashboardLayoutProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  navItems: NavItem[];
  onNavigateToWebsite: () => void;
  children: React.ReactNode;
  title?: string;
}

// ─── Role accent colours ──────────────────────────────────────────────────────

function getRoleAccent(role?: string) {
  switch (role) {
    case 'superadmin': return { bg: 'bg-violet-600', text: 'text-violet-300', glow: 'shadow-violet-500/20' };
    case 'admin': return { bg: 'bg-rose-600', text: 'text-rose-300', glow: 'shadow-rose-500/20' };
    case 'manager': return { bg: 'bg-blue-600', text: 'text-blue-300', glow: 'shadow-blue-500/20' };
    case 'receptionist': return { bg: 'bg-teal-600', text: 'text-teal-300', glow: 'shadow-teal-500/20' };
    case 'accountant': return { bg: 'bg-emerald-600', text: 'text-emerald-300', glow: 'shadow-emerald-500/20' };
    case 'housekeeper': return { bg: 'bg-sky-600', text: 'text-sky-300', glow: 'shadow-sky-500/20' };
    case 'maintenance': return { bg: 'bg-orange-600', text: 'text-orange-300', glow: 'shadow-orange-500/20' };
    case 'customer': return { bg: 'bg-amber-600', text: 'text-amber-300', glow: 'shadow-amber-500/20' };
    default: return { bg: 'bg-slate-600', text: 'text-slate-300', glow: 'shadow-slate-500/20' };
  }
}

function RoleIcon({ role }: { role?: string }) {
  const cls = 'w-4 h-4';
  switch (role) {
    case 'superadmin': return <ShieldCheck className={cls} />;
    case 'admin': return <Building2 className={cls} />;
    case 'manager': return <BarChart3 className={cls} />;
    case 'receptionist': return <CalendarCheck className={cls} />;
    case 'accountant': return <DollarSign className={cls} />;
    case 'housekeeper': return <Sparkles className={cls} />;
    case 'maintenance': return <Wrench className={cls} />;
    default: return <LayoutDashboard className={cls} />;
  }
}

// ─── DashboardLayout ──────────────────────────────────────────────────────────

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  activeTab, onTabChange, navItems, onNavigateToWebsite, children, title,
}) => {
  const { user, logout, notifications, unreadCount, markNotificationRead } = useAuth();
  const { theme, setTheme, isLight } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const roleLabel = getRoleLabel(user?.role);
  const badgeClass = getRoleBadgeClass(user?.role);
  const accent = getRoleAccent(user?.role);
  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? 'U';

  const handleLogout = async () => {
    await logout();
    onNavigateToWebsite();
  };

  return (
    <div className={`dashboard-scope flex h-screen w-screen overflow-hidden font-sans ${theme === 'light' ? 'theme-light bg-slate-50' : 'theme-dark bg-slate-950'}`}>

      {/* ── Mobile overlay ──────────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ════════════════════════ SIDEBAR ════════════════════════════════ */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 lg:z-auto flex flex-col
        bg-slate-900 border-r border-slate-800/60
        transform transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${sidebarCollapsed ? 'lg:w-16' : 'w-64 lg:w-64'}
        flex-shrink-0 overflow-hidden
      `}>

        {/* Brand header */}
        <div className={`flex items-center gap-3 px-4 h-16 border-b border-slate-800/60 bg-slate-950/40 flex-shrink-0 ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <img
            src="/images/logo-hotel.png"
            alt="HABESHA-HOTEL"
            className="w-8 h-8 object-contain rounded-lg border border-amber-500/30 flex-shrink-0"
            onError={e => { (e.currentTarget as HTMLImageElement).src = '/images/logo hotel.png'; }}
          />
          {!sidebarCollapsed && (
            <div className="min-w-0 flex-1">
              <span className="font-serif text-sm font-bold text-white block leading-tight truncate">
                HABESHA<span className="text-amber-400">-HOTEL</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-slate-500">Management</span>
            </div>
          )}
          {/* Desktop collapse toggle */}
          <button
            onClick={() => setSidebarCollapsed(v => !v)}
            className="hidden lg:flex p-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors flex-shrink-0"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
          {/* Mobile close */}
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-white flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User identity */}
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2.5 px-4 py-3 mx-2 mt-2 mb-1 rounded-xl bg-slate-800/40 border border-slate-700/40">
            <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${accent.bg} flex items-center justify-center text-white text-xs font-bold shadow-lg ${accent.glow}`}>
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate leading-tight">{user?.full_name || 'User'}</p>
              <span className={`text-[10px] font-medium ${accent.text}`}>{roleLabel}</span>
            </div>
          </div>
        )}
        {sidebarCollapsed && (
          <div className="flex justify-center py-2 mt-2">
            <div className={`w-8 h-8 rounded-lg ${accent.bg} flex items-center justify-center text-white text-xs font-bold`}>
              {initials}
            </div>
          </div>
        )}

        {/* Section label */}
        {!sidebarCollapsed && (
          <p className="text-[9px] uppercase tracking-widest text-slate-600 px-4 mt-3 mb-1 font-semibold">Navigation</p>
        )}

        {/* Nav items */}
        <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto py-1">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onTabChange(item.id); setSidebarOpen(false); }}
                title={sidebarCollapsed ? item.label : undefined}
                className={`
                  w-full flex items-center gap-3 rounded-lg transition-all duration-150 cursor-pointer group
                  ${sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'}
                  ${isActive
                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
                  }
                `}
              >
                <span className={`flex-shrink-0 transition-colors ${isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                  {item.icon}
                </span>
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 text-sm font-medium truncate text-left">{item.label}</span>
                    {item.badge !== undefined && Number(item.badge) > 0 && (
                      <span className={`flex-shrink-0 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold px-1 ${isActive ? 'bg-amber-500 text-slate-950' : 'bg-slate-700 text-slate-300'
                        }`}>
                        {item.badge}
                      </span>
                    )}
                    {isActive && <ChevronRight className="w-3 h-3 flex-shrink-0 text-amber-400 opacity-60" />}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        {!sidebarCollapsed && (
          <div className="p-3 border-t border-slate-800/60 space-y-1">
            <button
              onClick={onNavigateToWebsite}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <Home className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">Back to Website</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        )}
        {sidebarCollapsed && (
          <div className="p-2 border-t border-slate-800/60 space-y-1 flex flex-col items-center">
            <button onClick={onNavigateToWebsite} title="Back to Website" className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors">
              <Home className="w-4 h-4" />
            </button>
            <button onClick={handleLogout} title="Sign Out" className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </aside>

      {/* ════════════════════════ MAIN ═══════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Top bar ──────────────────────────────────────────────────── */}
        <header className="flex-shrink-0 h-16 flex items-center justify-between px-4 sm:px-6 bg-slate-900/70 border-b border-slate-800/60 backdrop-blur-xl">
          {/* Left */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">
                {title ?? `${roleLabel} Portal`}
              </h1>
              <p className="text-[10px] text-slate-500 hidden sm:block leading-tight">
                HABESHA-HOTEL Management System
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-1 sm:gap-2">

            {/* ── Clearly Visible Light / Dark Mode Toggle ──────────────── */}
            <div className={`flex items-center p-1 rounded-xl border transition-all duration-200 mr-2 sm:mr-3 shadow-sm ${
              theme === 'light'
                ? 'bg-slate-200/90 border-slate-300'
                : 'bg-slate-950/90 border-slate-700/80'
            }`}>
              {/* Light Mode Button */}
              <button
                type="button"
                onClick={() => setTheme('light')}
                title="Switch Dashboard to Light Mode"
                aria-label="Light Mode"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  theme === 'light'
                    ? 'bg-amber-500 text-slate-950 shadow-md ring-1 ring-amber-400 font-extrabold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Sun className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-slate-950 stroke-[2.5]' : 'text-amber-400'}`} />
                <span className="inline font-bold">Light</span>
              </button>

              {/* Dark Mode Button */}
              <button
                type="button"
                onClick={() => setTheme('dark')}
                title="Switch Dashboard to Dark Mode"
                aria-label="Dark Mode"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-slate-800 text-amber-300 border border-amber-500/40 shadow-md ring-1 ring-amber-500/20 font-extrabold'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-300/50'
                }`}
              >
                <Moon className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-amber-400 stroke-[2.5]' : 'text-slate-400'}`} />
                <span className="inline font-bold">Dark</span>
              </button>
            </div>

            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifMenu(v => !v); setShowUserMenu(false); }}
                className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-slate-900" />
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                    <span className="text-sm font-bold text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[11px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-semibold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60">
                    {notifications.length === 0 ? (
                      <div className="py-10 text-center text-slate-500 text-sm">
                        <Bell className="w-6 h-6 mx-auto mb-2 opacity-40" />
                        No notifications
                      </div>
                    ) : (
                      notifications.slice(0, 10).map(n => (
                        <button
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`w-full text-left px-4 py-3 hover:bg-slate-800/40 transition-colors ${!n.is_read ? 'bg-amber-500/5' : ''}`}
                        >
                          <p className={`text-xs font-semibold truncate ${n.is_read ? 'text-slate-400' : 'text-white'}`}>{n.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 truncate">{n.message}</p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => { setShowUserMenu(v => !v); setShowNotifMenu(false); }}
                className="flex items-center gap-2 pl-1 pr-2 py-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <div className={`w-8 h-8 rounded-lg ${accent.bg} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {initials}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-white leading-tight max-w-[100px] truncate">
                    {user?.full_name?.split(' ')[0]}
                  </p>
                  <p className={`text-[10px] leading-tight ${accent.text}`}>{roleLabel}</p>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-500 hidden sm:block" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-800">
                    <p className="text-sm font-semibold text-white truncate">{user?.full_name}</p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email}</p>
                    <div className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-md text-[10px] font-bold border ${badgeClass}`}>
                      <RoleIcon role={user?.role} />
                      {roleLabel}
                    </div>
                  </div>
                  <div className="p-1.5">
                    <button
                      onClick={() => { setShowUserMenu(false); onNavigateToWebsite(); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                    >
                      <Home className="w-4 h-4 text-slate-500" /> Back to Website
                    </button>
                    <button
                      onClick={() => { setShowUserMenu(false); handleLogout(); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Page content ─────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-4 sm:p-6">
          {children}
        </main>
      </div>

      {/* Click-outside to close menus */}
      {(showUserMenu || showNotifMenu) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => { setShowUserMenu(false); setShowNotifMenu(false); }}
        />
      )}
    </div>
  );
};

// ─── Pre-built nav item sets ──────────────────────────────────────────────────

const ic = (I: React.FC<{ className?: string }>) => <I className="w-4 h-4" />;

export const NAV_ITEMS: Record<string, NavItem[]> = {
  superadmin: [
    { id: 'overview', label: 'System Overview', icon: ic(LayoutDashboard) },
    { id: 'branches', label: 'Hotel Branches', icon: ic(Building2) },
    { id: 'admins', label: 'Administrators', icon: ic(Users) },
    { id: 'security', label: 'Security & Settings', icon: ic(Lock) },
    { id: 'audits', label: 'Audit Logs', icon: ic(Activity) },
  ],
  admin: [
    { id: 'overview', label: 'Overview', icon: ic(LayoutDashboard) },
    { id: 'rooms', label: 'Room Management', icon: ic(BedDouble) },
    { id: 'bookings', label: 'Bookings', icon: ic(CalendarCheck) },
    { id: 'finance', label: 'Finance', icon: ic(DollarSign) },
    { id: 'users', label: 'Staff & Users', icon: ic(Users) },
    { id: 'reports', label: 'Reports', icon: ic(BarChart3) },
    { id: 'settings', label: 'Settings', icon: ic(Settings) },
  ],
  manager: [
    { id: 'overview', label: 'Dashboard', icon: ic(LayoutDashboard) },
    { id: 'reservations', label: 'Reservations', icon: ic(CalendarCheck) },
    { id: 'rooms', label: 'Room Status', icon: ic(BedDouble) },
    { id: 'guests', label: 'Guest Management', icon: ic(Users) },
    { id: 'housekeeping', label: 'Housekeeping', icon: ic(Sparkles) },
    { id: 'maintenance', label: 'Maintenance', icon: ic(Wrench) },
    { id: 'staff', label: 'Staff Management', icon: ic(UserCheck) },
    { id: 'complaints', label: 'Guest Complaints', icon: ic(MessageSquare) },
    { id: 'reports', label: 'Reports & Analytics', icon: ic(BarChart3) },
    { id: 'notifications', label: 'Notifications', icon: ic(Bell) },
    { id: 'profile', label: 'My Profile', icon: ic(User) },
  ],
  receptionist: [
    { id: 'dashboard', label: 'Dashboard', icon: ic(LayoutDashboard) },
    { id: 'reservations', label: 'Reservations', icon: ic(CalendarCheck) },
    { id: 'arrivals', label: 'Arrivals / Check-in', icon: ic(CalendarCheck) },
    { id: 'departures', label: 'Departures / Checkout', icon: ic(LogOut) },
    { id: 'grid', label: 'Room Board', icon: ic(BedDouble) },
    { id: 'walkin', label: 'Walk-in Guest', icon: ic(UserCog) },
    { id: 'guests', label: 'Guest Management', icon: ic(Users) },
    { id: 'search', label: 'Guest Search', icon: ic(Users) },
    { id: 'payments', label: 'Payments & Receipts', icon: ic(CreditCard) },
    { id: 'notifications', label: 'Notifications', icon: ic(Bell) },
    { id: 'profile', label: 'My Profile', icon: ic(User) },
  ],
  accountant: [
    { id: 'ledger', label: 'Financial Summary', icon: ic(LayoutDashboard) },
    { id: 'payments', label: 'Payments', icon: ic(CreditCard) },
    { id: 'invoices', label: 'Invoices', icon: ic(FileText) },
    { id: 'expenses', label: 'Expenses', icon: ic(ClipboardList) },
  ],
  housekeeper: [
    { id: 'tasks', label: 'My Tasks', icon: ic(ClipboardList) },
    { id: 'rooms', label: 'Room Status', icon: ic(BedDouble) },
  ],
  maintenance: [
    { id: 'requests', label: 'All Requests', icon: ic(Wrench) },
    { id: 'assigned', label: 'Assigned to Me', icon: ic(Hammer) },
    { id: 'equipment', label: 'Equipment', icon: ic(Package) },
  ],
  customer: [
    { id: 'bookings', label: 'My Bookings', icon: ic(CalendarCheck) },
    { id: 'services', label: 'Room Services', icon: ic(Sparkles) },
    { id: 'complaints', label: 'Help & Requests', icon: ic(Activity) },
  ],
};

// ─── Convenience re-export of Settings icon for dashboards ───────────────────
export { Settings };
