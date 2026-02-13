import React from "react";
import { IncomeRealityResult } from "@/lib/incomeRealityCalculations";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface IncomeRealityChartProps {
  result: IncomeRealityResult | null;
  sustainableWithdrawal: number;
  retirementDividends: number;
}

const formatRM = (val: number) =>
  `RM ${Math.abs(val).toLocaleString("en-MY", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const IncomeRealityChart: React.FC<IncomeRealityChartProps> = ({ result, sustainableWithdrawal, retirementDividends }) => {
  if (!result || result.monthlyIncome <= 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
        <p className="text-sm">Enter your income to see your coverage</p>
      </div>
    );
  }

  const { monthlyIncome, baselineLifeCost, surplus, coveragePercent, locationAdjusted, othersCost, housingCost } = result;

  // Calculate max value with some headroom (15%)
  // Ensure we don't divide by zero if all values are 0
  const maxVal = Math.max(monthlyIncome, baselineLifeCost, sustainableWithdrawal, retirementDividends, 1000) * 1.15;

  const incomeHeight = (monthlyIncome / maxVal) * 100;
  const retirementIncomeHeight = (retirementDividends / maxVal) * 100;
  const sustainableSpendHeight = (sustainableWithdrawal / maxVal) * 100;

  const essentialsOnly = locationAdjusted - othersCost;
  const essentialsHeight = (essentialsOnly / maxVal) * 100;
  const othersHeight = (othersCost / maxVal) * 100;
  const housingHeight = (housingCost / maxVal) * 100;
  const totalCostHeight = essentialsHeight + othersHeight + housingHeight;

  return (
    <div className="h-full flex flex-col">
      {/* Group Headers */}
      <div className="flex justify-between mb-4 px-2">
        <div className="flex-1 flex flex-col items-center border-b-2 border-emerald-500/20 pb-1">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Today</span>
        </div>
        <div className="w-8" />
        <div className="flex-1 flex flex-col items-center border-b-2 border-indigo-500/20 pb-1">
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Retirement</span>
        </div>
      </div>

      {/* Bar chart */}
      <TooltipProvider delayDuration={0}>
        <div className="flex items-end justify-center gap-4 pb-8 pt-2" style={{ height: 240 }}>
          {/* GROUP: TODAY */}
          <div className="flex items-end gap-3 px-2 py-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 h-full">
            {/* 1. Current Income */}
            <div className="flex flex-col items-center gap-1.5 w-20 h-full justify-end">
              <span className="text-[10px] font-bold text-foreground">{formatRM(monthlyIncome)}</span>
              <div
                className="w-full rounded-t-lg bg-emerald-500/80 dark:bg-emerald-500/70 shadow-sm"
                style={{ height: `${Math.max(incomeHeight, 4)}%` }}
              />
              <span className="text-[9px] font-medium text-muted-foreground text-center leading-tight">Income</span>
            </div>

            {/* 2. Today's Life Cost */}
            <div className="flex flex-col items-center gap-1.5 w-20 h-full justify-end">
              <span className="text-[10px] font-bold text-foreground">{formatRM(baselineLifeCost)}</span>
              <div
                className="w-full rounded-t-lg overflow-hidden flex flex-col justify-end shadow-sm"
                style={{ height: `${Math.max(totalCostHeight, 4)}%` }}
              >
                {housingCost > 0 && (
                  <div
                    className="w-full bg-orange-400/80 dark:bg-orange-400/70 flex items-center justify-center border-b border-white/10"
                    style={{ height: `${(housingHeight / totalCostHeight) * 100}%` }}
                  >
                    {housingHeight / totalCostHeight > 0.15 && <span className="text-[8px] font-bold text-white/90">Housing</span>}
                  </div>
                )}
                {othersCost > 0 && (
                  <div
                    className="w-full bg-amber-500/80 dark:bg-amber-500/70 flex items-center justify-center border-b border-white/10"
                    style={{ height: `${(othersHeight / totalCostHeight) * 100}%` }}
                  >
                    {othersHeight / totalCostHeight > 0.15 && <span className="text-[8px] font-bold text-white/90">Others</span>}
                  </div>
                )}
                <div
                  className="w-full bg-red-400/80 dark:bg-red-400/70 flex items-center justify-center"
                  style={{ height: `${(essentialsHeight / totalCostHeight) * 100}%` }}
                >
                  {essentialsHeight / totalCostHeight > 0.15 && <span className="text-[8px] font-bold text-white/90">Life Cost</span>}
                </div>
              </div>
              <span className="text-[9px] font-medium text-muted-foreground text-center leading-tight">Expenses</span>
            </div>
          </div>

          {/* SPACER */}
          <div className="w-2" />

          {/* GROUP: RETIREMENT */}
          <div className="flex items-end gap-3 px-2 py-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 h-full">
            {/* 3. Retirement Income (Dividends) */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center gap-1.5 w-20 h-full justify-end cursor-help group">
                  <span className="text-[10px] font-bold text-foreground">{formatRM(retirementDividends)}</span>
                  <div
                    className="w-full rounded-t-lg bg-violet-400/80 dark:bg-violet-400/70 shadow-sm transition-opacity group-hover:opacity-80"
                    style={{ height: `${Math.max(retirementIncomeHeight, 4)}%` }}
                  />
                  <span className="text-[9px] font-medium text-muted-foreground text-center leading-tight border-b border-dashed border-muted-foreground/30">Passive Div</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-[200px] text-xs">
                <p>Projected monthly passive income from EPF dividends at retirement.</p>
              </TooltipContent>
            </Tooltip>

            {/* 4. Sustainable Spend (New Life Cost) */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center gap-1.5 w-20 h-full justify-end cursor-help group">
                  <span className="text-[10px] font-bold text-foreground">{formatRM(sustainableWithdrawal)}</span>
                  <div
                    className="w-full rounded-t-lg bg-indigo-600/80 dark:bg-indigo-600/70 shadow-sm transition-opacity group-hover:opacity-80"
                    style={{ height: `${Math.max(sustainableSpendHeight, 4)}%` }}
                  />
                  <span className="text-[9px] font-medium text-muted-foreground text-center leading-tight border-b border-dashed border-muted-foreground/30">Max Spend</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-[200px] text-xs">
                <p>The maximum safe monthly withdrawal amount that ensures your funds last until age 90.</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>

      {/* Simplified Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center pt-3 border-t border-border/50 text-[9px] uppercase tracking-wider font-bold">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/80" />
          <span className="text-muted-foreground">Salary</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-red-400/80" />
          <span className="text-muted-foreground">Life Costs</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-violet-400/80" />
          <span className="text-muted-foreground">Dividends</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-indigo-600/80" />
          <span className="text-muted-foreground">Total Spend (90yo)</span>
        </div>
      </div>
    </div>
  );
};

export default IncomeRealityChart;
