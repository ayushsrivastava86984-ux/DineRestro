import { CheckCircle2, Clock, XCircle, AlertTriangle, Sparkles } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status.toLowerCase();

  let style = 'bg-[#FFF5EA] text-[#321D17] border-[#EAD8C9]';
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
    style = 'bg-[#E7EFD9] text-[#321D17] border-[#C8D8AC]';
    Icon = CheckCircle2;
  } else if (
    normalized === 'rejected' ||
    normalized === 'cancelled' ||
    normalized === 'declined' ||
    normalized === 'suspended' ||
    normalized === 'occupied' ||
    normalized === 'demo refunded'
  ) {
    style = 'bg-[#FDECE6] text-[#A83B19] border-[#F6B27B]';
    Icon = XCircle;
  } else if (
    normalized === 'quotation sent' ||
    normalized === 'preparing'
  ) {
    style = 'bg-[#FCEBDD] text-[#C84A1B] border-[#F6B27B]';
    Icon = Sparkles;
  } else if (
    normalized === 'open' ||
    normalized === 'advance pending' ||
    normalized === 'request received' ||
    normalized === 'inquiry received'
  ) {
    style = 'bg-[#FCEBDD] text-[#A83B19] border-[#EAD8C9]';
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
