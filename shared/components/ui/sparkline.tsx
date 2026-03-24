"use client";

import { useId, useMemo } from "react";
import { AreaChart, Area, YAxis } from "recharts";
import { cn } from "@/shared/lib/utils";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

function Sparkline({
  data,
  width = 80,
  height = 32,
  color = "rgba(255, 255, 255, 0.7)",
  className,
}: SparklineProps) {
  const chartData = useMemo(() => data.map((value, index) => ({ index, value })), [data]);

  const reactId = useId();
  const gradientId = `spark-${reactId.replace(/:/g, "")}`;

  if (!data.length) return null;

  return (
    <div className={cn("shrink-0", className)}>
      <AreaChart
        data={chartData}
        width={width}
        height={height}
        margin={{ top: 2, right: 0, bottom: 2, left: 0 }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis domain={["dataMin", "dataMax"]} hide />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#${gradientId})`}
          fillOpacity={1}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </div>
  );
}

export { Sparkline, type SparklineProps };
