import React from "react";
import { IncomeRealityResult } from "@/lib/incomeRealityCalculations";

interface IncomeRealityChartProps {
  result: IncomeRealityResult | null;
}

const formatRM = (val: number) =>
  `RM ${Math.abs(val).toLocaleString("en-MY", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const IncomeRealityChart: React.FC<IncomeRealityChartProps> = ({ result }) => {
  if (!result || result.monthlyIncome <= 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
        <p className="text-sm">Enter your income to see your coverage</p>
      </div>
    );
  }

  const { monthlyIncome, baselineLifeCost, surplus, coveragePercent, locationAdjusted, housingCost } = result;
  const isSurplus = surplus >= 0;

  // Fill percentages relative to income (capped at 100% each for the bar)
  const essentialsPct = Math.min((locationAdjusted / monthlyIncome) * 100, 100);
  const housingPct = Math.min((housingCost / monthlyIncome) * 100, 100 - essentialsPct);
  const totalFillPct = Math.min(((locationAdjusted + housingCost) / monthlyIncome) * 100, 100);
  const overBudget = baselineLifeCost > monthlyIncome;

  return (
    <div className="h-full flex flex-col">
      {/* Coverage badge */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${
              isSurplus
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "bg-red-500/15 text-red-600 dark:text-red-400"
            }`}
          >
            {coveragePercent.toFixed(0)}% coverage
          </span>
          <span className="text-xs text-muted-foreground">
            {isSurplus ? `${formatRM(surplus)} surplus` : `${formatRM(surplus)} shortfall`}
          </span>
        </div>
      </div>

      {/* Horizontal fill bars */}
      <div className="flex-1 flex flex-col justify-center gap-6">
        {/* Essentials bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Essentials</span>
            <span className="text-muted-foreground">{formatRM(locationAdjusted)}</span>
          </div>
          <div className="w-full h-10 rounded-lg bg-muted/60 overflow-hidden">
            <div
              className="h-full rounded-lg bg-red-400/80 dark:bg-red-400/70 transition-all duration-500 flex items-center px-3"
              style={{ width: `${Math.max(essentialsPct, 2)}%` }}
            >
              {essentialsPct > 15 && (
                <span className="text-xs font-bold text-white/90">{essentialsPct.toFixed(0)}%</span>
              )}
            </div>
          </div>
        </div>

        {/* Housing bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Housing</span>
            <span className="text-muted-foreground">{formatRM(housingCost)}</span>
          </div>
          <div className="w-full h-10 rounded-lg bg-muted/60 overflow-hidden">
            <div
              className="h-full rounded-lg bg-orange-400/80 dark:bg-orange-400/70 transition-all duration-500 flex items-center px-3"
              style={{ width: `${Math.max(housingCost > 0 ? (housingCost / monthlyIncome) * 100 : 0, housingCost > 0 ? 2 : 0)}%` }}
            >
              {(housingCost / monthlyIncome) * 100 > 15 && (
                <span className="text-xs font-bold text-white/90">{((housingCost / monthlyIncome) * 100).toFixed(0)}%</span>
              )}
            </div>
          </div>
        </div>

        {/* Total life cost bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-foreground">Total Life Cost</span>
            <span className={`font-semibold ${overBudget ? "text-red-500" : "text-foreground"}`}>
              {formatRM(baselineLifeCost)}
            </span>
          </div>
          <div className="w-full h-12 rounded-lg bg-muted/60 overflow-hidden">
            <div
              className={`h-full rounded-lg transition-all duration-500 flex items-center px-3 ${
                overBudget
                  ? "bg-red-500/80 dark:bg-red-500/70"
                  : "bg-emerald-500/80 dark:bg-emerald-500/70"
              }`}
              style={{ width: `${Math.max(Math.min(totalFillPct, 100), 2)}%` }}
            >
              {totalFillPct > 15 && (
                <span className="text-xs font-bold text-white/90">
                  {totalFillPct.toFixed(0)}% of income
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Grey area = your monthly income ({formatRM(monthlyIncome)})
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center pt-4 border-t border-border mt-4">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-muted/60" />
          <span className="text-xs text-muted-foreground">Income</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-red-400/80" />
          <span className="text-xs text-muted-foreground">Essentials</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-orange-400/80" />
          <span className="text-xs text-muted-foreground">Housing</span>
        </div>
      </div>
    </div>
  );
};

export default IncomeRealityChart;
