import { CheckCircle2, Clock, XCircle, AlertTriangle, Sparkles } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status.toLowerCase();

  let style = 'bg-[#F3F1ED] text-[#57534E] border-[#D6CFC5]';
  let Icon = Clock;

  if (
    normalized === 'confirmed' ||
    normalized === 'approved' ||
    normalized === 'accepted' ||
    normalized === 'completed' ||
    normalized === 'available' ||
    normalized === 'active' ||
    normalized === 'resolved' ||
    normalized === 'advance paid' ||
    normalized === 'ready' ||
    normalized === 'quotation accepted' ||
    normalized === 'demo paid'
  ) {
    style = 'bg-[#ECF4EE] text-[#1E462A] border-[#BBD6C3]';
    Icon = CheckCircle2;
  } else if (
    normalized === 'rejected' ||
    normalized === 'cancelled' ||
    normalized === 'declined' ||
    normalized === 'suspended' ||
    normalized === 'occupied' ||
    normalized === 'demo refunded'
  ) {
    style = 'bg-[#FDF2F4] text-[#8B1E35] border-[#EAC4CC]';
    Icon = XCircle;
  } else if (
    normalized === 'quotation sent' ||
    normalized === 'preparing'
  ) {
    style = 'bg-[#F3F1ED] text-[#6E1E2E] border-[#D6CFC5]';
    Icon = Sparkles;
  } else if (
    normalized === 'open' ||
    normalized === 'advance pending' ||
    normalized === 'request received' ||
    normalized === 'inquiry received'
  ) {
    style = 'bg-[#F3F1ED] text-[#1C1917] border-[#D6CFC5]';
    Icon = AlertTriangle;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border whitespace-nowrap ${style}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{status}</span>
    </span>
  );
}
