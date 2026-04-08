import React, { useState, useMemo } from 'react';
import { Globe, ArrowDown, TrendingUp, Landmark, ShieldCheck, HelpCircle, Briefcase } from 'lucide-react';
import { COUNTRIES, LIFESTYLE_MULTIPLIERS, calculateGlobalComparison, LifestyleLevel } from '../domain/globalComparisonLogic';
import { SALARY_DATA } from '@/features/benchmark/domain/salaryData';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { calculateNettPay } from '@/features/classification/domain/nettPayCalculation';

interface GlobalComparisonViewProps {
  monthlyIncome?: number;
  age?: number;
  housingCost?: number;
  expenses?: {
    food: number;
    transport: number;
    utilities: number;
    others: number;
    entertainment: number;
  };
  monthlyVoluntaryContribution?: number;
  benchmarkRole?: string;
}

export default function GlobalComparisonView({ 
  monthlyIncome = 8000,
  age = 30,
  housingCost = 0,
  expenses,
  monthlyVoluntaryContribution = 0,
  benchmarkRole = ''
}: GlobalComparisonViewProps) {
  const [salaryA, setSalaryA] = useState(monthlyIncome.toString());
  const [countryAId, setCountryAId] = useState('my');
  const [countryBId, setCountryBId] = useState('sg');
  const [lifestyle, setLifestyle] = useState<LifestyleLevel>('balanced');
  const [isBaseModalOpen, setIsBaseModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [customMultiplier, setCustomMultiplier] = useState(1.0);
  const [customDisposableIncomeA, setCustomDisposableIncomeA] = useState<number | null>(null);

  // Home Country Commitments (fixed costs that carry over)
  const [homeCommitments, setHomeCommitments] = useState({
    housing: housingCost,
    utilities: expenses?.utilities || 0
  });

  // Sync home commitments with profile if not manually edited
  React.useEffect(() => {
    setHomeCommitments({
      housing: housingCost,
      utilities: expenses?.utilities || 0
    });
  }, [housingCost, expenses?.utilities]);

  // Derive "Income Reality" disposable if data provided
  const derivedDisposableA = useMemo(() => {
    const sA = parseFloat(salaryA) || 0;
    // 1. Get Nett Pay
    const nett = calculateNettPay(sA, age);
    
    // 2. Subtract expenses (Survival essentials + housing from personal reality)
    if (expenses) {
      const survivalExpenses = expenses.food + expenses.transport + expenses.utilities + expenses.others;
      const actualHousing = housingCost;
      return Math.max(0, nett - survivalExpenses - actualHousing);
    }
    
    const countryAObj = COUNTRIES.find(c => c.id === countryAId) || COUNTRIES[0];
    return Math.max(0, nett - countryAObj.baseLivingCost);
  }, [salaryA, age, housingCost, expenses, countryAId]);

  // Default breakdown for Singapore as example
  const [baseBreakdown, setBaseBreakdown] = useState({
    housing: 2800,
    food: 1000,
    transport: 400,
    utilities: 300
  });

  const countryA = COUNTRIES.find(c => c.id === countryAId) || COUNTRIES[0];
  const countryB = COUNTRIES.find(c => c.id === countryBId) || COUNTRIES[1];

  // Get Michael Page benchmark data for the note
  const marketData = useMemo(() => {
    return SALARY_DATA.find(d => d.role === benchmarkRole);
  }, [benchmarkRole]);

  const targetSurvivalCost = Object.values(baseBreakdown).reduce((a, b) => a + b, 0);
  
  // Convert Home Commitments to Target Currency
  const commitmentCostB = (homeCommitments.housing + homeCommitments.utilities) * countryB.exchangeRate;
  
  const customBaseLivingCost = targetSurvivalCost + commitmentCostB;

  React.useEffect(() => {
    const countryBase = countryB.baseLivingCost;
    setBaseBreakdown({
      housing: Math.round(countryBase * 0.6),
      food: Math.round(countryBase * 0.2),
      transport: Math.round(countryBase * 0.1),
      utilities: Math.round(countryBase * 0.1)
    });
  }, [countryBId]);

  React.useEffect(() => {
    setCustomMultiplier(LIFESTYLE_MULTIPLIERS[lifestyle]);
  }, [lifestyle]);

  const result = useMemo(() => {
    const sA = parseFloat(salaryA) || 0;
    
    // Calculate Lost EPF Contribution (Employee 11% + Employer 12/13%)
    const employerRate = sA <= 5000 ? 0.13 : 0.12;
    const employeeRate = 0.11;
    const lostMonthlyEPF = (sA * (employeeRate + employerRate)) + monthlyVoluntaryContribution;

    const baseResult = calculateGlobalComparison(
      sA,
      countryA,
      { ...countryB, baseLivingCost: customBaseLivingCost },
      lifestyle
    );

    const originDisposable = customDisposableIncomeA !== null ? customDisposableIncomeA : derivedDisposableA;
    const costIndex = countryB.colIndex / countryA.colIndex;
    
    // Scaled requirement for lost retirement contribution
    const lostEPFRequirementB = lostMonthlyEPF * countryB.exchangeRate * costIndex;
    const disposableRequirementB = originDisposable * countryB.exchangeRate * costIndex * customMultiplier;
    
    const totalUpgradeB = disposableRequirementB + lostEPFRequirementB;
    const netRequiredB = customBaseLivingCost + totalUpgradeB;
    const equivalentSalaryB = netRequiredB / (1 - countryB.taxRate);

    return {
      ...baseResult,
      originDisposableActual: originDisposable,
      equivalentSalary: equivalentSalaryB,
      disposableRequirementB,
      lostEPFRequirementB,
      lostMonthlyEPF,
      costIndex
    };
  }, [salaryA, countryA, countryB, lifestyle, customBaseLivingCost, customMultiplier, customDisposableIncomeA, derivedDisposableA, monthlyVoluntaryContribution]);

  const formatCurrency = (val: number, country: any) => {
    return `${country.symbol}${Math.round(val).toLocaleString()}`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Hero Output */}
      <section className="bg-gradient-to-br from-emerald-500 to-teal-700 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Globe className="w-64 h-64 -mr-20 -mt-20" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-6 py-4">
          <div className="space-y-1">
            <h2 className="text-xl font-medium text-emerald-50 uppercase tracking-[0.2em]">Equivalent Lifestyle Salary</h2>
            <p className="text-sm text-emerald-100/80">Maintaining your current quality of life in {countryB.name}</p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="space-y-1">
              <div className="text-3xl font-bold opacity-80">{formatCurrency(parseFloat(salaryA) || 0, countryA)}</div>
              <div className="text-xs font-medium uppercase tracking-widest opacity-60">({countryA.name})</div>
            </div>

            <div className="bg-white/20 p-2 rounded-full backdrop-blur-md">
              <ArrowDown className="w-6 h-6" />
            </div>

            <div className="space-y-1 group">
              <div className="text-6xl sm:text-7xl font-black tracking-tight drop-shadow-xl animate-in zoom-in duration-500">
                {formatCurrency(result.equivalentSalary, countryB)}
              </div>
              <div className="flex justify-center">
                <select 
                  value={countryBId}
                  onChange={(e) => setCountryBId(e.target.value)}
                  className="bg-white/20 border border-white/30 rounded-full px-4 py-1 text-sm font-bold backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-white/50 transition-all cursor-pointer hover:bg-white/30"
                >
                  {COUNTRIES.filter(c => c.id !== countryAId).map(c => (
                    <option key={c.id} value={c.id} className="text-foreground">{c.flag} {c.name} ({countryB.currency})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 💎 Floating Market Reality Card */}
          {marketData && (
            <div className="lg:absolute bottom-6 right-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl min-w-[280px] animate-in slide-in-from-right-8 duration-1000 hidden lg:block">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white/20 rounded-lg">
                    <Briefcase className="w-3 h-3 text-emerald-100" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-50">{countryB.name} Market Check</span>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-white/40 hover:text-white transition-colors">
                        <HelpCircle className="w-3 h-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-[10px] max-w-[200px]">
                      Estimated {countryB.name} range for {marketData.role}, scaled from Michael Page benchmarks.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {(() => {
                const minB = (marketData.minAnnual / 12) * countryB.exchangeRate * result.costIndex;
                const maxB = (marketData.maxAnnual / 12) * countryB.exchangeRate * result.costIndex;
                const avgB = (marketData.avgAnnual / 12) * countryB.exchangeRate * result.costIndex;
                const range = maxB - minB;
                const position = ((result.equivalentSalary - minB) / range) * 100;
                const clampedPosition = Math.min(Math.max(position, 0), 100);

                return (
                  <div className="space-y-3">
                    <div className="relative h-1 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="absolute inset-y-0 bg-emerald-400/30" style={{ left: '0%', width: '100%' }} />
                      <div className="absolute top-0 bottom-0 w-1 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] transition-all duration-1000" style={{ left: `${clampedPosition}%` }} />
                    </div>
                    
                    <div className="flex justify-between items-end">
                      <div className="space-y-0.5">
                        <div className="text-[7px] font-black text-emerald-100/50 uppercase tracking-tighter">Market Range</div>
                        <div className="text-[10px] font-bold text-white whitespace-nowrap">
                          {formatCurrency(minB, countryB)} — {formatCurrency(maxB, countryB)}
                        </div>
                      </div>
                      <div className="text-right space-y-0.5">
                        <div className="text-[7px] font-black text-emerald-100/50 uppercase tracking-tighter">Market Avg</div>
                        <div className="text-[10px] font-bold text-emerald-100/80">
                          {formatCurrency(avgB, countryB)}
                        </div>
                      </div>
                    </div>
                    <div className="text-[8px] text-emerald-100/40 text-center font-medium italic border-t border-white/5 pt-2">
                       {marketData.role}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-12 xl:col-span-8 space-y-6">
          <section className="bg-card border border-border rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Why this number exists
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button 
                  onClick={() => setIsBaseModalOpen(true)}
                  className="text-left space-y-3 p-4 bg-orange-500/5 rounded-2xl border border-orange-500/10 relative overflow-hidden group hover:bg-orange-500/10 transition-all active:scale-95"
                >
                  <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <HelpCircle className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-orange-700 flex items-center gap-1">
                      1. Fixed & Commitments
                      <span className="text-[8px] bg-orange-100 px-1 rounded">EDITABLE</span>
                    </h4>
                    <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                      Local survival floor + home obligations.
                    </p>
                  </div>
                  <div className="text-lg font-black text-orange-600">
                    {formatCurrency(customBaseLivingCost, countryB)}
                  </div>
                </button>

              <button 
                onClick={() => setIsUpgradeModalOpen(true)}
                className="text-left space-y-3 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 relative overflow-hidden group hover:bg-emerald-500/10 transition-all active:scale-95"
              >
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity text-emerald-600">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                    2. Lifestyle Upgrade
                    <span className="text-[8px] bg-emerald-100 px-1 rounded">EDITABLE</span>
                  </h4>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                    Scaled surplus + {formatCurrency(result.lostMonthlyEPF, countryA)} retirement gap.
                  </p>
                </div>
                <div className="text-lg font-black text-emerald-600">
                  {formatCurrency(result.disposableRequirementB + result.lostEPFRequirementB || 0, countryB)}
                </div>
              </button>

              <div className="space-y-3 p-4 bg-purple-500/5 rounded-2xl border border-purple-500/10 relative overflow-hidden group hover:bg-purple-500/10 transition-all cursor-default">
                <div className="absolute top-0 right-0 p-2 opacity-5 scale-150">
                  <Landmark className="w-12 h-12" />
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-purple-700">3. Target Tax Load</h4>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                    Effective rate at this income tier.
                  </p>
                </div>
                <div className="text-lg font-black text-purple-600">
                  {Math.round(countryB.taxRate * 100)}%
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-[10px] text-muted-foreground bg-secondary/10 p-3 rounded-xl border border-border/30">
                <span className="font-bold text-foreground">Retirement Gap Covered:</span> Target salary compensates for {formatCurrency(result.lostMonthlyEPF, countryA)} in lost EPF benefits.
              </div>
              <div className="text-[10px] text-muted-foreground bg-secondary/10 p-3 rounded-xl border border-border/30">
                <span className="font-bold text-foreground">Global Scaling:</span> Multiplier of {customMultiplier.toFixed(2)}x applied for your "{lifestyle}" preference.
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-12 xl:col-span-4 space-y-6">
          <section className="bg-card border border-border rounded-2xl shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">Calculator Settings</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                      <HelpCircle className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-48 text-xs">Adjust these parameters to see how your target salary changes based on your lifestyle choices.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Original Salary ({countryA.currency})</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">{countryA.symbol}</span>
                  <Input 
                    type="number"
                    value={salaryA}
                    onChange={(e) => setSalaryA(e.target.value)}
                    className="pl-10 text-lg font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Home Country</Label>
                <select 
                  value={countryAId}
                  onChange={(e) => setCountryAId(e.target.value)}
                  className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
                >
                  {COUNTRIES.map(c => (
                    <option key={c.id} value={c.id}>{c.flag} {c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Lifestyle Level</Label>
                <div className="grid grid-cols-3 gap-2 p-1.5 bg-secondary/30 rounded-xl border border-border">
                  {(['frugal', 'balanced', 'comfortable'] as LifestyleLevel[]).map((level) => (
                    <button
                      key={level}
                      onClick={() => setLifestyle(level)}
                      className={`py-2 px-1 rounded-lg text-xs font-bold capitalize transition-all ${
                        lifestyle === level 
                          ? 'bg-white text-emerald-600 shadow-sm' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground text-center italic">
                  {lifestyle === 'frugal' && "Prioritizing savings, local experiences."}
                  {lifestyle === 'balanced' && "Maintaining your current mix of quality."}
                  {lifestyle === 'comfortable' && "Premium housing, imported goods."}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Survival Base Editor Modal */}
      <Dialog open={isBaseModalOpen} onOpenChange={setIsBaseModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-orange-600" />
              Survival Base & Commitments
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <Globe className="w-3 h-3 text-muted-foreground" />
                <h4 className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">{countryB.name} Local Survival Costs</h4>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4 p-2.5 rounded-xl bg-secondary/10 border border-border/50 group hover:border-orange-500/30 transition-all">
                  <div className="space-y-0.5">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Local Housing</Label>
                    <p className="text-[9px] text-muted-foreground/60 italic">Monthly rent in {countryB.name}</p>
                  </div>
                  <div className="relative w-28">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">{countryB.symbol}</span>
                    <Input 
                      type="number" 
                      value={baseBreakdown.housing}
                      onChange={(e) => setBaseBreakdown(prev => ({ ...prev, housing: parseInt(e.target.value) || 0 }))}
                      className="pl-7 text-xs font-bold h-8 text-right"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 p-2.5 rounded-xl bg-secondary/10 border border-border/50 group hover:border-orange-500/30 transition-all">
                  <div className="space-y-0.5">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Food & Transp.</Label>
                    <p className="text-[9px] text-muted-foreground/60 italic">Groceries + Commute</p>
                  </div>
                  <div className="relative w-28">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">{countryB.symbol}</span>
                    <Input 
                      type="number"
                      value={baseBreakdown.food + baseBreakdown.transport}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setBaseBreakdown(prev => ({ ...prev, food: Math.round(val * 0.7), transport: Math.round(val * 0.3) }));
                      }}
                      className="pl-7 text-xs font-bold h-8 text-right"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 px-1">
                <Landmark className="w-3 h-3 text-orange-600" />
                <h4 className="text-[10px] font-black uppercase tracking-tighter text-orange-600">Home Commitments (Carried Over)</h4>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4 p-2.5 rounded-xl bg-orange-500/5 border border-orange-500/10 group hover:border-orange-500/30 transition-all">
                  <div className="space-y-0.5">
                    <Label className="text-[10px] font-bold uppercase text-orange-700">Home Mortgage/Tax</Label>
                    <p className="text-[9px] text-orange-600/60 italic">Obligations in {countryA.name}</p>
                  </div>
                  <div className="relative w-28">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-orange-700/60">{countryA.symbol}</span>
                    <Input 
                      type="number" 
                      value={homeCommitments.housing}
                      onChange={(e) => setHomeCommitments(prev => ({ ...prev, housing: parseInt(e.target.value) || 0 }))}
                      className="pl-7 text-xs font-bold h-8 text-right border-orange-200"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 p-2.5 rounded-xl bg-orange-500/5 border border-orange-500/10 group hover:border-orange-500/30 transition-all">
                  <div className="space-y-0.5">
                    <Label className="text-[10px] font-bold uppercase text-orange-700">Home Utilities/Others</Label>
                    <p className="text-[9px] text-orange-600/60 italic">Fixed subs or family cost</p>
                  </div>
                  <div className="relative w-28">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-orange-700/60">{countryA.symbol}</span>
                    <Input 
                      type="number"
                      value={homeCommitments.utilities}
                      onChange={(e) => setHomeCommitments(prev => ({ ...prev, utilities: parseInt(e.target.value) || 0 }))}
                      className="pl-7 text-xs font-bold h-8 text-right border-orange-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-secondary/20 p-4 rounded-xl space-y-3 border border-border mt-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <div className="text-[10px] font-bold text-muted-foreground uppercase">Local Survival ({countryB.currency}):</div>
                <div className="text-sm font-black text-foreground">
                  {formatCurrency(targetSurvivalCost, countryB)}
                </div>
              </div>
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <div className="text-[10px] font-bold text-orange-600 uppercase">Commitments Converted:</div>
                <div className="text-sm font-black text-orange-600">
                  {formatCurrency(commitmentCostB, countryB)}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold text-orange-600 uppercase">Total Floor ({countryB.currency}):</div>
                <div className="text-xl font-black text-orange-600">
                  {formatCurrency(customBaseLivingCost, countryB)}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                className="flex-1 text-xs h-10 font-bold"
                onClick={() => {
                  const countryBase = countryB.baseLivingCost;
                  setBaseBreakdown({
                    housing: Math.round(countryBase * 0.6),
                    food: Math.round(countryBase * 0.2),
                    transport: Math.round(countryBase * 0.1),
                    utilities: Math.round(countryBase * 0.1)
                  });
                  setHomeCommitments({
                    housing: housingCost,
                    utilities: expenses?.utilities || 0
                  });
                }}
              >
                Reset Defaults
              </Button>
              <Button 
                className="flex-1 text-xs h-10 font-bold bg-orange-600 hover:bg-orange-700"
                onClick={() => setIsBaseModalOpen(false)}
              >
                Apply Load
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upgrade Modal */}
      <Dialog open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Adjust Lifestyle Upgrade
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4 max-h-[80vh] overflow-y-auto pr-1">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 group hover:border-orange-500/30 transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Label className="text-[10px] font-bold uppercase text-orange-700">Origin Disposable</Label>
                    {customDisposableIncomeA !== null && (
                      <button 
                        onClick={() => setCustomDisposableIncomeA(null)}
                        className="text-[8px] bg-orange-100 text-orange-600 px-1 rounded uppercase font-black hover:bg-orange-200"
                      >
                        Reset to Auto
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight max-w-[220px]">
                    Your "fun money" in {countryA.name} based on your {expenses ? 'Income Reality' : 'baseline'} profile.
                  </p>
                </div>
                <div className="relative w-32">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">{countryA.symbol}</span>
                  <Input 
                    type="number" 
                    value={customDisposableIncomeA !== null ? customDisposableIncomeA : Math.round(derivedDisposableA)}
                    onChange={(e) => setCustomDisposableIncomeA(parseInt(e.target.value) || 0)}
                    className="text-sm font-bold h-10 text-right pr-4 pl-8 border-orange-200 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 group hover:border-emerald-500/30 transition-all">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase text-emerald-700">Lifestyle Multiplier</Label>
                  <p className="text-[10px] text-muted-foreground leading-tight max-w-[200px]">
                    How much of an "upgrade" you want for this surplus money in {countryB.name}.
                  </p>
                </div>
                <div className="relative w-32">
                  <Input 
                    type="number" 
                    step="0.05"
                    value={customMultiplier}
                    onChange={(e) => setCustomMultiplier(parseFloat(e.target.value) || 0)}
                    className="text-sm font-bold h-10 text-right pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground italic">x</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground pl-1">Lifestyle Level Presets</Label>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => { setLifestyle('frugal'); setCustomMultiplier(0.8); }}
                    className={`p-2 rounded-lg border text-[10px] font-bold transition-all ${lifestyle === 'frugal' ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-border/50 hover:bg-secondary'}`}
                  >
                    Frugal (0.8x)
                  </button>
                  <button 
                    onClick={() => { setLifestyle('balanced'); setCustomMultiplier(1.0); }}
                    className={`p-2 rounded-lg border text-[10px] font-bold transition-all ${lifestyle === 'balanced' ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-border/50 hover:bg-secondary'}`}
                  >
                    Balanced (1.0x)
                  </button>
                  <button 
                    onClick={() => { setLifestyle('comfortable'); setCustomMultiplier(1.3); }}
                    className={`p-2 rounded-lg border text-[10px] font-bold transition-all ${lifestyle === 'comfortable' ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-border/50 hover:bg-secondary'}`}
                  >
                    Comfortable (1.3x)
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between items-center text-emerald-800">
                  <span className="text-[10px] font-bold uppercase">Lifestyle Surplus:</span>
                  <span className="text-sm font-bold">{formatCurrency(result.disposableRequirementB, countryB)}</span>
                </div>
                <div className="flex justify-between items-center text-emerald-800">
                  <span className="text-[10px] font-bold uppercase">Retirement Gap (EPF):</span>
                  <span className="text-sm font-bold">{formatCurrency(result.lostEPFRequirementB, countryB)}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-200">
                <div className="flex justify-between items-center">
                  <div className="text-[10px] font-bold text-emerald-900 uppercase">Total Target Upgrade:</div>
                  <div className="text-xl font-black text-emerald-600">
                    {formatCurrency(result.disposableRequirementB + result.lostEPFRequirementB || 0, countryB)}
                  </div>
                </div>
              </div>
              <p className="text-[9px] text-emerald-700/60 italic leading-snug">
                This compensates for your lost {countryA.name} retirement contribution ({formatCurrency(result.lostMonthlyEPF, countryA)}) scaled to {countryB.name}.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                className="flex-1 text-xs h-10 font-bold"
                onClick={() => {
                  setCustomMultiplier(LIFESTYLE_MULTIPLIERS[lifestyle]);
                  setCustomDisposableIncomeA(null);
                }}
              >
                Reset All
              </Button>
              <Button 
                className="flex-1 text-xs h-10 font-bold bg-emerald-600 hover:bg-emerald-700"
                onClick={() => setIsUpgradeModalOpen(false)}
              >
                Apply Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
