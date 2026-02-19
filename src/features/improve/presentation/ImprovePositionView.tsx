import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Search, Compass, TrendingUp, Rocket, MapPin, Lightbulb, CheckCircle2, Info, Check, ArrowRight } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { calculateIncomeReality, ExpenseAssumptions, DEFAULT_EXPENSES, HouseholdType, Location } from '@/features/income-reality/domain/incomeRealityCalculations';
import { calculateSustainableWithdrawal } from '@/features/retirement/domain/epfCalculations';

type Phase = 'stabilise' | 'strengthen' | 'scale';

interface PositionSummary {
  surplus: number;
  housingRatio: number;
  retirementMaxSpend: number;
  currentSpend: number;
  primaryConstraint: string;
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

function getPhase(surplus: number, retirementMaxSpend: number, currentSpend: number): Phase {
  if (surplus < 0) return 'stabilise';
  if (currentSpend > retirementMaxSpend * 0.9) return 'strengthen';
  return 'scale';
}

const phaseConfig: Record<Phase, { icon: React.ReactNode; label: string; description: string; color: string; bgClass: string; borderClass: string; badgeClass: string }> = {
  stabilise: {
    icon: <Compass className="w-5 h-5" />,
    label: 'Stabilise',
    description: "You're in deficit. Focus on reaching break-even first.",
    color: 'text-phase-stabilise',
    bgClass: 'bg-phase-stabilise/10',
    borderClass: 'border-phase-stabilise/20',
    badgeClass: 'bg-phase-stabilise/10 text-phase-stabilise border-phase-stabilise/20',
  },
  strengthen: {
    icon: <TrendingUp className="w-5 h-5" />,
    label: 'Strengthen',
    description: "You're break-even or in surplus. Build your financial foundation.",
    color: 'text-phase-strengthen',
    bgClass: 'bg-phase-strengthen/10',
    borderClass: 'border-phase-strengthen/20',
    badgeClass: 'bg-phase-strengthen/10 text-phase-strengthen border-phase-strengthen/20',
  },
  scale: {
    icon: <Rocket className="w-5 h-5" />,
    label: 'Scale',
    description: "Your foundation is solid. Now grow your wealth deliberately.",
    color: 'text-phase-scale',
    bgClass: 'bg-phase-scale/10',
    borderClass: 'border-phase-scale/20',
    badgeClass: 'bg-phase-scale/10 text-phase-scale border-phase-scale/20',
  },
};

const phaseOrder: Phase[] = ['stabilise', 'strengthen', 'scale'];

const phaseDetails: Record<Phase, { meaning: string; focusAreas: string[]; next?: { phase: Phase; hint: string } }> = {
  stabilise: {
    meaning: "You're spending more than you earn. The priority is to close the gap and reach break-even.",
    focusAreas: ['Cut non-essential spending', 'Increase income sources', 'Restructure housing costs'],
    next: { phase: 'strengthen', hint: 'once you reach break-even' },
  },
  strengthen: {
    meaning: "You're covering your expenses. Now it's time to build a buffer and grow your financial security.",
    focusAreas: ['Build 3–6 months emergency fund', 'Optimise EPF contributions', 'Reduce high-interest debt'],
    next: { phase: 'scale', hint: 'once your foundation is solid' },
  },
  scale: {
    meaning: "Your foundation is solid. You can now focus on growing wealth and optimising for retirement.",
    focusAreas: ['Diversify investments', 'Maximise retirement contributions', 'Build passive income streams'],
  },
};

function formatRM(amount: number): string {
  const abs = Math.abs(amount);
  const formatted = `RM${abs.toLocaleString('en-MY')}`;
  return amount < 0 ? `–${formatted}` : formatted;
}

interface Advisor {
  initials: string;
  name: string;
  title: string;
  experience: string;
  badges: { label: string; variant: 'sc' | 'fimm' | 'cfa' }[];
  matchReason: string;
  tags: { label: string; isMatch: boolean }[];
  location: string;
  avatarColor: string;
}

const mockAdvisors: Advisor[] = [
  {
    initials: 'AH',
    name: 'Ahmad Hafiz',
    title: 'Licensed Financial Planner',
    experience: '8 years exp.',
    badges: [{ label: 'SC Licensed', variant: 'sc' }],
    matchReason: 'Specialises in young earners in the Stabilise phase — budgeting, housing decisions, and EPF optimisation.',
    tags: [
      { label: 'Housing decisions', isMatch: true },
      { label: 'B40–M40 earners', isMatch: false },
      { label: 'EPF planning', isMatch: false },
      { label: 'Debt management', isMatch: false },
    ],
    location: 'KL / Klang Valley',
    avatarColor: 'bg-emerald-600',
  },
  {
    initials: 'NR',
    name: 'Nurul Raziah',
    title: 'Wealth Consultant',
    experience: '5 years exp.',
    badges: [{ label: 'FIMM', variant: 'fimm' }],
    matchReason: 'Focuses on income growth strategies and lifestyle restructuring for people in deficit.',
    tags: [
      { label: 'Income growth', isMatch: true },
      { label: 'Lifestyle budgeting', isMatch: false },
      { label: 'Unit trust', isMatch: false },
      { label: 'Emergency fund', isMatch: false },
    ],
    location: 'Petaling Jaya · Online available',
    avatarColor: 'bg-violet-600',
  },
];

const badgeStyles: Record<string, string> = {
  sc: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800',
  fimm: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800',
  cfa: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-800',
};

const AdvisorCard: React.FC<{ advisor: Advisor }> = ({ advisor }) => (
  <div className="border border-border/60 rounded-xl p-4 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer space-y-3">
    {/* Top row */}
    <div className="flex items-start gap-3">
      <div className={`w-11 h-11 rounded-full ${advisor.avatarColor} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
        {advisor.initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-foreground">{advisor.name}</p>
        <p className="text-xs text-muted-foreground">{advisor.title} · {advisor.experience}</p>
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
          className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${
            tag.isMatch
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-300'
              : 'bg-secondary/50 border-border/40 text-muted-foreground'
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
    const reality = calculateIncomeReality(
      monthlyIncome,
      housingCost,
      householdType as HouseholdType,
      dependants,
      userLocation as Location,
      expenses,
    );

    const housingRatio = monthlyIncome > 0 ? Math.round((housingCost / monthlyIncome) * 100) : 0;

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

    // Determine primary constraint
    let primaryConstraint = 'None';
    if (housingRatio > 30) primaryConstraint = 'Housing';
    else if (reality.surplus < 0) primaryConstraint = 'Income';

    return {
      surplus: reality.surplus,
      housingRatio,
      retirementMaxSpend,
      currentSpend: reality.baselineLifeCost,
      primaryConstraint,
    };
  }, [monthlyIncome, housingCost, currentEPF, age, householdType, dependants, userLocation, expenses]);
  const phase = getPhase(position.surplus, position.retirementMaxSpend, position.currentSpend);
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
            <button className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 cursor-pointer transition-colors hover:bg-background/50 ${config.borderClass}`}>
              <Info className={`w-4 h-4 ${config.color}`} />
            </button>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="end" className="w-80 p-0">
            {/* Header */}
            <div className="px-4 pt-4 pb-3 border-b border-border/40">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full bg-phase-${phase}`} style={{ backgroundColor: `hsl(var(--phase-${phase}))` }} />
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
                        <div className={`flex-1 h-0.5 mx-1.5 rounded-full ${isCompleted ? `bg-phase-${phaseOrder[i - 1]}` : 'bg-border'}`}
                          style={isCompleted ? { backgroundColor: `hsl(var(--phase-${phaseOrder[i-1]}))` } : undefined}
                        />
                      )}
                      <div className="flex flex-col items-center gap-1.5">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                            isCompleted
                              ? 'bg-phase-stabilise text-white border-transparent'
                              : isCurrent
                              ? 'border-transparent text-white'
                              : 'border-border bg-secondary/50 text-muted-foreground'
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
                        <span className={`text-[11px] font-semibold ${isCurrent ? config.color : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
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
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">What this means</p>
                <p className="text-sm text-foreground leading-relaxed">{phaseDetails[phase].meaning}</p>
              </div>

              {/* Focus areas */}
              <div className={`rounded-lg border p-3 ${config.bgClass} ${config.borderClass}`}>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${config.color} mb-2`}>Focus Areas</p>
                <ul className="space-y-1.5">
                  {phaseDetails[phase].focusAreas.map((area) => (
                    <li key={area} className="flex items-start gap-2 text-sm text-foreground">
                      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0`} style={{ backgroundColor: `hsl(var(--phase-${phase}))` }} />
                      {area}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Next phase hint */}
              {phaseDetails[phase].next && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Next: <strong className="text-foreground">{phaseConfig[phaseDetails[phase].next!.phase].label}</strong> — {phaseDetails[phase].next!.hint}</span>
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
                      <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-[220px] p-2">
                      <p className="text-xs">A snapshot of your financial health based on your current income, expenses, and retirement projections.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-secondary/30 border border-border/40">
                <span className="text-sm text-muted-foreground font-medium">Surplus / Deficit</span>
                <span className={`text-base font-bold ${position.surplus < 0 ? 'text-destructive' : 'text-primary'}`}>
                  {formatRM(position.surplus)}/mo
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-secondary/30 border border-border/40">
                <span className="text-sm text-muted-foreground font-medium">Housing Ratio</span>
                <div className="flex items-center gap-2">
                  <span className={`text-base font-bold ${position.housingRatio > 30 ? 'text-destructive' : 'text-foreground'}`}>
                    {position.housingRatio}%
                  </span>
                  {position.housingRatio > 30 && (
                    <Badge variant="outline" className="text-[10px] border-destructive/30 text-destructive bg-destructive/5">High</Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-secondary/30 border border-border/40">
                <span className="text-sm text-muted-foreground font-medium">Retirement Max Spend</span>
                <span className="text-base font-bold text-foreground">{formatRM(position.retirementMaxSpend)}/mo</span>
              </div>
              <div className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-secondary/30 border border-border/40">
                <span className="text-sm text-muted-foreground font-medium">Current Spend</span>
                <span className="text-base font-bold text-foreground">{formatRM(position.currentSpend)}/mo</span>
              </div>
              <div className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-secondary/30 border border-border/40">
                <span className="text-sm text-muted-foreground font-medium">Primary Constraint</span>
                <Badge variant="outline" className="font-semibold text-xs border-primary/30 text-accent-foreground bg-accent">
                  {position.primaryConstraint}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Financial Advisors */}
        <div className="lg:col-span-7">
          <Card className="shadow-sm border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  💬 Talk to a Financial Advisor
                </CardTitle>
                <Badge variant="outline" className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800">
                  Free
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Understanding your position is the first step. A <strong className="text-foreground">licensed advisor</strong> can help you decide which lever to pull — and build a plan around your specific life situation.
              </p>

              {/* Coming Soon Overlay */}
              <div className="relative mt-2">
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-[2px] rounded-xl">
                  <Badge variant="outline" className="text-sm font-bold px-4 py-1.5 border-primary/30 text-primary bg-accent mb-2">
                    Coming Soon
                  </Badge>
                  <p className="text-xs text-muted-foreground text-center max-w-[260px]">
                    We're onboarding licensed financial advisors matched to your profile.
                  </p>
                </div>

                <div className="opacity-40 pointer-events-none space-y-4">
                  {mockAdvisors.map((advisor) => (
                    <AdvisorCard key={advisor.name} advisor={advisor} />
                  ))}

                  <div className="text-center py-3 border border-dashed border-border/40 rounded-xl">
                    <span className="text-sm font-semibold text-muted-foreground">View more advisors →</span>
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
