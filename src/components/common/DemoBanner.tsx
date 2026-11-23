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
    <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-[#FFF6E9] border border-[#E8DDD1] text-[#292321]">
      <Info className="w-4 h-4 text-[#702C3A] shrink-0 mt-0.5" aria-hidden="true" />
      <div className="text-xs leading-relaxed">
        <span className="font-semibold text-[#702C3A]">{title}: </span>
        <span className="text-[#6B5F5C]">{message}</span>
      </div>
    </div>
  );
}
