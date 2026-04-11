import { useMemo } from "react";
import { NetWorthRecord } from "@/features/financial-records/domain/netWorth";

interface NetWorthSummaryProps {
  latestRecord: NetWorthRecord | null;
  monthlyChange: {
    absolute: number | null;
    percentage: number | null;
  };
}

const formatCurrency = (value: number) =>
  `RM ${Math.round(value).toLocaleString("en-MY", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

const formatCompactCurrency = (value: number) => {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `RM ${(value / 1_000_000).toFixed(1)}m`;
  if (abs >= 1_000) return `RM ${Math.round(value / 1_000)}k`;
  return formatCurrency(value);
};

export function NetWorthSummary({ latestRecord, monthlyChange }: NetWorthSummaryProps) {
  if (!latestRecord) {
    return (
      <section className="rounded-[10px] border border-dashed border-border/60 bg-card p-3 text-center text-sm text-muted-foreground shadow-sm">
        Add this month’s numbers to see your net worth, monthly change, and breakdown.
      </section>
    );
  }

  const isPositiveChange = (monthlyChange.absolute ?? 0) >= 0;
  const breakdownItems = [
    { label: "Cash", value: latestRecord.totalCash, accent: "#14B8A6" },
    { label: "Investments", value: latestRecord.totalInvestments, accent: "#6366F1" },
    { label: "EPF", value: latestRecord.epfAmount ?? 0, accent: "#8B5CF6" },
    { label: "Property", value: latestRecord.totalProperty, accent: "#F59E0B" },
    { label: "Liabilities", value: latestRecord.totalLiabilities, accent: "#EF4444" },
  ];
  const compositionTotal = useMemo(
    () => breakdownItems.reduce((sum, item) => sum + Math.max(item.value, 0), 0),
    [latestRecord],
  );

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <section className="rounded-[10px] border border-border/60 bg-card p-3 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Net Worth</p>
          <p className="mt-1 text-[26px] font-medium leading-none tracking-[-0.03em] text-foreground">
            {formatCurrency(latestRecord.netWorth)}
          </p>
          <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
            Cash, investments, EPF, property, less liabilities
          </p>
        </section>

        <section className="rounded-[10px] border border-border/60 bg-card p-3 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Monthly Change</p>
          {monthlyChange.absolute === null ? (
            <p className="mt-2 text-[12px] text-muted-foreground">No previous month to compare yet.</p>
          ) : (
            <>
              <div className="mt-1 flex items-center gap-2">
                <p className={`text-[22px] font-medium leading-none ${isPositiveChange ? "text-[#10B981]" : "text-rose-600"}`}>
                  {formatCurrency(Math.abs(monthlyChange.absolute))}
                </p>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${isPositiveChange ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" : "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"}`}>
                  {monthlyChange.percentage === null
                    ? "N/A"
                    : `${monthlyChange.percentage >= 0 ? "+" : ""}${monthlyChange.percentage.toFixed(1)}%`}
                </span>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">vs previous month</p>
            </>
          )}
        </section>
      </div>

      <section className="rounded-[10px] border border-border/60 bg-card p-3 shadow-sm">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Breakdown</p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {breakdownItems.map((item) => (
            <div key={item.label} className="pt-2" style={{ borderTop: `2px solid ${item.accent}` }}>
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
              <p className="mt-1 text-[13px] font-medium text-foreground">{formatCompactCurrency(item.value)}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {compositionTotal > 0 ? `${Math.round((item.value / compositionTotal) * 100)}%` : "0%"}
              </p>
              <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: compositionTotal > 0 ? `${(item.value / compositionTotal) * 100}%` : "0%",
                    backgroundColor: item.accent,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default NetWorthSummary;
