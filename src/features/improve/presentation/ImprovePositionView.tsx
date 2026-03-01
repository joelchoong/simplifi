import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Search,
  Compass,
  TrendingUp,
  Rocket,
  MapPin,
  Lightbulb,
  CheckCircle2,
  Info,
  Check,
  ArrowRight,
  Heart,
  ThumbsUp,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import {
  calculateIncomeReality,
  ExpenseAssumptions,
  DEFAULT_EXPENSES,
  HouseholdType,
  Location,
} from "@/features/income-reality/domain/incomeRealityCalculations";
import { calculateSustainableWithdrawal } from "@/features/retirement/domain/epfCalculations";
import { calculateNettPay } from "@/features/classification/domain/nettPayCalculation";

type Phase = "stabilise" | "strengthen" | "scale";

interface PositionSummary {
  surplus: number;
  housingRatio: number;
  retirementMaxSpend: number;
  currentSpend: number;
  primaryConstraint: string;
  housingCost: number;
  essentialsCost: number;
  entertainmentCost: number;
  othersCost: number;
}

interface ImprovePositionViewProps {
  monthlyIncome: number;
  housingCost: number;
  currentEPF: number;
  age: number;
  householdType: string;
  dependants: number;
  location: string;
  expenses: ExpenseAssumptions;
}

const T20_MIN_INCOME = 13585;

function getPhase(surplus: number, nettPay: number): Phase {
  if (surplus < 0) return "stabilise";
  if (nettPay < T20_MIN_INCOME) return "strengthen";
  return "scale";
}

const phaseConfig: Record<
  Phase,
  {
    icon: React.ReactNode;
    label: string;
    description: string;
    color: string;
    bgClass: string;
    borderClass: string;
    badgeClass: string;
  }
> = {
  stabilise: {
    icon: <Compass className="w-5 h-5" />,
    label: "Stabilise",
    description: "You're in deficit. Focus on reaching break-even first.",
    color: "text-phase-stabilise",
    bgClass: "bg-phase-stabilise/10",
    borderClass: "border-phase-stabilise/20",
    badgeClass: "bg-phase-stabilise/10 text-phase-stabilise border-phase-stabilise/20",
  },
  strengthen: {
    icon: <TrendingUp className="w-5 h-5" />,
    label: "Strengthen",
    description: "You're break-even or in surplus. Build your financial foundation.",
    color: "text-phase-strengthen",
    bgClass: "bg-phase-strengthen/10",
    borderClass: "border-phase-strengthen/20",
    badgeClass: "bg-phase-strengthen/10 text-phase-strengthen border-phase-strengthen/20",
  },
  scale: {
    icon: <Rocket className="w-5 h-5" />,
    label: "Scale",
    description: "Your foundation is solid. Now grow your wealth deliberately.",
    color: "text-phase-scale",
    bgClass: "bg-phase-scale/10",
    borderClass: "border-phase-scale/20",
    badgeClass: "bg-phase-scale/10 text-phase-scale border-phase-scale/20",
  },
};

const phaseOrder: Phase[] = ["stabilise", "strengthen", "scale"];

const phaseDetails: Record<Phase, { meaning: string; focusAreas: string[]; next?: { phase: Phase; hint: string } }> = {
  stabilise: {
    meaning: "You're spending more than you earn. The priority is to close the gap and reach break-even.",
    focusAreas: ["Cut non-essential spending", "Increase monthly income", "Restructure housing costs"],
    next: { phase: "strengthen", hint: "once you reach break-even" },
  },
  strengthen: {
    meaning: "You're covering your expenses. Now it's time to build a buffer and grow your financial security.",
    focusAreas: ["Build 3–6 months emergency fund", "Increase monthly income", "Reduce high-interest debt"],
    next: { phase: "scale", hint: "once your foundation is solid" },
  },
  scale: {
    meaning: "Your foundation is solid. You can now focus on growing wealth and optimising for retirement.",
    focusAreas: ["Diversify investments", "Maximise retirement contributions", "Build passive income streams"],
  },
};

function formatRM(amount: number): string {
  const abs = Math.round(Math.abs(amount));
  const formatted = `RM${abs.toLocaleString("en-MY")}`;
  return amount < 0 ? `–${formatted}` : formatted;
}

interface Advisor {
  initials: string;
  name: string;
  title: string;
  experience: string;
  badges: { label: string; variant: "sc" | "fimm" | "cfa" }[];
  matchReason: string;
  tags: { label: string; isMatch: boolean }[];
  location: string;
  avatarColor: string;
}

const mockAdvisors: Advisor[] = [
  {
    initials: "AH",
    name: "Ahmad Hafiz",
    title: "Licensed Financial Planner",
    experience: "8 years exp.",
    badges: [{ label: "SC Licensed", variant: "sc" }],
    matchReason:
      "Specialises in young earners in the Stabilise phase — budgeting, housing decisions, and EPF optimisation.",
    tags: [
      { label: "Housing decisions", isMatch: true },
      { label: "B40–M40 earners", isMatch: false },
      { label: "EPF planning", isMatch: false },
      { label: "Debt management", isMatch: false },
    ],
    location: "KL / Klang Valley",
    avatarColor: "bg-emerald-600",
  },
  {
    initials: "NR",
    name: "Nurul Raziah",
    title: "Wealth Consultant",
    experience: "5 years exp.",
    badges: [{ label: "FIMM", variant: "fimm" }],
    matchReason: "Focuses on income growth strategies and lifestyle restructuring for people in deficit.",
    tags: [
      { label: "Income growth", isMatch: true },
      { label: "Lifestyle budgeting", isMatch: false },
      { label: "Unit trust", isMatch: false },
      { label: "Emergency fund", isMatch: false },
    ],
    location: "Petaling Jaya · Online available",
    avatarColor: "bg-violet-600",
  },
];

const badgeStyles: Record<string, string> = {
  sc: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800",
  fimm: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800",
  cfa: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-800",
};

const AdvisorCard: React.FC<{ advisor: Advisor }> = ({ advisor }) => (
  <div className="border border-border/60 rounded-xl p-4 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer space-y-3">
    {/* Top row */}
    <div className="flex items-start gap-3">
      <div
        className={`w-11 h-11 rounded-full ${advisor.avatarColor} flex items-center justify-center text-white font-bold text-sm shrink-0`}
      >
        {advisor.initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-foreground">{advisor.name}</p>
        <p className="text-xs text-muted-foreground">
          {advisor.title} · {advisor.experience}
        </p>
      </div>
      <div className="flex gap-1.5 shrink-0">
        {advisor.badges.map((b) => (
          <Badge key={b.label} variant="outline" className={`text-[10px] font-semibold ${badgeStyles[b.variant]}`}>
            <CheckCircle2 className="w-3 h-3 mr-0.5" />
            {b.label}
          </Badge>
        ))}
      </div>
    </div>

    {/* Match reason */}
    <div className="flex items-start gap-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg px-3 py-2">
      <Lightbulb className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
      <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">{advisor.matchReason}</p>
    </div>

    {/* Tags */}
    <div className="flex flex-wrap gap-1.5">
      {advisor.tags.map((tag) => (
        <span
          key={tag.label}
          className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${tag.isMatch
              ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-300"
              : "bg-secondary/50 border-border/40 text-muted-foreground"
            }`}
        >
          {tag.label}
        </span>
      ))}
    </div>

    {/* Bottom */}
    <div className="flex items-center justify-between pt-1">
      <span className="text-xs text-muted-foreground flex items-center gap-1">
        <MapPin className="w-3 h-3" />
        {advisor.location}
      </span>
      <Button size="sm" className="h-8 text-xs font-semibold rounded-lg px-4">
        Connect →
      </Button>
    </div>
  </div>
);

const PRICE_OPTIONS = ["Free", "RM10", "RM20", "RM50"];

const InterestCapture: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [customValue, setCustomValue] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [frequency, setFrequency] = useState<"once" | "monthly">("monthly");

  const displayPrice = isCustom && customValue ? `RM${customValue}` : selectedPrice;
  const displayLabel = displayPrice
    ? displayPrice === "Free"
      ? "Free"
      : `${displayPrice}${frequency === "monthly" ? "/mo" : " one-time"}`
    : null;

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 px-4 rounded-xl border border-primary/20 bg-primary/5 text-center">
        <ThumbsUp className="w-6 h-6 text-primary" />
        <p className="text-sm font-semibold text-foreground">Thanks for your interest!</p>
        <p className="text-xs text-muted-foreground max-w-[280px]">
          We'll notify you when advisor matching is available.
          {displayLabel && displayLabel !== "Free" && (
            <span className="block mt-1">
              You indicated you'd pay <strong className="text-foreground">{displayLabel}</strong> for this.
            </span>
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 py-4 px-4 rounded-xl border border-border/60 bg-secondary/20">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-[10px] font-bold border-primary/30 text-primary bg-accent">
          Coming Soon
        </Badge>
        <span className="text-xs text-muted-foreground">We're onboarding licensed advisors.</span>
      </div>

      <p className="text-sm text-foreground font-medium">Would you find this valuable?</p>

      <div className="space-y-2">
        <p className="text-[11px] text-muted-foreground font-medium">
          How much would you pay for personalised advisor matching?
        </p>
        <div className="flex flex-wrap gap-1.5">
          {PRICE_OPTIONS.map((price) => (
            <button
              key={price}
              onClick={() => {
                setSelectedPrice(selectedPrice === price ? null : price);
                setIsCustom(false);
                setCustomValue("");
              }}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${!isCustom && selectedPrice === price
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary/50 text-muted-foreground border-border/60 hover:border-primary/40 hover:text-foreground"
                }`}
            >
              {price}
            </button>
          ))}
          <button
            onClick={() => {
              setIsCustom(true);
              setSelectedPrice(null);
            }}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${isCustom
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary/50 text-muted-foreground border-border/60 hover:border-primary/40 hover:text-foreground"
              }`}
          >
            Other
          </button>
        </div>

        {isCustom && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground font-medium">RM</span>
            <input
              type="number"
              min="1"
              placeholder="Enter amount"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              className="h-8 w-24 rounded-md border border-border/60 bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        )}

        {/* Frequency toggle – show when a non-free price is picked */}
        {((selectedPrice && selectedPrice !== "Free" && !isCustom) || (isCustom && customValue)) && (
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="text-[11px] text-muted-foreground font-medium mr-1">Pay</span>
            {(["once", "monthly"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFrequency(f)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${frequency === f
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary/50 text-muted-foreground border-border/60 hover:border-primary/40 hover:text-foreground"
                  }`}
              >
                {f === "once" ? "One-time" : "Per month"}
              </button>
            ))}
          </div>
        )}
      </div>

      <Button size="sm" className="w-full h-9 text-sm font-semibold rounded-lg mt-1" onClick={() => setSubmitted(true)}>
        <Heart className="w-4 h-4 mr-1.5" />
        Yes, I want this!
      </Button>
    </div>
  );
};

const ImprovePositionView: React.FC<ImprovePositionViewProps> = ({
  monthlyIncome,
  housingCost,
  currentEPF,
  age,
  householdType,
  dependants,
  location: userLocation,
  expenses,
}) => {
  const position: PositionSummary = useMemo(() => {
    const nett = calculateNettPay(monthlyIncome, age);

    const reality = calculateIncomeReality(
      nett,
      housingCost,
      householdType as HouseholdType,
      dependants,
      userLocation as Location,
      expenses,
    );

    const housingRatio = nett > 0 ? Math.round((housingCost / nett) * 100) : 0;

    let retirementMaxSpend = 0;
    if (age >= 18 && age <= 60 && monthlyIncome > 0) {
      retirementMaxSpend = calculateSustainableWithdrawal({
        currentAge: age,
        retirementAge: 60,
        targetAge: 90,
        monthlyIncome,
        currentEPFAmount: currentEPF,
      });
    }

    // Determine primary constraint (first match wins)
    const expenseRatio = nett > 0 ? (reality.baselineLifeCost / nett) * 100 : 0;
    let primaryConstraint = "None";
    if (reality.surplus < 0) primaryConstraint = "Lifestyle";
    else if (housingRatio > 30) primaryConstraint = "Housing";
    else if (monthlyIncome < 5782) primaryConstraint = "Stability Income";
    else if (expenseRatio >= 60) primaryConstraint = "Cashflow";
    else if (monthlyIncome < 13585) primaryConstraint = "Expansion Income";

    // Essentials = locationAdjusted - others - entertainment (food + transport + utilities adjusted)
    const essentialsCost = reality.locationAdjusted - reality.othersCost - reality.entertainmentCost;

    return {
      surplus: reality.surplus,
      housingRatio,
      retirementMaxSpend,
      currentSpend: reality.baselineLifeCost,
      primaryConstraint,
      housingCost: reality.housingCost,
      essentialsCost,
      entertainmentCost: reality.entertainmentCost,
      othersCost: reality.othersCost,
    };
  }, [monthlyIncome, housingCost, currentEPF, age, householdType, dependants, userLocation, expenses]);

  const nettPay = useMemo(() => calculateNettPay(monthlyIncome, age), [monthlyIncome, age]);
  const phase = getPhase(position.surplus, nettPay);
  const config = phaseConfig[phase];

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Phase Banner */}
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${config.bgClass} ${config.borderClass}`}>
        <div className={config.color}>{config.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-bold text-sm ${config.color}`}>{config.label}</span>
            <Badge variant="outline" className={`text-[10px] font-semibold ${config.badgeClass}`}>
              Current Phase
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{config.description}</p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <button
              className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 cursor-pointer transition-colors hover:bg-background/50 ${config.borderClass}`}
            >
              <Info className={`w-4 h-4 ${config.color}`} />
            </button>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="end" className="w-80 p-0">
            {/* Header */}
            <div className="px-4 pt-4 pb-3 border-b border-border/40">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2.5 h-2.5 rounded-full bg-phase-${phase}`}
                  style={{ backgroundColor: `hsl(var(--phase-${phase}))` }}
                />
                <span className={`font-bold text-base ${config.color}`}>{config.label}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Phase {phaseOrder.indexOf(phase) + 1} of 3</p>
            </div>

            {/* Stepper */}
            <div className="px-4 py-3 border-b border-border/40">
              <div className="flex items-center justify-between">
                {phaseOrder.map((p, i) => {
                  const isCurrent = p === phase;
                  const isCompleted = phaseOrder.indexOf(p) < phaseOrder.indexOf(phase);
                  const pConfig = phaseConfig[p];
                  return (
                    <React.Fragment key={p}>
                      {i > 0 && (
                        <div
                          className={`flex-1 h-0.5 mx-1.5 rounded-full ${isCompleted ? `bg-phase-${phaseOrder[i - 1]}` : "bg-border"}`}
                          style={
                            isCompleted ? { backgroundColor: `hsl(var(--phase-${phaseOrder[i - 1]}))` } : undefined
                          }
                        />
                      )}
                      <div className="flex flex-col items-center gap-1.5">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${isCompleted
                              ? "bg-phase-stabilise text-white border-transparent"
                              : isCurrent
                                ? "border-transparent text-white"
                                : "border-border bg-secondary/50 text-muted-foreground"
                            }`}
                          style={
                            isCompleted
                              ? { backgroundColor: `hsl(var(--phase-${p}))` }
                              : isCurrent
                                ? { backgroundColor: `hsl(var(--phase-${p}))` }
                                : undefined
                          }
                        >
                          {isCompleted ? <Check className="w-4 h-4" /> : i + 1}
                        </div>
                        <span
                          className={`text-[11px] font-semibold ${isCurrent ? config.color : isCompleted ? "text-foreground" : "text-muted-foreground"}`}
                        >
                          {pConfig.label}
                        </span>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* What this means */}
            <div className="px-4 py-3 space-y-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  What this means
                </p>
                <p className="text-sm text-foreground leading-relaxed">{phaseDetails[phase].meaning}</p>
              </div>

              {/* Focus areas */}
              <div className={`rounded-lg border p-3 ${config.bgClass} ${config.borderClass}`}>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${config.color} mb-2`}>Focus Areas</p>
                <ul className="space-y-1.5">
                  {phaseDetails[phase].focusAreas.map((area) => (
                    <li key={area} className="flex items-start gap-2 text-sm text-foreground">
                      <span
                        className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0`}
                        style={{ backgroundColor: `hsl(var(--phase-${phase}))` }}
                      />
                      {area}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Next phase hint */}
              {phaseDetails[phase].next && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>
                    Next:{" "}
                    <strong className="text-foreground">{phaseConfig[phaseDetails[phase].next!.phase].label}</strong> —{" "}
                    {phaseDetails[phase].next!.hint}
                  </span>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left: Position Summary */}
        <div className="lg:col-span-5">
          <Card className="shadow-sm border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Search className="h-5 w-5 text-primary" />
                Your Position Today
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" onClick={(e) => e.preventDefault()}>
                        <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-[220px] p-2">
                      <p className="text-xs">
                        A snapshot of your financial health based on your current income, expenses, and retirement
                        projections.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Horizontal Income Bar */}
              {(() => {
                const isDeficit = position.surplus < 0;
                const housingPct = nettPay > 0 ? (position.housingCost / nettPay) * 100 : 0;
                const essentialsPct = nettPay > 0 ? (position.essentialsCost / nettPay) * 100 : 0;
                const entertainmentPct = nettPay > 0 ? (position.entertainmentCost / nettPay) * 100 : 0;
                const othersPct = nettPay > 0 ? (position.othersCost / nettPay) * 100 : 0;
                const totalSpendPct = housingPct + essentialsPct + entertainmentPct + othersPct;
                const surplusPct = Math.max(0, 100 - totalSpendPct);
                const overflowPct = isDeficit && nettPay > 0 ? ((position.currentSpend - nettPay) / nettPay) * 100 : 0;
                // In deficit: scale all segments to fit within bar including a deficit indicator
                // Reserve a portion for the deficit segment (proportional to overflow)
                const deficitReserve = isDeficit
                  ? Math.min((overflowPct / (totalSpendPct + overflowPct)) * 100, 25)
                  : 0;
                const scale = totalSpendPct > 0 ? (100 - deficitReserve) / totalSpendPct : 1;

                return (
                  <div className="py-3 px-3 rounded-xl bg-secondary/30 border border-border/40 space-y-2">
                    <div className="relative">
                      <TooltipProvider delayDuration={0}>
                        <div className="w-full h-8 rounded-lg bg-primary/10 border border-primary/20 overflow-hidden flex relative">
                          {/* Housing */}
                          {position.housingCost > 0 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  onClick={(e) => e.preventDefault()}
                                  className="h-full bg-orange-500/75 flex items-center justify-center first:rounded-l-lg cursor-default hover:brightness-110 transition-all"
                                  style={{ width: `${housingPct * scale}%` }}
                                >
                                  {housingPct * scale > 12 && (
                                    <span className="text-[9px] font-bold text-white truncate px-0.5">
                                      Housing {Math.round(housingPct)}%
                                    </span>
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="text-xs">
                                <p className="font-semibold">Housing: {formatRM(position.housingCost)}</p>
                                <p className="text-muted-foreground">{Math.round(housingPct)}% of nett pay</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {/* Essentials */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                onClick={(e) => e.preventDefault()}
                                className="h-full bg-destructive/65 flex items-center justify-center cursor-default hover:brightness-110 transition-all"
                                style={{ width: `${essentialsPct * scale}%` }}
                              >
                                {essentialsPct * scale > 12 && (
                                  <span className="text-[9px] font-bold text-white truncate px-0.5">
                                    Essentials {Math.round(essentialsPct)}%
                                  </span>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="text-xs">
                              <p className="font-semibold">Essentials: {formatRM(position.essentialsCost)}</p>
                              <p className="text-muted-foreground">{Math.round(essentialsPct)}% of nett pay</p>
                            </TooltipContent>
                          </Tooltip>
                          {/* Entertainment */}
                          {position.entertainmentCost > 0 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  onClick={(e) => e.preventDefault()}
                                  className="h-full bg-purple-500/70 flex items-center justify-center cursor-default hover:brightness-110 transition-all"
                                  style={{ width: `${entertainmentPct * scale}%` }}
                                >
                                  {entertainmentPct * scale > 12 && (
                                    <span className="text-[9px] font-bold text-white truncate px-0.5">
                                      Entertain {Math.round(entertainmentPct)}%
                                    </span>
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="text-xs">
                                <p className="font-semibold">Entertainment: {formatRM(position.entertainmentCost)}</p>
                                <p className="text-muted-foreground">{Math.round(entertainmentPct)}% of nett pay</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {/* Others */}
                          {position.othersCost > 0 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  onClick={(e) => e.preventDefault()}
                                  className="h-full bg-amber-500/70 flex items-center justify-center cursor-default hover:brightness-110 transition-all"
                                  style={{ width: `${othersPct * scale}%` }}
                                >
                                  {othersPct * scale > 10 && (
                                    <span className="text-[9px] font-bold text-white truncate px-0.5">
                                      Others {Math.round(othersPct)}%
                                    </span>
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="text-xs">
                                <p className="font-semibold">Others: {formatRM(position.othersCost)}</p>
                                <p className="text-muted-foreground">{Math.round(othersPct)}% of nett pay</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {/* Surplus */}
                          {!isDeficit && surplusPct > 0 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  onClick={(e) => e.preventDefault()}
                                  className="h-full rounded-r-lg bg-primary/35 flex items-center justify-center cursor-default hover:brightness-110 transition-all"
                                  style={{ width: `${surplusPct}%` }}
                                >
                                  {surplusPct > 15 && (
                                    <span className="text-[9px] font-bold text-primary truncate px-0.5">
                                      Surplus {Math.round(surplusPct)}%
                                    </span>
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="text-xs">
                                <p className="font-semibold">Surplus: {formatRM(position.surplus)}</p>
                                <p className="text-muted-foreground">{Math.round(surplusPct)}% of nett pay</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {/* Overflow for deficit */}
                          {isDeficit && deficitReserve > 0 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  onClick={(e) => e.preventDefault()}
                                  className="h-full rounded-r-lg bg-destructive/90 border-l-2 border-dashed border-white/30 flex items-center justify-center cursor-default"
                                  style={{ width: `${deficitReserve}%` }}
                                >
                                  <span className="text-[9px] font-bold text-white px-1 truncate">
                                    {formatRM(position.surplus)}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="text-xs">
                                <p className="font-semibold">Deficit: {formatRM(position.surplus)}</p>
                                <p className="text-muted-foreground">
                                  Expenses exceed income by {Math.round(overflowPct)}%
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TooltipProvider>
                    </div>
                    {/* Legend */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
                      {position.housingCost > 0 && (
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-sm bg-orange-500/75" /> Housing
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-sm bg-destructive/65" /> Essentials
                      </span>
                      {position.entertainmentCost > 0 && (
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-sm bg-purple-500/70" /> Entertainment
                        </span>
                      )}
                      {position.othersCost > 0 && (
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-sm bg-amber-500/70" /> Others
                        </span>
                      )}
                      {!isDeficit && (
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-sm bg-primary/35" /> Surplus
                        </span>
                      )}
                      {isDeficit && (
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-sm bg-destructive/90" /> Exceeds income
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}

              <div className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-secondary/30 border border-border/40">
                <span className="text-sm text-muted-foreground font-medium">Surplus / Deficit</span>
                <span className={`text-base font-bold ${position.surplus < 0 ? "text-destructive" : "text-primary"}`}>
                  {formatRM(position.surplus)}/mo
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-secondary/30 border border-border/40">
                <span className="text-sm text-muted-foreground font-medium">Housing Ratio</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-base font-bold ${position.housingRatio > 30 ? "text-destructive" : "text-foreground"}`}
                  >
                    {position.housingRatio}%
                  </span>
                  {position.housingRatio > 30 && (
                    <Badge
                      variant="outline"
                      className="text-[10px] border-destructive/30 text-destructive bg-destructive/5"
                    >
                      High
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-secondary/30 border border-border/40">
                <span className="text-sm text-muted-foreground font-medium">Current Spend</span>
                <span className="text-base font-bold text-foreground">{formatRM(position.currentSpend)}/mo</span>
              </div>
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div onClick={(e) => e.preventDefault()} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-secondary/30 border border-border/40 cursor-help">
                      <span className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
                        Primary Constraint
                        <Info className="w-3.5 h-3.5 text-muted-foreground/50" />
                      </span>
                      <Badge
                        variant="outline"
                        className="font-semibold text-xs border-primary/30 text-accent-foreground bg-accent"
                      >
                        {position.primaryConstraint}
                      </Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[260px] text-xs space-y-1 p-3">
                    <p className="font-semibold">{position.primaryConstraint}</p>
                    <p className="text-muted-foreground leading-relaxed">
                      {position.primaryConstraint === "Lifestyle" &&
                        "Your expenses exceed your income. Focus on cutting non-essential spending or increasing income to reach break-even."}
                      {position.primaryConstraint === "Housing" &&
                        "Housing takes over 30% of your nett pay. Consider downsizing or increasing income to bring this ratio below 30%."}
                      {position.primaryConstraint === "Stability Income" &&
                        "Your income is below the B40 threshold. Prioritise upskilling or seeking higher-paying roles to build financial stability."}
                      {position.primaryConstraint === "Cashflow" &&
                        "Over 60% of your income goes to expenses. Trim discretionary spending to free up more cash for savings and investments."}
                      {position.primaryConstraint === "Expansion Income" &&
                        "You're financially stable but below the T20 threshold. Focus on career growth or side income to accelerate wealth building."}
                      {position.primaryConstraint === "None" &&
                        "No major constraint detected. You're in a strong position — focus on optimising investments and retirement planning."}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardContent>
          </Card>
        </div>

        {/* Right: Financial Advisors */}
        <div className="lg:col-span-7">
          <Card className="shadow-sm border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CardTitle className="flex items-center gap-2 text-lg">💬 Talk to a Financial Advisor</CardTitle>
                <Badge
                  variant="outline"
                  className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800"
                >
                  Free
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Understanding your position is the first step. A{" "}
                <strong className="text-foreground">licensed advisor</strong> can help you decide which lever to pull —
                and build a plan around your specific life situation.
              </p>

              <div className="relative mt-2">
                {/* Blurred advisor cards */}
                <div className="opacity-15 blur-[3px] pointer-events-none space-y-4">
                  {mockAdvisors.map((advisor) => (
                    <AdvisorCard key={advisor.name} advisor={advisor} />
                  ))}
                  <div className="text-center py-3 border border-dashed border-border/40 rounded-xl">
                    <span className="text-sm font-semibold text-muted-foreground">View more advisors →</span>
                  </div>
                </div>
                {/* Centered overlay */}
                <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
                  <div className="w-full max-w-sm">
                    <InterestCapture />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground/60 text-center leading-relaxed mt-2">
                All advisors are independently licensed and regulated. SimpliFi does not provide financial advice.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ImprovePositionView;
