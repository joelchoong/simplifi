import {
  Area,
  AreaChart,
  CartesianGrid,
  Label,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface NetWorthChartProps {
  data: Array<{
    month: string;
    netWorth: number;
  }>;
}

const formatCurrency = (value: number) =>
  `RM ${Math.round(value).toLocaleString("en-MY", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

export function NetWorthChart({ data }: NetWorthChartProps) {
  if (!data.length) {
    return (
      <section className="rounded-[10px] border border-dashed border-border/60 bg-card p-3 text-center text-sm text-muted-foreground shadow-sm">
        Your net worth trend will appear here once you’ve saved at least one month.
      </section>
    );
  }

  return (
    <section className="rounded-[10px] border border-border/60 bg-card p-3 shadow-sm">
      <div className="mb-2">
        <h3 className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Trend</h3>
      </div>

      <div className="h-[150px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 8, left: 6 }}>
            <defs>
              <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.45} />
            <XAxis
              dataKey="month"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              minTickGap={18}
              height={20}
            />
            <YAxis
              tickFormatter={(value) => `RM${Math.round(value / 1000)}k`}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={66}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), "Net Worth"]}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
              contentStyle={{
                borderRadius: 10,
                border: "1px solid hsl(var(--border))",
                backgroundColor: "hsl(var(--card))",
                boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
                fontSize: "11px",
              }}
            />
            <Area
              type="monotone"
              dataKey="netWorth"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#netWorthGradient)"
              dot={false}
              activeDot={{ r: 4, fill: "#059669", stroke: "hsl(var(--card))", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default NetWorthChart;
