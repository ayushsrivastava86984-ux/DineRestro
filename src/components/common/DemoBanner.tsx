import { Info } from 'lucide-react';

interface DemoBannerProps {
  title?: string;
  message: string;
}

export function DemoBanner({
  title = 'Phase 1 Frontend Preview — Demo Mode',
  message,
}: DemoBannerProps) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-[#FCEBDD] border border-[#EAD8C9] text-[#321D17]">
      <Info className="w-4 h-4 text-[#C84A1B] shrink-0 mt-0.5" aria-hidden="true" />
      <div className="text-xs leading-relaxed">
        <span className="font-semibold text-[#A83B19]">{title}: </span>
        <span className="text-[#6E4B41]">{message}</span>
      </div>
    </div>
  );
}
