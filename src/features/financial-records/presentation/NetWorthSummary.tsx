import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { Info, ChevronLeft, ChevronRight, RotateCcw, WalletCards } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { NetWorthRecord, calculateNettIncome } from "@/features/financial-records/domain/netWorth";
import { NetWorthChart } from "./NetWorthChart";

/* ── Helpers ── */

const formatCurrency = (value: number) =>
  `RM ${Math.abs(Math.round(value)).toLocaleString()}`;

const formatCompact = (value: number) =>
  value >= 1_000_000
    ? `RM ${(value / 1_000_000).toFixed(1)}M`
    : `RM ${Math.round(value / 1000)}k`;

const pct = (part: number, whole: number) =>
  whole > 0 ? ((part / whole) * 100).toFixed(1) : "0.0";

/* ── Donut chart colours ── */
const INVEST_COLORS = ["#378ADD", "#1D9E75", "#7F77DD", "#F59E0B"];

/* ── Component ── */

interface NetWorthSummaryProps {
  latestRecord: NetWorthRecord | null;
  previousRecord: NetWorthRecord | null;
  monthlyChange: { absolute: number | null; percentage: number | null };
  income: number;
  expenses: number;
  chartData: Array<{ month: string; netWorth: number; actualMonth?: string }>;
  allChartData: Array<{ month: string; netWorth: number; actualMonth?: string }>;
  selectedMonth: string;
  currentMonth: string;
  earliestMonth: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onResetMonth: () => void;
}

export function NetWorthSummary({
  latestRecord,
  previousRecord,
  monthlyChange,
  income,
  expenses,
  chartData,
  allChartData,
  selectedMonth,
  currentMonth,
  earliestMonth,
  onPrevMonth,
  onNextMonth,
  onResetMonth,
}: NetWorthSummaryProps) {
  if (!latestRecord) {
    return (
      <section className="rounded-lg border border-dashed border-border/60 bg-card p-6 text-center text-sm text-muted-foreground">
        Add this month's numbers to see your net worth, monthly change, and breakdown.
      </section>
    );
  }

  const netWorth = latestRecord.netWorth;
  const changeValue = monthlyChange.absolute ?? 0;
  const isPositive = changeValue >= 0;

  const cash = latestRecord.totalCash;
  const investments = latestRecord.totalInvestments;
  const property = latestRecord.totalProperty;
  const epf = latestRecord.epfAmount || 0;
  const debt = latestRecord.totalLiabilities;

  const grossAssets = cash + investments + property + epf;
  const totalInvestValue = investments + property + epf;

  const prevAssets = previousRecord
    ? previousRecord.totalCash + previousRecord.totalInvestments + previousRecord.totalProperty + (previousRecord.epfAmount || 0)
    : grossAssets;
  const prevDebt = previousRecord ? previousRecord.totalLiabilities : debt;

  const assetChange = grossAssets - prevAssets;
  const nettIncome = calculateNettIncome(income);
  const cashSurplus = nettIncome - expenses;
  const totalNetChange = changeValue;

  const prevCash = previousRecord ? previousRecord.totalCash : cash;
  const actualCashChange = cash - prevCash;
  const unaccountedCashDifference = actualCashChange - cashSurplus;

  const runwayMonths = expenses > 0 ? cash / expenses : 0;
  const monthlySavings = nettIncome - expenses;
  
  const [yearStr, monthStr] = selectedMonth.split('-');
  const remainingMonths = 12 - parseInt(monthStr, 10);
  // yearEndProjection is now derived from projectedChartData below to match the chart trajectory
  
  const debtToAssetRatio = grossAssets > 0 ? (debt / grossAssets) * 100 : 0;

  const monthLabel = new Intl.DateTimeFormat("en-MY", { month: "long", year: "numeric" }).format(
    new Date(`${selectedMonth}T00:00:00`)
  );

  /* --- Asset donut data --- */
  const investData = useMemo(() => {
    const items = [
      { name: "Stocks / ETFs", value: investments, color: INVEST_COLORS[0] },
      { name: "Property", value: property, color: INVEST_COLORS[1] },
      { name: "EPF", value: epf, color: INVEST_COLORS[2] },
      { name: "Cash", value: cash, color: INVEST_COLORS[3] },
    ].filter((d) => d.value > 0);
    return items;
  }, [investments, property, epf, cash]);

  const projectedChartData = useMemo(() => {
    if (!allChartData.length) return [];
    
    type AugmentedData = typeof allChartData[0] & { projected?: number };
    const augmentedData: AugmentedData[] = allChartData.map(d => ({ ...d, projected: undefined }));
    
    // Find the first record of the current year to act as baseline
    const yearStartDataIndex = augmentedData.findIndex(d => d.actualMonth?.startsWith(yearStr));
    
    if (yearStartDataIndex !== -1) {
      const baseNW = augmentedData[yearStartDataIndex].netWorth!;
      const startMonthNum = parseInt(augmentedData[yearStartDataIndex].actualMonth!.split('-')[1], 10);
      
      // Calculate the projected trend line across all recorded months of this year
      for (let i = yearStartDataIndex; i < augmentedData.length; i++) {
        const itemMonthNum = parseInt(augmentedData[i].actualMonth!.split('-')[1], 10);
        augmentedData[i].projected = baseNW + ((itemMonthNum - startMonthNum) * monthlySavings);
      }
      
      // Extrapolate the line to the end of the year
      const lastIndex = augmentedData.length - 1;
      const lastActualMonthNum = parseInt(augmentedData[lastIndex].actualMonth!.split('-')[1], 10);
      
      for (let m = lastActualMonthNum + 1; m <= 12; m++) {
        const projNW = baseNW + ((m - startMonthNum) * monthlySavings);
        const pMonthString = `${yearStr}-${m.toString().padStart(2, '0')}-01`;
        const pMonthLabel = new Intl.DateTimeFormat("en-MY", { month: "short", year: "numeric" }).format(new Date(pMonthString));
        augmentedData.push({
          month: pMonthLabel,
          actualMonth: pMonthString,
          netWorth: undefined, // No actual recorded net worth yet
          projected: projNW
        } as AugmentedData);
      }
    }
    
    return augmentedData;
  }, [allChartData, monthlySavings, yearStr]);

  const yearEndItem = projectedChartData[projectedChartData.length - 1];
  const yearEndProjection = yearEndItem?.projected ?? 0;

  if (!latestRecord) return null;

  return (
    <div className="bg-card rounded-2xl border border-border/60 overflow-hidden shadow-sm">
      {/* ════════════════════════════════════════════════════════
          1. HERO SECTION
         ════════════════════════════════════════════════════════ */}
      <div className="p-6 pb-4">
        <div className="grid grid-cols-3 items-center mb-3">
          <div className="flex items-center gap-2">
            <WalletCards className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-bold text-foreground tracking-tight">Net Worth Overview</h2>
          </div>
          
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-1 rounded-full bg-secondary/30 p-0.5 border border-border/40">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={selectedMonth <= earliestMonth ? "cursor-not-allowed" : ""}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full hover:bg-background/80"
                        onClick={onPrevMonth}
                        disabled={selectedMonth <= earliestMonth}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {selectedMonth <= earliestMonth && (
                    <TooltipContent>No earlier records available</TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>

              <div className="px-2 min-w-[100px] text-center">
                <span className="text-[11px] font-bold uppercase tracking-[0.07em] text-muted-foreground/80">
                  {monthLabel}
                </span>
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={selectedMonth >= currentMonth ? "cursor-not-allowed" : ""}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full hover:bg-background/80"
                        onClick={onNextMonth}
                        disabled={selectedMonth >= currentMonth}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {selectedMonth >= currentMonth && (
                    <TooltipContent>Future records are not available yet</TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="flex justify-end">
            {selectedMonth !== currentMonth && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full hover:bg-background/80 text-muted-foreground hover:text-emerald-500"
                      onClick={onResetMonth}
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">Reset to current month</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        <div className="flex items-baseline gap-3 flex-wrap mb-2">
          <span className="text-4xl sm:text-[52px] font-medium tracking-tight leading-none text-foreground">
            {netWorth < 0 ? "−" : ""}
            {formatCurrency(netWorth)}
          </span>
          {monthlyChange.absolute !== null && (
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                isPositive
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
              }`}
            >
              {isPositive ? "▲" : "▼"} {formatCurrency(changeValue)} this month
            </span>
          )}
        </div>

        {/* ── Year-end projection ── */}
        <div className="text-[13px] text-muted-foreground mt-4 flex items-center flex-wrap gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
          Projected year-end net worth ({yearStr}):{" "}
          <span className="font-medium text-foreground">
            {formatCurrency(yearEndProjection)}
          </span>
          {remainingMonths > 0 && yearEndProjection > 0 && (
            <span className={yearEndProjection >= netWorth ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
              ({(yearEndProjection - netWorth) >= 0 ? "+" : "−"}{formatCompact(Math.abs(yearEndProjection - netWorth))} from now)
            </span>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          2. TREND CHART
         ════════════════════════════════════════════════════════ */}
      <div className="px-6 sm:px-8 pb-4">
        <NetWorthChart data={projectedChartData} height={180} />
      </div>

      <hr className="border-border/60" />

      {/* ════════════════════════════════════════════════════════
          3. BALANCE SHEET
         ════════════════════════════════════════════════════════ */}
      <div className="px-6 sm:px-8 py-6">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.07em] text-muted-foreground mb-3">
          Balance sheet
        </h2>

        {/* Metric tiles */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-secondary/50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
              <span className="w-[7px] h-[7px] rounded-full bg-[#378ADD]" />
              Liquid
            </div>
            <div className="text-lg font-medium">{formatCurrency(cash)}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {pct(cash, grossAssets)}% of gross assets
            </div>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
              <span className="w-[7px] h-[7px] rounded-full bg-emerald-500" />
              Investments
            </div>
            <div className="text-lg font-medium">{formatCurrency(totalInvestValue)}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {pct(totalInvestValue, grossAssets)}% of gross assets
            </div>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
              <span className="w-[7px] h-[7px] rounded-full bg-red-500" />
              Debt
            </div>
            <div className="text-lg font-medium text-red-600 dark:text-red-400">
              ({formatCurrency(debt)})
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {debtToAssetRatio.toFixed(1)}% debt-to-assets
            </div>
          </div>
        </div>

        {/* Asset bar */}
        <div className="flex h-2 rounded-full gap-0.5 overflow-hidden mb-6">
          {cash > 0 && <div style={{ flex: cash }} className="bg-[#378ADD] rounded-full" />}
          {totalInvestValue > 0 && <div style={{ flex: totalInvestValue }} className="bg-emerald-500 rounded-full" />}
          {debt > 0 && <div style={{ flex: debt }} className="bg-red-500 rounded-full" />}
        </div>

        {/* Investment donut + breakdown */}
        {investData.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            {/* Donut */}
            <div className="relative w-[140px] h-[140px] flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={investData}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={65}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {investData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid hsl(var(--border))",
                      backgroundColor: "hsl(var(--card))",
                      fontSize: 12,
                      padding: "6px 10px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-muted-foreground">Assets</span>
                <span className="text-sm font-medium">{formatCompact(grossAssets)}</span>
              </div>
            </div>

            {/* Breakdown list */}
            <div className="flex-1 space-y-0 w-full">
              {investData.map((item) => (
                <div
                  key={item.name}
                  className="flex justify-between items-center py-2.5 border-b border-border/40 last:border-b-0 text-[13px]"
                >
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <span
                      className="w-[7px] h-[7px] rounded-full flex-shrink-0"
                      style={{ background: item.color }}
                    />
                    {item.name}
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(item.value)}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {pct(item.value, grossAssets)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <hr className="border-border/60" />

      {/* ════════════════════════════════════════════════════════
          4. BOTTOM ROW: Monthly Flow + Financial Buffer
         ════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-6 sm:px-8 py-6">
        {/* Monthly Flow */}
        <div className="lg:col-span-7">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.07em] text-muted-foreground mb-3">
            Monthly flow
          </h2>

          <div>
            {/* Income */}
            <div className="flex justify-between items-center py-2.5 border-b border-border/40 text-[13px]">
              <span className="text-muted-foreground">Nett income</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                +{formatCurrency(nettIncome)}
              </span>
            </div>

            {/* Expenses */}
            <div className="flex justify-between items-center py-2.5 border-b border-border/40 text-[13px]">
              <span className="text-muted-foreground">Expenses</span>
              <span className="font-medium text-red-600 dark:text-red-400">
                −{formatCurrency(expenses)}
              </span>
            </div>

            {/* Cash surplus */}
            <div className="flex justify-between items-center py-2.5 border-b border-border/40 text-[13px]">
              <span className="font-medium text-foreground">Cash surplus</span>
              <span
                className={`font-medium ${
                  cashSurplus >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {cashSurplus >= 0 ? "+" : "−"}
                {formatCurrency(cashSurplus)}
              </span>
            </div>

            {/* Difference with actual */}
            {monthlyChange.absolute !== null && previousRecord && (
              <div className="flex justify-between items-start py-2.5 border-b border-border/40 text-[13px]">
                <div>
                  <div className="text-muted-foreground">Unaccounted difference</div>
                  <div className="text-[11px] text-muted-foreground/70 mt-0.5">
                    Difference vs. actual cash change
                  </div>
                </div>
                <span
                  className={`font-medium flex-shrink-0 ${
                    unaccountedCashDifference >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {unaccountedCashDifference >= 0 ? "+" : "−"}
                  {formatCurrency(Math.abs(unaccountedCashDifference))}
                </span>
              </div>
            )}



            {/* Total net change */}
            {monthlyChange.absolute !== null && (
              <div className="flex justify-between items-center py-2.5 text-[13px]">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-foreground">Total net change</span>
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-muted-foreground hover:text-foreground outline-none">
                          <Info className="w-3.5 h-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[280px]">
                        <p>Total Net Change is calculated by subtracting your previous month's Net Worth from your current month's Net Worth.</p>
                        <p className="mt-1 text-muted-foreground">(Net Worth = Cash + Investments + Property + EPF - Liabilities)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <span
                  className={`font-medium ${
                    isPositive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {isPositive ? "+" : "−"}
                  {formatCurrency(totalNetChange)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Financial Buffer */}
        <div className="lg:col-span-5">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.07em] text-muted-foreground mb-3">
            Financial buffer
          </h2>

          <div className="bg-secondary/50 rounded-xl p-5 mb-3">
            <div className="text-4xl font-medium text-emerald-600 dark:text-emerald-400 leading-none">
              {runwayMonths > 99 ? "99+" : runwayMonths.toFixed(1)}
            </div>
            <div className="text-[13px] text-muted-foreground mt-1 mb-4">months liquid runway</div>
            <div className="text-[11px] text-muted-foreground leading-relaxed">
              {formatCurrency(cash)} liquid
              <br />÷ {formatCurrency(expenses)}/mo expenses
              <br />= {runwayMonths.toFixed(1)} months liquid only
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NetWorthSummary;
