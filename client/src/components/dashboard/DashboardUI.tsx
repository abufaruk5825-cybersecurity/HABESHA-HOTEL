/**
 * DashboardUI — Shared, design-system-level components used across all 8 dashboards.
 * Keep every dashboard visually consistent without duplicating styles.
 */
import React from 'react';
import { RefreshCw, AlertCircle, Loader2, X } from 'lucide-react';

// ─── Page Header ─────────────────────────────────────────────────────────────

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}
export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <div>
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">{title}</h2>
        {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

// ─── KPI / Stat Card ─────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ReactNode;
  color?: 'default' | 'emerald' | 'rose' | 'amber' | 'blue' | 'purple' | 'orange' | 'sky';
  trend?: { value: string; up: boolean };
}

const colorMap: Record<string, { bg: string; icon: string; value: string }> = {
  default: { bg: 'bg-slate-700/40',   icon: 'text-slate-400',   value: 'text-white' },
  emerald: { bg: 'bg-emerald-500/15', icon: 'text-emerald-400', value: 'text-emerald-300' },
  rose:    { bg: 'bg-rose-500/15',    icon: 'text-rose-400',    value: 'text-rose-300' },
  amber:   { bg: 'bg-amber-500/15',   icon: 'text-amber-400',   value: 'text-amber-300' },
  blue:    { bg: 'bg-blue-500/15',    icon: 'text-blue-400',    value: 'text-blue-300' },
  purple:  { bg: 'bg-purple-500/15',  icon: 'text-purple-400',  value: 'text-purple-300' },
  orange:  { bg: 'bg-orange-500/15',  icon: 'text-orange-400',  value: 'text-orange-300' },
  sky:     { bg: 'bg-sky-500/15',     icon: 'text-sky-400',     value: 'text-sky-300' },
};

export function StatCard({ label, value, sub, icon, color = 'default', trend }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3 hover:border-slate-700 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider leading-tight">{label}</span>
        {icon && (
          <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center ${c.icon}`}>
            {icon}
          </div>
        )}
      </div>
      <div>
        <div className={`font-serif text-2xl sm:text-3xl font-bold leading-none ${c.value}`}>{value}</div>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        {trend && (
          <p className={`text-xs font-medium mt-1 ${trend.up ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend.up ? '▲' : '▼'} {trend.value}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

interface BadgeProps {
  label: string;
  variant?: 'emerald' | 'rose' | 'amber' | 'blue' | 'purple' | 'slate' | 'orange' | 'teal';
}

const badgeVariants: Record<string, string> = {
  emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  rose:    'bg-rose-500/15    text-rose-300    border-rose-500/30',
  amber:   'bg-amber-500/15   text-amber-300   border-amber-500/30',
  blue:    'bg-blue-500/15    text-blue-300    border-blue-500/30',
  purple:  'bg-purple-500/15  text-purple-300  border-purple-500/30',
  slate:   'bg-slate-700/40   text-slate-300   border-slate-700',
  orange:  'bg-orange-500/15  text-orange-300  border-orange-500/30',
  teal:    'bg-teal-500/15    text-teal-300    border-teal-500/30',
};

export function Badge({ label, variant = 'slate' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${badgeVariants[variant]}`}>
      {label}
    </span>
  );
}

/** Maps common status strings to badge variants automatically */
export function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase() ?? '';
  const v: BadgeProps['variant'] =
    s === 'confirmed' || s === 'active' || s === 'available' || s === 'ready' || s === 'clean' || s === 'completed' || s === 'resolved' || s === 'verified' ? 'emerald' :
    s === 'checked_in' || s === 'in_progress' || s === 'cleaning' ? 'blue' :
    s === 'pending' || s === 'reported' || s === 'assigned' || s === 'open' ? 'amber' :
    s === 'cancelled' || s === 'dirty' || s === 'critical' ? 'rose' :
    s === 'maintenance' || s === 'under_repair' || s === 'high' ? 'orange' :
    s === 'medium' ? 'teal' :
    s === 'low' ? 'slate' :
    'slate';
  return <Badge label={status.replace(/_/g, ' ')} variant={v} />;
}

// ─── Section Card ─────────────────────────────────────────────────────────────

interface SectionCardProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}
export function SectionCard({ title, subtitle, actions, children, className = '', padding = true }: SectionCardProps) {
  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div>
            {title && <h3 className="font-serif font-bold text-base text-white">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={padding ? 'p-5' : ''}>{children}</div>
    </div>
  );
}

// ─── Data Table ───────────────────────────────────────────────────────────────

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}
interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  emptyMessage?: string;
}
export function DataTable<T>({ columns, data, keyExtractor, emptyMessage = 'No records found.' }: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-slate-800">
            {columns.map((col, i) => (
              <th key={i} className={`py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider ${col.className ?? ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-sm text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map(row => (
              <tr key={keyExtractor(row)} className="hover:bg-slate-800/30 transition-colors">
                {columns.map((col, i) => (
                  <td key={i} className={`py-3 px-4 text-sm text-slate-300 ${col.className ?? ''}`}>
                    {typeof col.accessor === 'function'
                      ? col.accessor(row)
                      : String(row[col.accessor] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

interface EmptyProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}
export function EmptyState({ icon, title, subtitle, action }: EmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
      {icon && <div className="text-slate-600 w-12 h-12">{icon}</div>}
      <h4 className="text-sm font-semibold text-slate-300">{title}</h4>
      {subtitle && <p className="text-xs text-slate-500 max-w-xs">{subtitle}</p>}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

export function LoadingSpinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 animate-pulse space-y-3">
      <div className="h-3 bg-slate-800 rounded w-1/2" />
      <div className="h-8 bg-slate-800 rounded w-1/3" />
      <div className="h-2 bg-slate-800 rounded w-2/3" />
    </div>
  );
}

// ─── Action Button ────────────────────────────────────────────────────────────

interface BtnProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md';
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
}

const btnVariants: Record<string, string> = {
  primary:   'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-amber-500/20 shadow-sm',
  secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700',
  danger:    'bg-rose-600 hover:bg-rose-500 text-white font-semibold',
  ghost:     'bg-transparent hover:bg-slate-800 text-slate-300 border border-slate-700',
  success:   'bg-emerald-600 hover:bg-emerald-500 text-white font-semibold',
};

export function Btn({ children, onClick, variant = 'secondary', size = 'md', type = 'button', disabled, className = '' }: BtnProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center gap-2 rounded-xl font-medium transition-all cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-sm'}
        ${btnVariants[variant]}
        ${className}
      `}
    >
      {children}
    </button>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}
export function Modal({ open, onClose, title, children, maxWidth = 'max-w-md' }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className={`bg-slate-900 border border-slate-700/60 w-full ${maxWidth} rounded-2xl shadow-2xl overflow-hidden`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="font-serif text-base font-bold text-white">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Form field helpers ───────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}
export function Field({ label, required, children, hint }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-300">
        {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}

const inputBase = 'w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-colors';

export const inputCls = inputBase;

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputBase} ${props.className ?? ''}`} />;
}
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputBase} resize-none ${props.className ?? ''}`} />;
}
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputBase} ${props.className ?? ''}`} />;
}

// ─── Refresh Button ───────────────────────────────────────────────────────────

export function RefreshBtn({ onClick, loading }: { onClick: () => void; loading?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-50"
      title="Refresh"
    >
      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
    </button>
  );
}

// ─── Info Row (label + value pairs) ──────────────────────────────────────────

export function InfoGrid({ rows }: { rows: { label: string; value: React.ReactNode }[] }) {
  return (
    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 grid grid-cols-2 gap-x-4 gap-y-2.5">
      {rows.map((r, i) => (
        <div key={i}>
          <span className="text-[11px] text-slate-500 block">{r.label}</span>
          <span className="text-xs font-semibold text-slate-200 block mt-0.5">{r.value ?? '—'}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Alert Banner ─────────────────────────────────────────────────────────────

export function AlertBanner({ message, type = 'info' }: { message: string; type?: 'info' | 'error' | 'success' }) {
  const cls = type === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' :
              type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' :
              'bg-amber-500/10 border-amber-500/30 text-amber-300';
  return (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm ${cls}`}>
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      {message}
    </div>
  );
}
