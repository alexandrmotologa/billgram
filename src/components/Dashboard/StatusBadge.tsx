import React from 'react';
import type { InvoiceStatus } from '../../types/invoice';

interface StatusBadgeProps {
  status: InvoiceStatus;
  onClick?: () => void;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, onClick }) => {
  const configs: Record<InvoiceStatus, { label: string; bg: string; text: string; dot: string }> = {
    draft: {
      label: 'Draft',
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      dot: 'bg-slate-400',
    },
    sent: {
      label: 'Sent',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      dot: 'bg-blue-500',
    },
    paid: {
      label: 'Paid',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      dot: 'bg-emerald-500',
    },
    overdue: {
      label: 'Overdue',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      dot: 'bg-rose-500',
    },
  };

  const config = configs[status] || configs.draft;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text} transition-transform active:scale-95 disabled:pointer-events-none`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </button>
  );
};
