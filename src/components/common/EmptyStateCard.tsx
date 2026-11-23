import type { LucideIcon } from 'lucide-react';
import { Utensils } from 'lucide-react';

interface EmptyStateCardProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyStateCard({
  icon: Icon = Utensils,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateCardProps) {
  return (
    <div className="bg-white border border-[#E5E0D8] rounded-lg p-10 text-center space-y-3">
      <div className="w-11 h-11 rounded-full bg-[#F3F1ED] border border-[#E5E0D8] text-[#6E1E2E] flex items-center justify-center mx-auto">
        <Icon className="w-5 h-5" aria-hidden="true" />
      </div>
      <h3 className="font-display text-2xl font-semibold text-[#1C1917]">{title}</h3>
      <p className="text-sm text-[#57534E] max-w-md mx-auto leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onAction}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522] transition-colors whitespace-nowrap"
          >
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
}
