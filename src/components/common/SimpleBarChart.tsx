interface ChartDatum {
  label: string;
  value: number;
  subLabel?: string;
}

interface SimpleBarChartProps {
  title: string;
  subtitle: string;
  data: ChartDatum[];
  formatValue?: (val: number) => string;
  barColor?: string;
}

export function SimpleBarChart({
  title,
  subtitle,
  data,
  formatValue = (v) => String(v),
  barColor = '#6E1E2E',
}: SimpleBarChartProps) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="bg-white border border-[#E5E0D8] rounded-lg p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-5">
        <div>
          <h3 className="text-lg font-semibold text-[#1C1917]">{title}</h3>
          <p className="text-xs text-[#57534E] mt-0.5">{subtitle}</p>
        </div>
        <span className="text-xs font-mono text-[#6E1E2E] border border-[#E5E0D8] bg-[#F3F1ED] px-2 py-0.5 rounded">
          DEMO DATA
        </span>
      </div>

      <div className="grid grid-cols-7 gap-2 sm:gap-3 items-end h-44 pt-4">
        {data.map((item) => {
          const heightPct = Math.max(8, Math.round((item.value / maxVal) * 100));
          return (
            <div
              key={item.label}
              className="flex flex-col items-center justify-end h-full group"
            >
              <span className="text-[11px] font-mono tabular-nums text-[#57534E] mb-1.5 opacity-90">
                {formatValue(item.value)}
              </span>
              <div className="w-full flex-1 flex items-end">
                <div
                  className="w-full rounded-t transition-opacity duration-150 group-hover:opacity-85"
                  style={{
                    height: `${heightPct}%`,
                    backgroundColor: barColor,
                  }}
                  title={`${item.label}: ${formatValue(item.value)}`}
                />
              </div>
              <span className="text-xs font-medium text-[#1C1917] mt-2">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
