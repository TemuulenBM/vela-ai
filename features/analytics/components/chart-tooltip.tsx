interface ChartTooltipPayload {
  dataKey?: string | number;
  name?: string;
  value?: number;
  color?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: ChartTooltipPayload[];
  label?: string;
  valueFormatter?: (value: number) => string;
}

export function ChartTooltip({ active, payload, label, valueFormatter }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const format = valueFormatter ?? ((v: number) => v.toLocaleString());

  return (
    <div className="glass-card rounded-2xl px-4 py-3 border border-white/10">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-2">
        {label}
      </p>
      <div className="flex flex-col gap-1.5">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-[12px] text-white/60 font-light">{entry.name}</span>
            <span className="text-[13px] font-serif italic text-white ml-auto tabular-nums">
              {format(entry.value ?? 0)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
