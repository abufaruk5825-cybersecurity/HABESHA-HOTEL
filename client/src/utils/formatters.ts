/**
 * HABESHA-HOTEL SHMS - Shared Client Utility Functions
 */

export function formatCurrency(amount: number, currency = '$'): string {
  return `${currency}${Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(dateTimeString: string): string {
  if (!dateTimeString) return '';
  const d = new Date(dateTimeString);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'available':
    case 'ready':
    case 'clean':
    case 'paid':
    case 'resolved':
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    case 'reserved':
    case 'confirmed':
    case 'partially_paid':
    case 'in_progress':
      return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
    case 'occupied':
    case 'checked_in':
      return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
    case 'dirty':
    case 'needs_cleaning':
    case 'pending':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    case 'maintenance':
    case 'under_repair':
    case 'urgent':
    case 'cancelled':
    case 'out_of_service':
      return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    default:
      return 'bg-slate-800 text-slate-300 border-slate-700';
  }
}

