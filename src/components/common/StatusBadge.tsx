import { CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status.toLowerCase();

  let style = 'bg-[#FFF6E9] text-[#292321] border-[#E8DDD1]';
  let Icon = Clock;

  if (
    normalized === 'confirmed' ||
    normalized === 'approved' ||
    normalized === 'completed' ||
    normalized === 'available' ||
    normalized === 'active' ||
    normalized === 'resolved'
  ) {
    style = 'bg-[#E7EFD9] text-[#292321] border-[#C8D8AC]';
    Icon = CheckCircle2;
  } else if (
    normalized === 'rejected' ||
    normalized === 'cancelled' ||
    normalized === 'declined' ||
    normalized === 'suspended' ||
    normalized === 'occupied'
  ) {
    style = 'bg-[#FDECEF] text-[#702C3A] border-[#F4A6B8]';
    Icon = XCircle;
  } else if (
    normalized === 'pending' ||
    normalized === 'pending review' ||
    normalized === 'in progress' ||
    normalized === 'reserved' ||
    normalized === 'open' ||
    normalized === 'proposal sent'
  ) {
    style = 'bg-[#FFF6E9] text-[#702C3A] border-[#E8DDD1]';
    Icon = normalized === 'open' ? AlertTriangle : Clock;
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
