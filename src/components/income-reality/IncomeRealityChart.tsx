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

  // Bar chart: income vs baseline cost, stacked breakdown
  const maxVal = Math.max(monthlyIncome, baselineLifeCost) * 1.15;

  const incomeHeight = (monthlyIncome / maxVal) * 100;
  const essentialsHeight = (locationAdjusted / maxVal) * 100;
  const housingHeight = (housingCost / maxVal) * 100;
  const totalCostHeight = essentialsHeight + housingHeight;

  return (
    <div className="h-full flex flex-col">
      {/* Coverage badge */}
      <div className="flex items-center justify-between mb-4">
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

      {/* Bar chart */}
      <div className="flex-1 flex items-end justify-center gap-8 pb-8 pt-2 min-h-[260px]">
        {/* Income bar */}
        <div className="flex flex-col items-center gap-2 w-28">
          <span className="text-sm font-bold text-foreground">{formatRM(monthlyIncome)}</span>
          <div className="w-full rounded-t-xl overflow-hidden relative" style={{ height: `${incomeHeight}%` }}>
            <div className="absolute inset-0 bg-emerald-500/80 dark:bg-emerald-500/70" />
          </div>
          <span className="text-xs font-medium text-muted-foreground">Income</span>
        </div>

        {/* Baseline cost bar (stacked) */}
        <div className="flex flex-col items-center gap-2 w-28">
          <span className="text-sm font-bold text-foreground">{formatRM(baselineLifeCost)}</span>
          <div
            className="w-full rounded-t-xl overflow-hidden flex flex-col justify-end"
            style={{ height: `${totalCostHeight}%` }}
          >
            {/* Housing portion (top) */}
            {housingCost > 0 && (
              <div
                className="w-full bg-orange-400/80 dark:bg-orange-400/70 relative"
                style={{ height: `${(housingHeight / totalCostHeight) * 100}%` }}
              >
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white/90">
                  {housingHeight > 8 ? "Housing" : ""}
                </span>
              </div>
            )}
            {/* Essentials portion (bottom) */}
            <div
              className="w-full bg-red-400/80 dark:bg-red-400/70 relative"
              style={{ height: `${(essentialsHeight / totalCostHeight) * 100}%` }}
            >
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white/90">
                {essentialsHeight > 8 ? "Essentials" : ""}
              </span>
            </div>
          </div>
          <span className="text-xs font-medium text-muted-foreground">Life Cost</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center pt-2 border-t border-border">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-emerald-500/80" />
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
