import { useMemo, useState, useRef } from "react";
import {
  HOUSEHOLD_INCOME_DISTRIBUTION_BANDS as INCOME_DISTRIBUTION_BANDS,
  getIncomePercentileRange,
  rmBand,
} from "@/features/classification/domain/incomeBands";
import {
  EMPLOYEE_SALARY_DISTRIBUTION_BANDS,
  getIncomePercentileRange as getEmployeePercentileRange,
  rmBand as rmBandEmployee,
} from "@/features/tier/domain/employeeSalaryBands";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { Info, Medal } from "lucide-react";

export interface IncomeTier {
  code: string;
  name: string;
  minIncome: number;
  maxIncome: number;
  meanIncome: number;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const INCOME_TIERS: IncomeTier[] = [
  { code: "B40 (B1)", name: "B40 - Bottom 1", minIncome: 0, maxIncome: 2559, meanIncome: 1941, color: "text-red-700", bgColor: "bg-red-50", borderColor: "border-red-200" },
  { code: "B40 (B2)", name: "B40 - Bottom 2", minIncome: 2560, maxIncome: 3439, meanIncome: 3018, color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200" },
  { code: "B40 (B3)", name: "B40 - Bottom 3", minIncome: 3440, maxIncome: 4309, meanIncome: 3874, color: "text-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-200" },
  { code: "B40 (B4)", name: "B40 - Bottom 4", minIncome: 4310, maxIncome: 5249, meanIncome: 4771, color: "text-orange-500", bgColor: "bg-orange-50", borderColor: "border-orange-200" },
  { code: "M40 (M1)", name: "M40 - Middle 1", minIncome: 5250, maxIncome: 6339, meanIncome: 5782, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
  { code: "M40 (M2)", name: "M40 - Middle 2", minIncome: 6340, maxIncome: 7689, meanIncome: 6989, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
  { code: "M40 (M3)", name: "M40 - Middle 3", minIncome: 7690, maxIncome: 9449, meanIncome: 8536, color: "text-blue-500", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
  { code: "M40 (M4)", name: "M40 - Middle 4", minIncome: 9450, maxIncome: 11819, meanIncome: 10577, color: "text-blue-500", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
  { code: "T20 (T1)", name: "T20 - Top 1", minIncome: 11820, maxIncome: 15869, meanIncome: 13585, color: "text-green-600", bgColor: "bg-green-50", borderColor: "border-green-200" },
  { code: "T20 (T2)", name: "T20 - Top 2", minIncome: 15870, maxIncome: Infinity, meanIncome: 25719, color: "text-green-700", bgColor: "bg-green-50", borderColor: "border-green-200" },
];

export function determineIncomeTier(income: number): IncomeTier {
  for (const t of INCOME_TIERS) if (income >= t.minIncome && income <= t.maxIncome) return t;
  return INCOME_TIERS[0];
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const rm = (n: number) => `RM${Math.round(n).toLocaleString("en-MY")}`;

export const IncomeTierChart: React.FC<{ monthlyIncome: number }> = ({ monthlyIncome }) => {
  const CHART_H = 340, MIN_BAR = 8, RADIUS = 14, LABEL_GAP = 6, VALUE_H = 18, CURRENT_TAG_H = 22;
  const [showTable, setShowTable] = useState(false);
  const [tableKind, setTableKind] = useState<"household" | "employee">("household");
  const tablesRef = useRef<HTMLDivElement>(null);

  const handleDetailsClick = () => {
    const newShowTable = !showTable;
    setShowTable(newShowTable);

    // Scroll to tables after state update
    if (newShowTable) {
      setTimeout(() => {
        tablesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  };

  const maxMean = useMemo(() => Math.max(...INCOME_TIERS.map(t => t.meanIncome)), []);
  const currentTier = useMemo(() => determineIncomeTier(monthlyIncome), [monthlyIncome]);
  const { lo, hi } = useMemo(() => getIncomePercentileRange(monthlyIncome), [monthlyIncome]);
  const { lo: empLo, hi: empHi } = useMemo(() => getEmployeePercentileRange(monthlyIncome), [monthlyIncome]);

  const cols = useMemo(() => {
    return INCOME_TIERS.map(t => {
      const pct = clamp01(t.meanIncome / maxMean);
      // Reserve 60px at the top (CHART_H - 60) so "You" badge + value label fit
      let h = Math.max(MIN_BAR, Math.round((CHART_H - 60) * pct));
      if (t.code === "T20 (T2)") h = Math.round(h * 0.88);
      const isCurrent = t.code === currentTier.code;

      const grad =
        t.code.startsWith("B40") ? "from-red-400/80 to-rose-500/90" :
          t.code.startsWith("M40") ? "from-blue-400/80 to-indigo-500/90" :
            "from-emerald-400/80 to-teal-500/90";

      return { ...t, h, isCurrent, grad, v: rm(t.meanIncome) };
    });
  }, [currentTier, maxMean]);

  return (
    <TooltipProvider>
      <section className="bg-card border border-border rounded-2xl shadow-sm p-4">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-foreground">Your income position in Malaysia</h2>
        </div>

        {/* Combined Ranking Card */}
        <div className="bg-secondary/20 border border-border/50 rounded-xl p-4 shadow-sm relative group hover:border-border transition-colors mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Medal className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-foreground leading-relaxed">
                You earn more than{" "}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="underline decoration-dotted decoration-primary/50 cursor-help hover:decoration-primary transition-colors">
                      {100 - Math.round(hi)}% of households
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>For self-employed or combined family income ranking.</p>
                  </TooltipContent>
                </Tooltip>
                {" "}and{" "}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="underline decoration-dotted decoration-indigo-500/50 cursor-help hover:decoration-indigo-500 transition-colors">
                      {100 - Math.round(empHi)}% of employees
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>For individual salaried employees ranking.</p>
                  </TooltipContent>
                </Tooltip>
                .
              </div>
            </div>
            <button
              onClick={handleDetailsClick}
              className="text-xs font-bold text-primary hover:underline px-3 py-1 rounded-md hover:bg-primary/5 transition-colors"
            >
              {showTable ? "Hide" : "Details"}
            </button>
          </div>
        </div>

        <div
          className="relative overflow-hidden rounded-xl bg-secondary/10 border border-border"
          style={{ height: CHART_H + 36 }}
        >
          {/* Overlay Legend */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 p-3 rounded-lg bg-background/80 backdrop-blur-sm border border-border/40 shadow-sm text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-red-400 to-orange-500 shadow-sm"></span>
              <span className="font-medium">B40 (Bottom 40%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 shadow-sm"></span>
              <span className="font-medium">M40 (Middle 40%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-sm"></span>
              <span className="font-medium">T20 (Top 20%)</span>
            </div>
          </div>
          <div className="absolute left-0 right-0 top-0 bottom-9 grid grid-cols-10 gap-3 px-2 items-end">
            {cols.map(c => {
              // Stack labels directly above the bar without clamping
              const valueBottom = c.h + LABEL_GAP;
              const youBottom = valueBottom + VALUE_H + 2;

              return (
                <div key={c.code} className="relative flex items-end justify-center">
                  <div
                    className="absolute left-1/2 -translate-x-1/2 transition-all duration-500"
                    style={{ bottom: valueBottom }}
                  >
                    <span className="px-1.5 py-0.5 rounded border bg-card text-[10px] font-medium text-primary border-primary/20 shadow-sm">
                      {c.v}
                    </span>
                  </div>
                  {c.isCurrent && (
                    <div
                      className="absolute left-1/2 -translate-x-1/2 transition-all duration-500"
                      style={{ bottom: youBottom }}
                    >
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-primary-foreground bg-primary shadow-md ring-2 ring-white">
                        You
                      </span>
                    </div>
                  )}
                  <div
                    className={`w-full bg-gradient-to-t ${c.grad} shadow-sm border border-white/20 ${c.isCurrent
                      ? "ring-[3px] ring-primary/40 ring-offset-2 ring-offset-background z-20 shadow-[0_0_15px_rgba(16,185,129,0.3)] brightness-110"
                      : "opacity-80"
                      }`}
                    style={{ height: c.h, borderRadius: RADIUS }}
                    title={`${c.code} • ${c.v}`}
                    aria-label={`${c.code} mean income ${c.v}`}
                  />
                </div>
              );
            })}
          </div>

          <div className="absolute left-0 right-0 bottom-9 h-px bg-border" />
          <div className="absolute left-0 right-0 bottom-1 grid grid-cols-10 gap-3 px-2">
            {cols.map(c => (
              <div
                key={c.code}
                className={`text-[10px] sm:text-xs text-center font-semibold ${c.isCurrent ? "text-primary" : "text-muted-foreground"
                  }`}
              >
                {c.code}
              </div>
            ))}
          </div>
        </div>

        {/* Tables Section */}
        <div ref={tablesRef}>
          {/* Household bands table */}
          {showTable && tableKind === "household" && (
            <div id="income-bands-table" className="mt-3 border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs sm:text-sm">
                  <thead className="bg-secondary text-muted-foreground">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium">Income Class (RM)</th>
                      <th className="text-right px-3 py-2 font-medium">Band Share</th>
                      <th className="text-right px-3 py-2 font-medium">Cumulative Range</th>
                    </tr>
                  </thead>
                  <tbody>
                    {INCOME_DISTRIBUTION_BANDS.map((b, idx) => {
                      const isCurrent = monthlyIncome >= b.min && monthlyIncome <= b.max;
                      const bandShare = (b.cumHigh - b.cumLow).toFixed(1) + "%";
                      const cumRange = `${b.cumLow.toFixed(1)}%–${b.cumHigh.toFixed(1)}%`;
                      return (
                        <tr
                          key={idx}
                          className={"border-t border-border " + (isCurrent ? "bg-primary/10" : "bg-card")}
                        >
                          <td className="px-3 py-2 text-foreground">
                            {rmBand(b.min)} – {rmBand(b.max)}
                            {isCurrent && (
                              <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-semibold">
                                You
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums text-foreground">
                            {bandShare}
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums text-foreground">
                            {cumRange}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-3 py-2 text-[11px] text-muted-foreground bg-secondary border-t border-border">
                Source: Department of Statistics Malaysia (DOSM), Household Income Survey Report, 2024.
                Manual transcription from report figure.
              </div>
            </div>
          )}

          {/* Employee salary bands table */}
          {showTable && (
            <div id="employee-bands-table" className="mt-3 border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs sm:text-sm">
                  <thead className="bg-secondary text-muted-foreground">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium">Employee Salary Band (RM)</th>
                      <th className="text-right px-3 py-2 font-medium">Band Share</th>
                      <th className="text-right px-3 py-2 font-medium">Cumulative Range</th>
                    </tr>
                  </thead>
                  <tbody>
                    {EMPLOYEE_SALARY_DISTRIBUTION_BANDS.map((b, idx) => {
                      const isCurrent = monthlyIncome >= b.min && monthlyIncome <= b.max;
                      const bandShare = (b.cumHigh - b.cumLow).toFixed(1) + "%";
                      const cumRange = `${b.cumLow.toFixed(1)}%–${b.cumHigh.toFixed(1)}%`;
                      return (
                        <tr
                          key={idx}
                          className={"border-t border-border " + (isCurrent ? "bg-accent" : "bg-card")}
                        >
                          <td className="px-3 py-2 text-foreground">
                            {rmBandEmployee(b.min)} – {rmBandEmployee(b.max)}
                            {isCurrent && (
                              <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-accent text-accent-foreground font-semibold">
                                You
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums text-foreground">
                            {bandShare}
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums text-foreground">
                            {cumRange}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-3 py-2 text-[11px] text-muted-foreground bg-secondary border-t border-border">
                Source: Department of Statistics Malaysia (DOSM), Employee Wages Statistics Report, Second Quarter 2025. Manual transcription from report figure.
              </div>
            </div>
          )}
        </div>
      </section>
    </TooltipProvider>
  );
};
