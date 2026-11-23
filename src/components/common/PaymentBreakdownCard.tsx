import { ShieldCheck } from 'lucide-react';

export interface PaymentBreakdownRow {
  label: string;
  value: string;
  accent?: boolean;
}

interface PaymentBreakdownCardProps {
  title: string;
  rows: PaymentBreakdownRow[];
  totalLabel: string;
  totalValue: string;
  footnote?: string;
  demoBadgeText?: string;
}

export function PaymentBreakdownCard({
  title,
  rows,
  totalLabel,
  totalValue,
  footnote,
  demoBadgeText = 'DEMO ONLY — Simulated pricing & receipt preview',
}: PaymentBreakdownCardProps) {
  return (
    <div className="border border-[#EAD8C9] rounded-lg p-4 sm:p-5 bg-[#FCEBDD]/45 space-y-3 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#EAD8C9]">
        <p className="text-sm font-semibold text-[#321D17]">{title}</p>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#C84A1B]">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{demoBadgeText}</span>
        </span>
      </div>

      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-4">
            <span className="text-[#6E4B41]">{row.label}</span>
            <span
              className={`tabular-nums text-right ${
                row.accent
                  ? 'font-semibold text-[#C84A1B]'
                  : 'font-medium text-[#321D17]'
              }`}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-baseline justify-between gap-4 pt-3 border-t border-[#EAD8C9]">
        <span className="text-sm font-semibold text-[#321D17]">{totalLabel}</span>
        <span className="font-mono text-base font-semibold text-[#C84A1B] tabular-nums">
          {totalValue}
        </span>
      </div>

      {footnote && (
        <p className="text-[11px] text-[#6E4B41] leading-relaxed">{footnote}</p>
      )}
    </div>
  );
}
