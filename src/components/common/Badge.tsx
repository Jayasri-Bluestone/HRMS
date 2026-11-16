import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', size = 'md' }) => {
  const styles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/10',
    danger: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/10',
    info: 'bg-sky-50 text-sky-700 border-sky-200 ring-sky-500/10',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/10',
    purple: 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-500/10'
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs font-medium px-2.5 py-1'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ring-1 ring-inset ${styles[variant]} ${sizes[size]}`}
    >
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status.toUpperCase()) {
    case 'ACTIVE':
    case 'PRESENT':
    case 'APPROVED':
    case 'PAID':
    case 'LOCKED':
      return <Badge variant="success">{status}</Badge>;
    case 'PENDING':
    case 'DRAFT':
    case 'PROBATION':
    case 'TRIAL':
    case 'LATE':
    case 'HALF_DAY':
      return <Badge variant="warning">{status}</Badge>;
    case 'ABSENT':
    case 'REJECTED':
    case 'SUSPENDED':
    case 'TERMINATED':
    case 'MISSED_PUNCH':
      return <Badge variant="danger">{status === 'MISSED_PUNCH' ? 'Missed Punch' : status}</Badge>;
    case 'ON_LEAVE':
    case 'CALCULATED':
    case 'REVIEWED':
      return <Badge variant="info">{status === 'ON_LEAVE' ? 'On Leave' : status}</Badge>;
    case 'REGULARIZATION_PENDING':
      return <Badge variant="warning">Regularization Pending</Badge>;
    case 'HOLIDAY':
      return <Badge variant="purple">Holiday</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
};

