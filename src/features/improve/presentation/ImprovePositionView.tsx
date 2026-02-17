import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Search, Compass, TrendingUp, Rocket, Home, Briefcase, ShoppingBag, ArrowRight } from 'lucide-react';

type Phase = 'stabilise' | 'optimise' | 'upgrade';

interface PositionSummary {
  surplus: number;
  housingRatio: number;
  retirementMaxSpend: number;
  currentSpend: number;
  primaryConstraint: string;
}

interface ActionPath {
  icon: React.ReactNode;
  label: string;
  amount: number;
}

// Static mock data for now
const mockPosition: PositionSummary = {
  surplus: -500,
  housingRatio: 80,
  retirementMaxSpend: 3224,
  currentSpend: 2300,
  primaryConstraint: 'Housing',
};

function getPhase(surplus: number, retirementMaxSpend: number, currentSpend: number): Phase {
  if (surplus < 0) return 'stabilise';
  if (currentSpend > retirementMaxSpend * 0.9) return 'optimise';
  return 'upgrade';
}

const phaseConfig: Record<Phase, { icon: React.ReactNode; label: string; description: string; color: string; bgClass: string; borderClass: string; badgeClass: string }> = {
  stabilise: {
    icon: <Compass className="w-5 h-5" />,
    label: 'Stabilise',
    description: 'You\'re in deficit. Focus on reaching break-even first.',
    color: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-50 dark:bg-amber-950/30',
    borderClass: 'border-amber-200 dark:border-amber-800/50',
    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-700',
  },
  optimise: {
    icon: <TrendingUp className="w-5 h-5" />,
    label: 'Optimise',
    description: 'You\'re stable but constrained. Time to improve efficiency.',
    color: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-50 dark:bg-blue-950/30',
    borderClass: 'border-blue-200 dark:border-blue-800/50',
    badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-700',
  },
  upgrade: {
    icon: <Rocket className="w-5 h-5" />,
    label: 'Upgrade',
    description: 'You\'re in a strong position. Push for acceleration.',
    color: 'text-primary',
    bgClass: 'bg-accent',
    borderClass: 'border-primary/20',
    badgeClass: 'bg-accent text-accent-foreground border-primary/20',
  },
};

function formatRM(amount: number): string {
  const abs = Math.abs(amount);
  const formatted = `RM${abs.toLocaleString('en-MY')}`;
  return amount < 0 ? `–${formatted}` : formatted;
}

const ImprovePositionView: React.FC = () => {
  const position = mockPosition;
  const phase = getPhase(position.surplus, position.retirementMaxSpend, position.currentSpend);
  const config = phaseConfig[phase];
  const deficit = Math.abs(position.surplus);

  const actionPaths: ActionPath[] = position.surplus < 0
    ? [
        { icon: <Home className="w-4 h-4" />, label: 'Reduce housing', amount: deficit },
        { icon: <Briefcase className="w-4 h-4" />, label: 'Increase income', amount: deficit },
        { icon: <ShoppingBag className="w-4 h-4" />, label: 'Reduce lifestyle', amount: deficit },
      ]
    : [
        { icon: <TrendingUp className="w-4 h-4" />, label: 'Boost retirement savings', amount: 500 },
        { icon: <Briefcase className="w-4 h-4" />, label: 'Increase income', amount: 500 },
        { icon: <ShoppingBag className="w-4 h-4" />, label: 'Optimise spending', amount: 300 },
      ];

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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left: Position Summary */}
        <div className="lg:col-span-5 xl:col-span-5">
          <Card className="shadow-sm border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Search className="h-5 w-5 text-primary" />
                Your Position Today
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Surplus / Deficit */}
              <div className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-secondary/30 border border-border/40">
                <span className="text-sm text-muted-foreground font-medium">Surplus / Deficit</span>
                <span className={`text-base font-bold ${position.surplus < 0 ? 'text-destructive' : 'text-primary'}`}>
                  {formatRM(position.surplus)}/mo
                </span>
              </div>

              {/* Housing Ratio */}
              <div className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-secondary/30 border border-border/40">
                <span className="text-sm text-muted-foreground font-medium">Housing Ratio</span>
                <div className="flex items-center gap-2">
                  <span className={`text-base font-bold ${position.housingRatio > 30 ? 'text-destructive' : 'text-foreground'}`}>
                    {position.housingRatio}%
                  </span>
                  {position.housingRatio > 30 && (
                    <Badge variant="outline" className="text-[10px] border-destructive/30 text-destructive bg-destructive/5">
                      High
                    </Badge>
                  )}
                </div>
              </div>

              {/* Retirement Max Spend */}
              <div className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-secondary/30 border border-border/40">
                <span className="text-sm text-muted-foreground font-medium">Retirement Max Spend</span>
                <span className="text-base font-bold text-foreground">
                  {formatRM(position.retirementMaxSpend)}/mo
                </span>
              </div>

              {/* Current Spend */}
              <div className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-secondary/30 border border-border/40">
                <span className="text-sm text-muted-foreground font-medium">Current Spend</span>
                <span className="text-base font-bold text-foreground">
                  {formatRM(position.currentSpend)}/mo
                </span>
              </div>

              {/* Primary Constraint */}
              <div className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-secondary/30 border border-border/40">
                <span className="text-sm text-muted-foreground font-medium">Primary Constraint</span>
                <Badge variant="outline" className="font-semibold text-xs border-amber-300 text-amber-700 bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:bg-amber-950/30">
                  {position.primaryConstraint}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Action Paths */}
        <div className="lg:col-span-7 xl:col-span-7">
          <Card className="shadow-sm border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ArrowRight className="h-5 w-5 text-primary" />
                How to Improve
              </CardTitle>
              {position.surplus < 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  You need <span className="font-bold text-foreground">+{formatRM(deficit)}/month</span> to break even.
                  Here are the fastest mechanical paths:
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {actionPaths.map((path, i) => (
                <div
                  key={i}
                  className="group flex items-center gap-4 py-3.5 px-4 rounded-xl border border-border/60 bg-card hover:border-primary/30 hover:bg-accent/30 transition-colors cursor-default"
                >
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-accent transition-colors shrink-0">
                    {path.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{path.label}</p>
                    <p className="text-xs text-muted-foreground">
                      by <span className="font-bold text-foreground">{formatRM(path.amount)}/mo</span>
                    </p>
                  </div>
                  {i < actionPaths.length - 1 && (
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">or</span>
                  )}
                </div>
              ))}

              {/* Phase-specific guidance */}
              <div className={`mt-4 p-4 rounded-xl border ${config.borderClass} ${config.bgClass}`}>
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${config.color}`}>{config.icon}</div>
                  <div>
                    <p className={`text-sm font-bold ${config.color}`}>
                      Phase: {config.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {phase === 'stabilise' && 'Your immediate goal is to close the deficit gap. Pick the most achievable path above and work towards it. Even a partial reduction helps.'}
                      {phase === 'optimise' && 'You\'re covering costs but running tight on retirement capacity. Focus on increasing the gap between income and spending to build long-term resilience.'}
                      {phase === 'upgrade' && 'You have solid coverage and strong retirement capacity. Consider accelerating savings, investing surplus, or planning for major life upgrades.'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ImprovePositionView;
