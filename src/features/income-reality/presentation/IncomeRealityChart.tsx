import React from "react";
import { IncomeRealityResult } from "@/features/income-reality/domain/incomeRealityCalculations";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";

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

  // Recommended Breakdown Logic
  // 1. Target total is Max Spend rounded down to nearest 1000
  const recommendedTotal = Math.floor(sustainableWithdrawal / 1000) * 1000;

  // 2. Fixed costs (Housing + Essentials)
  const essentialsOnly = locationAdjusted - othersCost; // This is redundant with line 34, so remove line 34-37 block below and consolidate here

  // 3. Calculate "Others" as the remainder
  // If basics exceed recommended, Others is 0 (and total will exceed recommended)
  const recommendedOthers = Math.max(0, recommendedTotal - housingCost - essentialsOnly);

  // 4. Actual height of the recommended bar
  const recommendedBarTotal = housingCost + essentialsOnly + recommendedOthers;

  // Calculate max value with headroom
  const maxVal = Math.max(monthlyIncome, baselineLifeCost, sustainableWithdrawal, retirementDividends, recommendedBarTotal, 1000) * 1.15;

  const incomeHeight = (monthlyIncome / maxVal) * 100;
  const retirementIncomeHeight = (retirementDividends / maxVal) * 100;
  const sustainableSpendHeight = (sustainableWithdrawal / maxVal) * 100;

  // Breakdown heights for Today
  const essentialsHeight = (essentialsOnly / maxVal) * 100;
  const othersHeight = (othersCost / maxVal) * 100;
  const housingHeight = (housingCost / maxVal) * 100;
  const totalCostHeight = essentialsHeight + othersHeight + housingHeight;

  // Breakdown heights for Recommended
  const recHousingHeight = (housingCost / maxVal) * 100;
  const recEssentialsHeight = (essentialsOnly / maxVal) * 100;
  const recOthersHeight = (recommendedOthers / maxVal) * 100;
  const recTotalHeight = recHousingHeight + recEssentialsHeight + recOthersHeight;

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
        <div className="flex items-end justify-center gap-2 pb-2 h-full flex-1 w-full">
          {/* GROUP: TODAY */}
          <div className="flex items-end justify-center gap-3 px-2 py-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 h-full flex-1">
            {/* 1. Current Income */}
            <div className="flex flex-col items-center gap-1.5 w-20 h-full justify-end">
              <span className="text-[10px] font-bold text-foreground">{formatRM(monthlyIncome)}</span>
              <div
                className="w-full rounded-t-lg bg-emerald-500/80 dark:bg-emerald-500/70 shadow-sm flex items-center justify-center"
                style={{ height: `${Math.max(incomeHeight, 4)}%` }}
              >
                {Math.max(incomeHeight, 4) > 15 && <span className="text-[9px] font-bold text-white/90">Salary</span>}
              </div>
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
          <div className="flex items-end justify-center gap-3 px-2 py-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 h-full flex-1">
            {/* 3. Sustainable Spend (Max Spend) */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center gap-1.5 w-20 h-full justify-end cursor-help group">
                  <span className="text-[10px] font-bold text-foreground">{formatRM(sustainableWithdrawal)}</span>
                  <div
                    className="w-full rounded-t-lg bg-indigo-600/80 dark:bg-indigo-600/70 shadow-sm transition-opacity group-hover:opacity-80 flex items-center justify-center"
                    style={{ height: `${Math.max(sustainableSpendHeight, 4)}%` }}
                  >
                    {Math.max(sustainableSpendHeight, 4) > 15 && <span className="text-[8px] font-bold text-white/90 text-center px-1 leading-tight">Post Retirement Income</span>}
                  </div>
                  <span className="text-[9px] font-medium text-muted-foreground text-center leading-tight border-b border-dashed border-muted-foreground/30">Max Spend</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-[200px] text-xs">
                <p>The maximum monthly amount you can safely spend in retirement while ensuring your funds last until age 90.</p>
              </TooltipContent>
            </Tooltip>

            {/* 4. Recommended Breakdown */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center gap-1.5 w-20 h-full justify-end cursor-help group">
                  <span className="text-[10px] font-bold text-foreground">{formatRM(recommendedBarTotal)}</span>
                  <div
                    className="w-full rounded-t-lg overflow-hidden flex flex-col justify-end shadow-sm transition-opacity group-hover:opacity-80"
                    style={{ height: `${Math.max(recTotalHeight, 4)}%` }}
                  >
                    {housingCost > 0 && (
                      <div
                        className="w-full bg-orange-400/80 dark:bg-orange-400/70 flex items-center justify-center border-b border-white/10"
                        style={{ height: `${(recHousingHeight / recTotalHeight) * 100}%` }}
                      >
                        {recHousingHeight / recTotalHeight > 0.15 && <span className="text-[8px] font-bold text-white/90">Housing</span>}
                      </div>
                    )}
                    {recommendedOthers > 0 && (
                      <div
                        className="w-full bg-amber-500/80 dark:bg-amber-500/70 flex items-center justify-center border-b border-white/10"
                        style={{ height: `${(recOthersHeight / recTotalHeight) * 100}%` }}
                      >
                        {recOthersHeight / recTotalHeight > 0.15 && <span className="text-[8px] font-bold text-white/90">Others</span>}
                      </div>
                    )}
                    <div
                      className="w-full bg-red-400/80 dark:bg-red-400/70 flex items-center justify-center"
                      style={{ height: `${(recEssentialsHeight / recTotalHeight) * 100}%` }}
                    >
                      {recEssentialsHeight / recTotalHeight > 0.15 && <span className="text-[8px] font-bold text-white/90">Life Cost</span>}
                    </div>
                  </div>
                  <span className="text-[9px] font-medium text-muted-foreground text-center leading-tight border-b border-dashed border-muted-foreground/30">Recommended</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-[200px] text-xs">
                <p>Based on your Max Spend of {formatRM(recommendedTotal)}, here is a sustainable breakdown: {formatRM(essentialsOnly)} for basics, {formatRM(housingCost)} for housing, leaving {formatRM(recommendedOthers)} for other expenses.</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default IncomeRealityChart;
