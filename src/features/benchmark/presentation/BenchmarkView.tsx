import React, { useState, useMemo, useRef, useEffect } from 'react';
import { SECTORS, SALARY_DATA, SalaryBenchmark, getRolesForSpecialisation, searchRoles } from '@/features/benchmark/domain/salaryData';
import { Search, ChevronDown, Info, X, Layers, Globe, ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

/** Format MYR values */
function formatMYR(value: number): string {
  if (value >= 1000) {
    return `RM ${Math.round(value).toLocaleString('en-MY')}`;
  }
  return `RM ${value}`;
}

/** Salary gauge arc component */
function SalaryGauge({ benchmark, userAnnualSalary }: { benchmark: SalaryBenchmark; userAnnualSalary: number }) {
  const { minAnnual, avgAnnual, maxAnnual } = benchmark;

  // Calculate position of user salary on the arc (0 to 1)
  const range = maxAnnual - minAnnual;
  const clampedSalary = Math.max(minAnnual, Math.min(maxAnnual, userAnnualSalary));
  const position = range > 0 ? (clampedSalary - minAnnual) / range : 0.5;

  // Arc parameters
  const width = 400;
  const height = 280;
  const cx = width / 2;
  const cy = 220;
  const r = 160;
  const startAngle = Math.PI; // 180°
  const endAngle = 0; // 0°

  const avgPosition = (avgAnnual - minAnnual) / range;

  // Helper to get point on arc
  const getPoint = (t: number) => {
    const angle = startAngle + (endAngle - startAngle) * t;
    return {
      x: cx + r * Math.cos(angle),
      y: cy - r * Math.sin(angle),
    };
  };

  // Build the arc path
  const arcStart = getPoint(0);
  const arcEnd = getPoint(1);
  const avgPoint = getPoint(avgPosition);
  const userPoint = getPoint(position);

  // Gradient arc path
  const arcPath = `M ${arcStart.x} ${arcStart.y} A ${r} ${r} 0 0 1 ${arcEnd.x} ${arcEnd.y}`;

  // Difference from average
  const diff = userAnnualSalary - avgAnnual;
  const diffPercent = avgAnnual > 0 ? Math.round((diff / avgAnnual) * 100) : 0;
  const isAbove = diff > 0;
  const isBelow = diff < 0;

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox={`0 0 ${width} ${height + 20}`}
        className="w-full max-w-[400px]"
        aria-label="Salary comparison gauge"
      >
        <defs>
          <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="30%" stopColor="#f97316" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="70%" stopColor="#84cc16" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background arc */}
        <path
          d={arcPath}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="20"
          strokeLinecap="round"
          opacity="0.3"
        />

        {/* Gradient arc */}
        <path
          d={arcPath}
          fill="none"
          stroke="url(#arcGradient)"
          strokeWidth="20"
          strokeLinecap="round"
        />

        {/* Average line */}
        <line
          x1={avgPoint.x}
          y1={avgPoint.y - 16}
          x2={avgPoint.x}
          y2={avgPoint.y + 16}
          stroke="hsl(var(--foreground))"
          strokeWidth="2"
          strokeDasharray="4 3"
          opacity="0.6"
        />
        <text
          x={avgPoint.x}
          y={avgPoint.y - 26}
          textAnchor="middle"
          className="fill-muted-foreground"
          fontSize="10"
          fontWeight="500"
        >
          Average*
        </text>
        <text
          x={avgPoint.x}
          y={avgPoint.y - 40}
          textAnchor="middle"
          className="fill-foreground"
          fontSize="14"
          fontWeight="700"
        >
          {formatMYR(avgAnnual)}
        </text>

        {/* User salary indicator */}
        <circle
          cx={userPoint.x}
          cy={userPoint.y}
          r="12"
          fill={isAbove ? '#22c55e' : isBelow ? '#ef4444' : '#eab308'}
          stroke="white"
          strokeWidth="3"
          filter="url(#glow)"
        />
        <circle
          cx={userPoint.x}
          cy={userPoint.y}
          r="5"
          fill="white"
        />

        {/* Min label */}
        <text
          x={arcStart.x}
          y={arcStart.y + 28}
          textAnchor="middle"
          className="fill-foreground"
          fontSize="12"
          fontWeight="600"
        >
          {formatMYR(minAnnual)}
        </text>
        <text
          x={arcStart.x}
          y={arcStart.y + 42}
          textAnchor="middle"
          className="fill-muted-foreground"
          fontSize="10"
        >
          Minimum
        </text>

        {/* Max label */}
        <text
          x={arcEnd.x}
          y={arcEnd.y + 28}
          textAnchor="middle"
          className="fill-foreground"
          fontSize="12"
          fontWeight="600"
        >
          {formatMYR(maxAnnual)}
        </text>
        <text
          x={arcEnd.x}
          y={arcEnd.y + 42}
          textAnchor="middle"
          className="fill-muted-foreground"
          fontSize="10"
        >
          Maximum
        </text>
      </svg>

      {/* User salary callout */}
      <div className={`-mt-4 px-4 py-2.5 rounded-xl border-2 text-center ${isAbove
          ? 'border-emerald-500/30 bg-emerald-50'
          : isBelow
            ? 'border-red-500/30 bg-red-50'
            : 'border-yellow-500/30 bg-yellow-50'
        }`}>
        <div className={`text-xl font-bold ${isAbove ? 'text-emerald-600' : isBelow ? 'text-red-600' : 'text-yellow-600'
          }`}>
          {formatMYR(userAnnualSalary)}
        </div>
        <div className="text-xs text-muted-foreground">
          Your Annual Salary
        </div>
        {diff !== 0 && (
          <div className={`text-xs font-medium mt-0.5 ${isAbove ? 'text-emerald-600' : 'text-red-600'
            }`}>
            {isAbove ? '+' : ''}{formatMYR(Math.abs(diff))} ({isAbove ? '+' : ''}{diffPercent}%) vs average
          </div>
        )}
      </div>
    </div>
  );
}

/** Custom select component */
function CustomSelect({
  label,
  value,
  options,
  onChange,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1 block">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full appearance-none bg-secondary/30 border border-border/60 rounded-lg px-3 py-2 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
}

/** Global Comparison Modal */
function GlobalComparisonModal({ 
  isOpen, 
  onClose, 
  malaysiaBenchmark, 
  userAnnualSalary 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  malaysiaBenchmark: SalaryBenchmark | null;
  userAnnualSalary: number;
}) {
  if (!isOpen || !malaysiaBenchmark) return null;

  // Countries data
  const COUNTRIES = [
    { id: 'sg', name: 'Singapore', flag: '🇸🇬', currency: 'SGD', symbol: 'S$', rate: 0.28, multiplier: 1.35 },
    { id: 'uk', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', symbol: '£', rate: 0.17, multiplier: 1.25 },
    { id: 'us', name: 'United States', flag: '🇺🇸', currency: 'USD', symbol: '$', rate: 0.21, multiplier: 1.50 },
    { id: 'au', name: 'Australia', flag: '🇦🇺', currency: 'AUD', symbol: 'A$', rate: 0.32, multiplier: 1.30 },
    { id: 'ae', name: 'UAE', flag: '🇦🇪', currency: 'AED', symbol: 'د.إ', rate: 0.77, multiplier: 1.40 },
  ];

  const [selectedCountryId, setSelectedCountryId] = useState('sg');
  
  const country = COUNTRIES.find(c => c.id === selectedCountryId) || COUNTRIES[0];
  
  const localMin = malaysiaBenchmark.minAnnual * country.multiplier * country.rate;
  const localAvg = malaysiaBenchmark.avgAnnual * country.multiplier * country.rate;
  const localMax = malaysiaBenchmark.maxAnnual * country.multiplier * country.rate;
  const localUserEquivalent = userAnnualSalary * country.rate;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-card/80 backdrop-blur-md px-6 py-4 border-b border-border flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xl font-bold">
              <Globe className="w-5 h-5 text-primary" />
              <span>Global Market Comparison</span>
            </div>
            
            <div className="h-8 w-[1px] bg-border mx-2 hidden sm:block" />
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:block">Target Market:</span>
              <select 
                value={selectedCountryId}
                onChange={(e) => setSelectedCountryId(e.target.value)}
                className="bg-secondary/50 border border-border rounded-xl px-3 py-1.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:bg-secondary"
              >
                {COUNTRIES.map(c => (
                  <option key={c.id} value={c.id}>{c.flag} {c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: Current Malaysia Data */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🇲🇾</span>
                <h4 className="font-bold text-foreground">Malaysia (MYR)</h4>
              </div>
              <div className="bg-secondary/20 rounded-2xl p-5 border border-border/50">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Your Annual Salary</div>
                <div className="text-2xl font-black text-foreground">{formatMYR(userAnnualSalary)}</div>
                <div className="mt-4 pt-4 border-t border-border/30 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Market Average</span>
                    <span className="font-bold">{formatMYR(malaysiaBenchmark.avgAnnual)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Selected Country Equivalent */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{country.flag}</span>
                <h4 className="font-bold text-foreground">{country.name} ({country.currency})</h4>
              </div>
              <div className="bg-emerald-500/5 rounded-2xl p-5 border border-emerald-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <Globe className="w-12 h-12" />
                </div>
                <div className="text-xs text-emerald-700/70 mb-1 uppercase tracking-wider font-semibold">Direct Equivalent</div>
                <div className="text-2xl font-black text-emerald-600">{country.symbol} {Math.round(localUserEquivalent).toLocaleString()}</div>
                <p className="text-[10px] text-emerald-600/60 mt-1 italic">Converted at 1 MYR = {country.rate} {country.currency}</p>

              </div>
            </div>

            {/* Column 3: Michael Page Benchmark */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink className="w-4 h-4 text-primary" />
                <h4 className="font-bold text-foreground text-sm uppercase tracking-tight">{country.currency} Market Index</h4>
              </div>
              <div className="bg-secondary/20 rounded-2xl p-4 border border-border/50">
                <div className="mb-4">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground">Estimated {country.currency} Benchmark</label>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-bold">{country.symbol} {Math.round(localAvg).toLocaleString()}</span>
                    <span className="text-[11px] text-muted-foreground">average</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{country.currency} Range:</span>
                    <span className="font-semibold">{country.symbol} {Math.round(localMin).toLocaleString()} - {Math.round(localMax).toLocaleString()}</span>
                  </div>
                  <div className="relative h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="absolute h-full bg-primary" 
                      style={{ 
                        left: '0%', 
                        width: `${Math.min(100, (localUserEquivalent / localMax) * 100)}%` 
                      }} 
                    />
                  </div>
                  <div className="text-[10px] text-muted-foreground italic text-center">
                    Based on Michael Page {country.name} 2025 cross-market delta
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Insights */}
          <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
            <h5 className="font-bold text-primary mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Strategic Growth Insights
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground leading-relaxed">
              <p>
                Roles in <span className="text-foreground font-semibold">{malaysiaBenchmark.sector}</span> in {country.name} typically command a <span className="text-emerald-600 font-bold">{Math.round((country.multiplier - 1) * 100)}% premium</span> in base salary adjustment due to international market demand and local cost of living factors.
              </p>
              <p>
                While the absolute amount is higher, remember to account for higher housing and transport costs in major hubs like {country.name === 'Singapore' ? 'Singapore' : country.name === 'United Kingdom' ? 'London' : country.name === 'UAE' ? 'Dubai' : country.name === 'United States' ? 'San Francisco/NY' : 'major cities'} when planning a potential relocation.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border flex justify-end bg-secondary/5">
          <Button onClick={onClose} className="rounded-xl px-8">Close Comparison</Button>
        </div>
      </div>
    </div>
  );
}

export default function BenchmarkView({ 
  monthlyIncome = 0,
  initialSector = "",
  initialSpecialisation = "",
  initialRole = "",
  onSaveRole
}: { 
  monthlyIncome?: number;
  initialSector?: string;
  initialSpecialisation?: string;
  initialRole?: string;
  onSaveRole?: (sector: string, specialisation: string, role: string) => void;
}) {
  const [sector, setSector] = useState(initialSector);
  const [specialisation, setSpecialisation] = useState(initialSpecialisation);
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [roleSearch, setRoleSearch] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showBrowse, setShowBrowse] = useState(false);
  const [showGlobalModal, setShowGlobalModal] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Sync initial props if they change externally (e.g. data load completes after mount)
  useEffect(() => {
    if (initialSector) setSector(initialSector);
    if (initialSpecialisation) setSpecialisation(initialSpecialisation);
    if (initialRole) setSelectedRole(initialRole);
  }, [initialSector, initialSpecialisation, initialRole]);

  const userAnnualSalary = monthlyIncome * 12;

  // Available specialisations for selected sector
  const availableSpecialisations = useMemo(() => {
    const s = SECTORS.find((s) => s.name === sector);
    return s?.specialisations || [];
  }, [sector]);

  // Available roles for selected sector + specialisation
  const availableRoles = useMemo(() => {
    if (!sector || !specialisation) return [];
    return getRolesForSpecialisation(sector, specialisation);
  }, [sector, specialisation]);

  // Search results
  const searchResults = useMemo(() => {
    return searchRoles(roleSearch);
  }, [roleSearch]);

  // Current benchmark data
  const currentBenchmark = useMemo<SalaryBenchmark | null>(() => {
    if (!selectedRole) return null;
    return SALARY_DATA.find((d) => d.role === selectedRole) || null;
  }, [selectedRole]);

  // Reset downstream selections when parent changes
  const handleSectorChange = (val: string) => {
    setSector(val);
    setSpecialisation('');
    setSelectedRole('');
    if (onSaveRole) onSaveRole(val, '', '');
  };

  const handleSpecialisationChange = (val: string) => {
    setSpecialisation(val);
    setSelectedRole('');
    if (onSaveRole) onSaveRole(sector, val, '');
  };

  const handleRoleChange = (val: string) => {
    setSelectedRole(val);
    if (onSaveRole) onSaveRole(sector, specialisation, val);
  };

  // Handle search-based role selection
  const handleSearchSelect = (benchmark: SalaryBenchmark) => {
    setSector(benchmark.sector);
    setSpecialisation(benchmark.specialisation);
    setSelectedRole(benchmark.role);
    setRoleSearch('');
    setShowSearchResults(false);
    if (onSaveRole) onSaveRole(benchmark.sector, benchmark.specialisation, benchmark.role);
  };

  // Close search dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Comparison summary
  const comparisonSummary = useMemo(() => {
    if (!currentBenchmark || userAnnualSalary <= 0) return null;
    const diff = userAnnualSalary - currentBenchmark.avgAnnual;
    const absDiff = Math.abs(diff);
    const pctDiff = Math.round((absDiff / currentBenchmark.avgAnnual) * 100);

    if (diff > 0) {
      return {
        type: 'above' as const,
        text: `As ${currentBenchmark.role} in ${currentBenchmark.specialisation}, you earn ${formatMYR(absDiff)} more than the average`,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        emoji: '🎉',
        pct: pctDiff,
      };
    } else if (diff < 0) {
      return {
        type: 'below' as const,
        text: `As ${currentBenchmark.role} in ${currentBenchmark.specialisation}, you earn ${formatMYR(absDiff)} less than the average`,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        emoji: '📊',
        pct: pctDiff,
      };
    }
    return {
      type: 'equal' as const,
      text: `As ${currentBenchmark.role} in ${currentBenchmark.specialisation}, you earn exactly the market average`,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      emoji: '✅',
      pct: 0,
    };
  }, [currentBenchmark, userAnnualSalary]);

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left: Gauge & Result */}
        <div className="lg:col-span-7 xl:col-span-8">
          <section className="bg-card border border-border rounded-2xl shadow-sm p-3 sm:p-4">
            <div className="mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-foreground">Compare your role across markets</h2>
            </div>

            {currentBenchmark && userAnnualSalary > 0 ? (
              <>
                {/* Summary Banner */}
                {comparisonSummary && (
                  <div className={`${comparisonSummary.bgColor} border ${comparisonSummary.borderColor} rounded-xl p-4 shadow-sm mb-4`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-white/60">
                        <span className="text-lg">{comparisonSummary.emoji}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium ${comparisonSummary.color}`}>
                          {comparisonSummary.text}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Gauge */}
                <div className="relative overflow-hidden rounded-xl bg-secondary/10 border border-border p-4 sm:p-6">
                  <SalaryGauge
                    benchmark={currentBenchmark}
                    userAnnualSalary={userAnnualSalary}
                  />
                </div>

              </>
            ) : (
              <div className="relative overflow-hidden rounded-xl bg-secondary/10 border border-border p-4 sm:p-6 min-h-[350px] flex flex-col items-center justify-center">
                <div className="relative w-full max-w-[400px] flex flex-col items-center pt-4">
                  <svg viewBox="0 0 400 280" className="w-full max-w-[400px]">
                    <path
                      d="M 40 220 A 160 160 0 0 1 360 220"
                      fill="none"
                      stroke="hsl(var(--border))"
                      strokeWidth="20"
                      strokeLinecap="round"
                      opacity="0.3"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 text-center px-4">
                    <p className="text-foreground/70 font-medium">Select a role to compare</p>
                    <p className="text-muted-foreground text-sm mt-1 max-w-xs">
                      {userAnnualSalary <= 0
                        ? 'Set up your income in the Classification tab first, then choose a role.'
                        : 'Choose your sector, specialisation, and role to see how your salary compares.'}
                    </p>
                  </div>
                </div>
              </div>
            )}


          </section>
        </div>

        {/* Right: Controls */}
        <div className="lg:col-span-5 xl:col-span-4">
          <section className="bg-card border border-border rounded-2xl shadow-sm p-4 space-y-4">
            <div className="mb-2">
              <h3 className="flex items-center gap-2 text-xl font-semibold text-foreground tracking-tight mb-1.5">
                <Search className="w-5 h-5 text-primary" />
                Find your role
              </h3>
              <p className="text-xs text-muted-foreground">See how your compensation stacks up against market benchmarks.</p>
            </div>



            {/* Search bar */}
            <div ref={searchRef} className="relative">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Quick search by job title
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="e.g. Product Manager"
                  value={roleSearch}
                  onChange={(e) => {
                    setRoleSearch(e.target.value);
                    setShowSearchResults(true);
                  }}
                  onFocus={() => setShowSearchResults(true)}
                  className="w-full bg-secondary/30 border border-border/60 rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Search results dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute z-20 top-full mt-1 w-full bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((r) => (
                    <button
                      key={`${r.sector}-${r.specialisation}-${r.role}`}
                      onClick={() => handleSearchSelect(r)}
                      className="w-full text-left px-3 py-2 hover:bg-secondary/30 transition-colors border-b border-border/30 last:border-0"
                    >
                      <div className="text-sm font-medium text-foreground">{r.role}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {r.sector} · {r.specialisation}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected role pill — shown after a search selection */}
            {selectedRole && sector && specialisation && (
              <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-emerald-700 truncate">{selectedRole}</div>
                  <div className="text-[11px] text-emerald-600/80 truncate">{sector} · {specialisation}</div>
                </div>
                <button
                  onClick={() => {
                    setSector('');
                    setSpecialisation('');
                    setSelectedRole('');
                    if (onSaveRole) onSaveRole('', '', '');
                  }}
                  className="shrink-0 mt-0.5 text-emerald-500 hover:text-emerald-700 transition-colors"
                  aria-label="Clear selection"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Browse toggle */}
            <div>
              <button
                onClick={() => setShowBrowse((prev) => !prev)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-border/60 bg-secondary/20 hover:bg-secondary/40 transition-colors text-sm font-medium text-foreground"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-muted-foreground" />
                  <span>Browse by sector</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${showBrowse ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Collapsible browse dropdowns */}
              {showBrowse && (
                <div className="mt-2 space-y-3 p-3 rounded-lg border border-border/40 bg-secondary/10">
                  {/* Sector */}
                  <CustomSelect
                    label="Sector"
                    value={sector}
                    options={SECTORS.map((s) => s.name)}
                    onChange={handleSectorChange}
                    placeholder="Select a sector"
                  />

                  {/* Specialisation */}
                  <CustomSelect
                    label="Specialisation"
                    value={specialisation}
                    options={availableSpecialisations}
                    onChange={handleSpecialisationChange}
                    placeholder="Select a specialisation"
                    disabled={!sector}
                  />

                  {/* Role */}
                  <CustomSelect
                    label="Job Role"
                    value={selectedRole}
                    options={availableRoles.map((r) => r.role)}
                    onChange={handleRoleChange}
                    placeholder="Select a role"
                    disabled={!specialisation}
                  />
                </div>
              )}
            </div>

            {/* Current income display */}
            {userAnnualSalary > 0 && (
              <div className="bg-secondary/20 border border-border/50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Your annual salary</span>
                  <span className="text-sm font-semibold text-foreground">{formatMYR(userAnnualSalary)}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">Monthly gross</span>
                  <span className="text-xs text-muted-foreground">{formatMYR(monthlyIncome)}</span>
                </div>
              </div>
            )}

            {/* Global Comparison CTA */}
            {currentBenchmark && userAnnualSalary > 0 && (
              <div className="bg-gradient-to-br from-emerald-500 to-teal-700 rounded-2xl p-5 text-white shadow-lg shadow-emerald-100 relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                  <Globe className="w-24 h-24" />
                </div>
                <div className="relative z-10">
                  <h4 className="text-lg font-black mb-1 flex items-center gap-2">
                     Go global? 🌏
                  </h4>
                  <p className="text-[11px] text-emerald-50 mb-3 leading-snug">
                    Compare <span className="font-bold underline decoration-emerald-300">{selectedRole}</span> globally.
                  </p>
                  <button 
                    onClick={() => setShowGlobalModal(true)}
                    className="inline-flex items-center gap-2 bg-white text-emerald-700 px-4 py-2 rounded-xl font-bold text-[11px] hover:bg-emerald-50 transition-all active:scale-95 shadow-lg shadow-black/10"
                  >
                    Compare Globally 
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Info note */}
            <div className="flex items-start gap-2 text-[11px] text-muted-foreground/70">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>Data based on Michael Page Malaysia Salary Guide 2025/2026. Figures are annual base salaries in MYR.</span>
            </div>
          </section>
        </div>
      </div>

      <GlobalComparisonModal 
        isOpen={showGlobalModal} 
        onClose={() => setShowGlobalModal(false)} 
        malaysiaBenchmark={currentBenchmark}
        userAnnualSalary={userAnnualSalary}
      />
    </div>
  );
}
