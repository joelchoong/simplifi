import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface NetWorthChartProps {
  data: Array<{
    month: string;
    netWorth?: number;
    projected?: number;
  }>;
  height?: number;
}

const formatCurrency = (value: number) =>
  `RM ${Math.round(value).toLocaleString("en-MY", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

export function NetWorthChart({ data, height = 180 }: NetWorthChartProps) {
  const [range, setRange] = useState<string>("all");

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    data.forEach((d) => {
      const parts = d.month.split(" ");
      const year = parts[parts.length - 1];
      if (year && !isNaN(parseInt(year, 10))) years.add(year);
    });
    return Array.from(years).sort();
  }, [data]);

  const filteredData = useMemo(() => {
    if (range === "all" || !data.length) return data;
    return data.filter(d => d.month.endsWith(range));
  }, [data, range]);

  const monthAbbrevToNum: Record<string, string> = {
    "Jan": "1", "Feb": "2", "Mar": "3", "Apr": "4", "May": "5", "Jun": "6",
    "Jul": "7", "Aug": "8", "Sep": "9", "Sept": "9", "Oct": "10", "Nov": "11", "Dec": "12",
  };

  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

  const CustomXAxisTick = ({ x, y, payload }: any) => {
    const [month, year] = payload.value.split(" ");
    
    // find all indices that belong to this year
    const indicesForYear = filteredData.map((d, i) => d.month.endsWith(year) ? i : -1).filter(i => i !== -1);
    // find the middle index for this year
    const middleIndexForYear = indicesForYear[Math.floor(indicesForYear.length / 2)];
    const showYear = payload.index === middleIndexForYear;

    const displayMonth = isMobile ? (monthAbbrevToNum[month] || month) : month;

    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={12} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={isMobile ? 10 : 11}>
          {displayMonth}
        </text>
        {showYear && (
          <text x={0} y={0} dy={26} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={isMobile ? 10 : 11} fontWeight={500}>
            {year}
          </text>
        )}
      </g>
    );
  };

  if (!data.length) {
    return (
      <section className="rounded-lg border border-dashed border-border/60 p-4 text-center text-sm text-muted-foreground">
        Your net worth trend will appear here.
      </section>
    );
  }


  return (
    <div className="w-full">
      {/* Legend */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
          Net worth
        </div>
        {data.some(d => d.projected !== undefined) && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-2.5 h-[2px] bg-[#A3A3A3]" />
            Projection
          </div>
        )}
      </div>

      {/* Chart container with left-to-right reveal animation */}
      <motion.div 
        key={range} // Re-run animation when range changes
        initial={{ clipPath: "inset(0 100% 0 0)" }}
        animate={{ clipPath: "inset(0 0% 0 0)" }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ height: `${height}px` }} 
        className="w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 8, right: 8, bottom: 4, left: 4 }}>
            <defs>
              <linearGradient id="nwGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(158, 64%, 42%)" stopOpacity={0.12} />
                <stop offset="100%" stopColor="hsl(158, 64%, 42%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
              opacity={0.5}
            />
            <XAxis
              dataKey="month"
              tick={<CustomXAxisTick />}
              axisLine={false}
              tickLine={false}
              interval={0}
              minTickGap={0}
              height={40}
            />
            <YAxis
              tickFormatter={(value) =>
                value >= 1_000_000
                  ? `${(value / 1_000_000).toFixed(1)}M`
                  : `${Math.round(value / 1000)}k`
              }
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={64}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                formatCurrency(value),
                name === "netWorth" ? "Net Worth" : "Projected",
              ]}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600, fontSize: 12 }}
              contentStyle={{
                borderRadius: 10,
                border: "1px solid hsl(var(--border))",
                backgroundColor: "hsl(var(--card))",
                boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                fontSize: "12px",
                padding: "8px 12px",
              }}
            />
            <Area
              type="monotone"
              dataKey="netWorth"
              stroke="hsl(158, 64%, 42%)"
              strokeWidth={2}
              fill="url(#nwGradient)"
              dot={false}
              activeDot={{ r: 5, fill: "hsl(var(--card))", stroke: "hsl(158, 64%, 42%)", strokeWidth: 2.5 }}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="projected"
              stroke="#A3A3A3"
              strokeWidth={2}
              strokeDasharray="4 4"
              fill="transparent"
              dot={false}
              activeDot={{ r: 5, fill: "hsl(var(--card))", stroke: "#A3A3A3", strokeWidth: 2.5 }}
              connectNulls={true}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Time tabs */}
      <div className="flex gap-1 mt-3">
        {["all", ...availableYears].map((t) => (
          <button
            key={t}
            onClick={() => setRange(t)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors font-medium ${
              range === t
                ? "border-border text-foreground"
                : "border-transparent text-muted-foreground hover:bg-secondary/60"
            }`}
          >
            {t === "all" ? "All" : t}
          </button>
        ))}
      </div>
    </div>
  );
}

export default NetWorthChart;
