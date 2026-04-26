import React, { useEffect, useState } from "react";
import { IncomeRealityResult } from "@/features/money-health/income-reality/domain/incomeRealityCalculations";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";

interface IncomeRealityChartProps {
  result: IncomeRealityResult | null;
  sustainableWithdrawal: number;
  retirementDividends: number;
  nettPay?: number;
}

const formatRM = (val: number) =>
  `RM ${Math.abs(val).toLocaleString("en-MY", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const BAR_TRANSITION = "height 900ms cubic-bezier(0.165, 0.84, 0.44, 1), opacity 300ms ease-out";

const IncomeRealityChart: React.FC<IncomeRealityChartProps> = ({ result, sustainableWithdrawal, retirementDividends, nettPay }) => {
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    if (!result || result.monthlyIncome <= 0) {
      setIsAnimated(false);
      return;
    }

    setIsAnimated(false);
    const timeoutId = window.setTimeout(() => setIsAnimated(true), 40);
    return () => window.clearTimeout(timeoutId);
  }, [result, sustainableWithdrawal, retirementDividends, nettPay]);

  if (!result || result.monthlyIncome <= 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
        <p className="text-sm">Enter your income to see your coverage</p>
      </div>
    );
  }

  const { monthlyIncome, baselineLifeCost, surplus, coveragePercent, locationAdjusted, othersCost, entertainmentCost, housingCost } = result;

  // Use nett pay for the income bar if provided, otherwise fall back to gross
  const displayIncome = nettPay !== undefined && nettPay > 0 ? nettPay : monthlyIncome;

  // Split life cost: essentials = locationAdjusted - othersCost - entertainmentCost
  const pureEssentials = locationAdjusted - othersCost - entertainmentCost;

  // Recommended Breakdown Logic
  const recommendedTotal = Math.floor(sustainableWithdrawal / 1000) * 1000;
  const essentialsOnly = pureEssentials + entertainmentCost; // for recommended calc
  const recommendedOthers = Math.max(0, recommendedTotal - housingCost - essentialsOnly);
  const recommendedBarTotal = housingCost + essentialsOnly + recommendedOthers;

  // Calculate max value with headroom
  const maxVal = Math.max(displayIncome, baselineLifeCost, sustainableWithdrawal, retirementDividends, recommendedBarTotal, 1000) * 1.15;

  const incomeHeight = (displayIncome / maxVal) * 100;
  const sustainableSpendHeight = (sustainableWithdrawal / maxVal) * 100;

  // Breakdown heights for Today
  const pureEssentialsHeight = (pureEssentials / maxVal) * 100;
  const entertainmentHeight = (entertainmentCost / maxVal) * 100;
  const othersHeight = (othersCost / maxVal) * 100;
  const housingHeight = (housingCost / maxVal) * 100;
  const totalCostHeight = pureEssentialsHeight + entertainmentHeight + othersHeight + housingHeight;

  // Breakdown heights for Recommended
  const recHousingHeight = (housingCost / maxVal) * 100;
  const recEssentialsHeight = (pureEssentials / maxVal) * 100;
  const recEntertainmentHeight = (entertainmentCost / maxVal) * 100;
  const recOthersHeight = (recommendedOthers / maxVal) * 100;
  const recTotalHeight = recHousingHeight + recEssentialsHeight + recEntertainmentHeight + recOthersHeight;

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
        <div className="flex items-end justify-center gap-1.5 sm:gap-2 pb-2 h-full flex-1 w-full">
          {/* GROUP: TODAY */}
          <div className="flex items-end justify-center gap-1.5 sm:gap-3 px-1.5 sm:px-2 py-2 sm:py-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 h-full flex-1">
            {/* 1. Current Income */}
            <div className="flex flex-col items-center gap-1 sm:gap-1.5 w-14 sm:w-20 h-full justify-end group">
              <span className="text-[10px] font-bold text-foreground">{formatRM(displayIncome)}</span>
              <div
                className="w-full rounded-t-lg bg-emerald-500/80 dark:bg-emerald-500/70 shadow-sm flex items-center justify-center transition-[height,background-color,box-shadow] duration-300 group-hover:bg-emerald-500 group-hover:shadow-md"
                style={{
                  height: `${isAnimated ? Math.max(incomeHeight, 4) : 0}%`,
                  opacity: isAnimated ? 1 : 0.4,
                  transition: BAR_TRANSITION,
                  transitionDelay: "100ms",
                }}
              >
                {Math.max(incomeHeight, 4) > 15 && <span className="text-[9px] font-bold text-white/90">Nett Pay</span>}
              </div>
              <span className="text-[9px] font-medium text-muted-foreground text-center leading-tight">Income</span>
            </div>

            {/* 2. Today's Life Cost */}
            <div className="flex flex-col items-center gap-1 sm:gap-1.5 w-14 sm:w-20 h-full justify-end group">
              <span className="text-[10px] font-bold text-foreground">{formatRM(baselineLifeCost)}</span>
              <div
                className="w-full rounded-t-lg overflow-hidden flex flex-col justify-end shadow-sm"
                style={{
                  height: `${isAnimated ? Math.max(totalCostHeight, 4) : 0}%`,
                  opacity: isAnimated ? 1 : 0.4,
                  transition: BAR_TRANSITION,
                  transitionDelay: "200ms",
                }}
              >
                {housingCost > 0 && (
                  <div
                    className="w-full bg-orange-400/80 dark:bg-orange-400/70 flex items-center justify-center border-b border-white/10 transition-all cursor-default hover:brightness-110"
                    style={{ height: `${(housingHeight / totalCostHeight) * 100}%` }}
                  >
                    {housingHeight / totalCostHeight > 0.15 && <span className="text-[8px] font-bold text-white/90">Housing</span>}
                  </div>
                )}
                {othersCost > 0 && (
                  <div
                    className="w-full bg-amber-500/80 dark:bg-amber-500/70 flex items-center justify-center border-b border-white/10 transition-all cursor-default hover:brightness-110"
                    style={{ height: `${(othersHeight / totalCostHeight) * 100}%` }}
                  >
                    {othersHeight / totalCostHeight > 0.15 && <span className="text-[8px] font-bold text-white/90">Others</span>}
                  </div>
                )}
                {entertainmentCost > 0 && (
                  <div
                    className="w-full bg-purple-400/80 dark:bg-purple-400/70 flex items-center justify-center border-b border-white/10 transition-all cursor-default hover:brightness-110"
                    style={{ height: `${(entertainmentHeight / totalCostHeight) * 100}%` }}
                  >
                    <span className="text-[8px] font-bold text-white/90">Entertain</span>
                  </div>
                )}
                <div
                  className="w-full bg-red-400/80 dark:bg-red-400/70 flex items-center justify-center transition-all cursor-default hover:brightness-110"
                  style={{ height: `${(pureEssentialsHeight / totalCostHeight) * 100}%` }}
                >
                  {pureEssentialsHeight / totalCostHeight > 0.12 && <span className="text-[8px] font-bold text-white/90">Essentials</span>}
                </div>
              </div>
              <span className="text-[9px] font-medium text-muted-foreground text-center leading-tight">Expenses</span>
            </div>
          </div>

          {/* SPACER */}
          <div className="w-2" />

          {/* GROUP: RETIREMENT */}
          <div className="flex items-end justify-center gap-1.5 sm:gap-3 px-1.5 sm:px-2 py-2 sm:py-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 h-full flex-1">
            {/* 3. Sustainable Spend (Max Spend) */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div onClick={(e) => e.preventDefault()} className="flex flex-col items-center gap-1 sm:gap-1.5 w-14 sm:w-20 h-full justify-end cursor-help group">
                  <span className="text-[10px] font-bold text-foreground">{formatRM(sustainableWithdrawal)}</span>
                  <div
                    className="w-full rounded-t-lg bg-indigo-600/80 dark:bg-indigo-600/70 shadow-sm transition-[height,background-color,box-shadow] duration-300 group-hover:bg-indigo-600 group-hover:shadow-md flex items-center justify-center"
                    style={{
                      height: `${isAnimated ? Math.max(sustainableSpendHeight, 4) : 0}%`,
                      opacity: isAnimated ? 1 : 0.4,
                      transition: BAR_TRANSITION,
                      transitionDelay: "300ms",
                    }}
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
                <div onClick={(e) => e.preventDefault()} className="flex flex-col items-center gap-1 sm:gap-1.5 w-14 sm:w-20 h-full justify-end cursor-help group">
                  <span className="text-[10px] font-bold text-foreground">{formatRM(recommendedBarTotal)}</span>
                  <div
                    className="w-full rounded-t-lg overflow-hidden flex flex-col justify-end shadow-sm group-hover:shadow-md transition-shadow duration-300"
                    style={{
                      height: `${isAnimated ? Math.max(recTotalHeight, 4) : 0}%`,
                      opacity: isAnimated ? 1 : 0.4,
                      transition: BAR_TRANSITION,
                      transitionDelay: "400ms",
                    }}
                  >
                    {housingCost > 0 && (
                      <div
                        className="w-full bg-orange-400/80 dark:bg-orange-400/70 flex items-center justify-center border-b border-white/10 transition-all hover:brightness-110"
                        style={{ height: `${(recHousingHeight / recTotalHeight) * 100}%` }}
                      >
                        <span className="text-[8px] font-bold text-white/90">Housing</span>
                      </div>
                    )}
                    {recommendedOthers > 0 && (
                      <div
                        className="w-full bg-amber-500/80 dark:bg-amber-500/70 flex items-center justify-center border-b border-white/10 transition-all hover:brightness-110"
                        style={{ height: `${(recOthersHeight / recTotalHeight) * 100}%` }}
                      >
                        {recOthersHeight / recTotalHeight > 0.15 && <span className="text-[8px] font-bold text-white/90">Others</span>}
                      </div>
                    )}
                    {entertainmentCost > 0 && (
                      <div
                        className="w-full bg-purple-400/80 dark:bg-purple-400/70 flex items-center justify-center border-b border-white/10 transition-all hover:brightness-110"
                        style={{ height: `${(recEntertainmentHeight / recTotalHeight) * 100}%` }}
                      >
                        <span className="text-[8px] font-bold text-white/90">Entertain</span>
                      </div>
                    )}
                    <div
                      className="w-full bg-red-400/80 dark:bg-red-400/70 flex items-center justify-center transition-all hover:brightness-110"
                      style={{ height: `${(recEssentialsHeight / recTotalHeight) * 100}%` }}
                    >
                      {recEssentialsHeight / recTotalHeight > 0.12 && <span className="text-[8px] font-bold text-white/90">Essentials</span>}
                    </div>
                  </div>
                  <span className="text-[9px] font-medium text-muted-foreground text-center leading-tight border-b border-dashed border-muted-foreground/30">Recommended</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-[220px] text-xs space-y-1">
                <p className="font-semibold">Recommended: {formatRM(recommendedBarTotal)}/mo</p>
                {housingCost > 0 && <p className="text-orange-500">Housing: {formatRM(housingCost)}</p>}
                <p className="text-red-400">Essentials: {formatRM(pureEssentials)}</p>
                <p className="text-purple-400">Entertainment: {formatRM(entertainmentCost)}</p>
                {recommendedOthers > 0 && <p className="text-amber-500">Others: {formatRM(recommendedOthers)}</p>}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default IncomeRealityChart;
