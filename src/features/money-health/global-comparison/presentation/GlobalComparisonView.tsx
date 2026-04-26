import React, { useState, useMemo } from 'react';
import { Globe, ArrowDown, TrendingUp, Landmark, ShieldCheck, HelpCircle } from 'lucide-react';
import { COUNTRIES, LIFESTYLE_MULTIPLIERS, calculateGlobalComparison, LifestyleLevel, getSingaporeEffectiveTaxRate } from '../domain/globalComparisonLogic';
import { SALARY_DATA } from '@/features/money-health/benchmark/domain/salaryData';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/shared/components/ui/tooltip";
import { calculateNettPay } from '@/features/money-health/classification/domain/nettPayCalculation';
import { BaseCommitmentsModal } from './components/BaseCommitmentsModal';
import { LifestyleUpgradeModal } from './components/LifestyleUpgradeModal';
import { TaxRateModal } from './components/TaxRateModal';
import { MarketRealityCard } from './components/MarketRealityCard';

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
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [customTaxRate, setCustomTaxRate] = useState<number | null>(null);
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

  const targetSurvivalCost = Object.values(baseBreakdown).reduce((a, b) => (a as number) + (b as number), 0) as number;
  
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
    setCustomTaxRate(null);
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
    
    let effectiveTaxRateB: number;
    if (customTaxRate !== null) {
      effectiveTaxRateB = customTaxRate / 100;
    } else if (countryB.id === 'sg') {
      // Progressive lookup for Singapore
      // Step 1: Initial guess of gross salary
      const roughGrossAnnual = (netRequiredB / (1 - countryB.taxRate)) * 12;
      // Step 2: Get effective rate for that income level
      effectiveTaxRateB = getSingaporeEffectiveTaxRate(roughGrossAnnual);
    } else {
      effectiveTaxRateB = countryB.taxRate;
    }

    const equivalentSalaryB = netRequiredB / (1 - effectiveTaxRateB);

    return {
      ...baseResult,
      effectiveTaxRateB,
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
        <div className="absolute top-0 right-0 p-8 opacity-10 animate-float">
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
              <div className="text-6xl sm:text-7xl font-black tracking-tight drop-shadow-xl">
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

          <MarketRealityCard 
            countryB={countryB}
            marketData={marketData}
            result={result}
            formatCurrency={formatCurrency}
          />
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

              <button 
                onClick={() => setIsTaxModalOpen(true)}
                className="text-left space-y-3 p-4 bg-purple-500/5 rounded-2xl border border-purple-500/10 relative overflow-hidden group hover:bg-orange-500/10 transition-all active:scale-95"
              >
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                  <HelpCircle className="w-4 h-4 text-purple-600" />
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-purple-700 flex items-center gap-1">
                    3. Target Tax Load
                    <span className="text-[8px] bg-purple-100 px-1 rounded text-purple-600">EDITABLE</span>
                  </h4>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                    Effective rate at this income tier.
                  </p>
                </div>
                <div className="text-lg font-black text-purple-600">
                  {Math.round(result.effectiveTaxRateB * 100)}%
                </div>
              </button>
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

      <BaseCommitmentsModal 
        isOpen={isBaseModalOpen}
        onOpenChange={setIsBaseModalOpen}
        countryA={countryA}
        countryB={countryB}
        baseBreakdown={baseBreakdown}
        setBaseBreakdown={setBaseBreakdown}
        homeCommitments={homeCommitments}
        setHomeCommitments={setHomeCommitments}
        targetSurvivalCost={targetSurvivalCost}
        commitmentCostB={commitmentCostB}
        customBaseLivingCost={customBaseLivingCost}
        housingCost={housingCost}
        expenses={expenses}
        formatCurrency={formatCurrency}
      />

      <LifestyleUpgradeModal 
        isOpen={isUpgradeModalOpen}
        onOpenChange={setIsUpgradeModalOpen}
        countryA={countryA}
        countryB={countryB}
        lifestyle={lifestyle}
        setLifestyle={setLifestyle}
        customMultiplier={customMultiplier}
        setCustomMultiplier={setCustomMultiplier}
        customDisposableIncomeA={customDisposableIncomeA}
        setCustomDisposableIncomeA={setCustomDisposableIncomeA}
        derivedDisposableA={derivedDisposableA}
        expenses={expenses}
        result={result}
        formatCurrency={formatCurrency}
      />

      <TaxRateModal 
        isOpen={isTaxModalOpen}
        onOpenChange={setIsTaxModalOpen}
        countryB={countryB}
        customTaxRate={customTaxRate}
        setCustomTaxRate={setCustomTaxRate}
        result={result}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}
