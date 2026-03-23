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
    <div className="rounded-[var(--radius-md)] border border-border-default bg-surface-primary px-3 py-2.5 shadow-md">
      <p className="text-[11px] font-medium text-text-tertiary mb-1.5">{label}</p>
      <div className="flex flex-col gap-1">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-[12px] text-text-secondary">{entry.name}</span>
            <span className="text-[12px] font-semibold text-text-primary ml-auto tabular-nums">
              {format(entry.value ?? 0)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
