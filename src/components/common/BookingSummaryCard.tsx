import React from 'react';
import { StatusBadge } from './StatusBadge';

export interface SummaryMetaItem {
  label: string;
  value: string;
}

interface BookingSummaryCardProps {
  referenceId: string;
  title: string;
  subtitle: string;
  status: string;
  meta: SummaryMetaItem[];
  highlightNote?: string;
  actions?: React.ReactNode;
}

export function BookingSummaryCard({
  referenceId,
  title,
  subtitle,
  status,
  meta,
  highlightNote,
  actions,
}: BookingSummaryCardProps) {
  return (
    <article className="bg-white border border-[#E5E0D8] rounded-lg p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-mono font-semibold text-[#6E1E2E] tracking-wide">
            {referenceId}
          </p>
          <h3 className="font-display text-xl font-semibold text-[#1C1917] mt-0.5">
            {title}
          </h3>
          <p className="text-xs text-[#57534E] mt-0.5">{subtitle}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#E5E0D8] text-xs">
        {meta.map((item) => (
          <div key={item.label}>
            <dt className="text-[#57534E]">{item.label}</dt>
            <dd className="font-semibold text-[#1C1917] mt-0.5 tabular-nums">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>

      {highlightNote && (
        <p className="text-xs text-[#57534E] bg-[#F3F1ED] border border-[#E5E0D8] rounded px-3 py-2">
          {highlightNote}
        </p>
      )}

      {actions && (
        <div className="pt-2 border-t border-[#E5E0D8] flex flex-wrap items-center justify-between gap-3">
          {actions}
        </div>
      )}
    </article>
  );
}
