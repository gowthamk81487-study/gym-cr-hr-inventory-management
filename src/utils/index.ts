/**
 * Reusable utility functions for The Gym Fitness Club Portal
 */

// Custom lightweight cn (classnames) utility
export function cn(...inputs: unknown[]): string {
  const classes: string[] = [];
  
  for (const input of inputs) {
    if (!input) continue;
    
    if (typeof input === 'string') {
      classes.push(input);
    } else if (Array.isArray(input)) {
      const resolved = cn(...input);
      if (resolved) classes.push(resolved);
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key);
      }
    }
  }
  
  return classes.filter(Boolean).join(' ');
}

// Currency Formatter
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

// Date Formatter (e.g. "July 18, 2026")
export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  } catch {
    return dateString;
  }
}

// Date Time Formatter
export function formatDateTime(dateString: string): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch {
    return dateString;
  }
}

// Attendance rate color logic helper
export function getAttendanceColor(rate: number): string {
  if (rate >= 85) return 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20';
  if (rate >= 60) return 'text-yellow-400 bg-yellow-500/10 border border-yellow-500/20';
  return 'text-rose-400 bg-rose-500/10 border border-rose-500/20';
}
