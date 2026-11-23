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
    <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-[#F3F1ED] border border-[#E5E0D8] text-[#1C1917]">
      <Info className="w-4 h-4 text-[#6E1E2E] shrink-0 mt-0.5" aria-hidden="true" />
      <div className="text-xs leading-relaxed">
        <span className="font-semibold text-[#6E1E2E]">{title}: </span>
        <span className="text-[#57534E]">{message}</span>
      </div>
    </div>
  );
}
