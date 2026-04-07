import React, { useState, useMemo, useRef, useEffect } from 'react';
import { SECTORS, SALARY_DATA, SalaryBenchmark, getRolesForSpecialisation, searchRoles } from '@/features/benchmark/domain/salaryData';
import { Search, ChevronDown, Info } from 'lucide-react';

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
        <div className="lg:col-span-7 xl:col-span-8 order-2 lg:order-1">
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
        <div className="lg:col-span-5 xl:col-span-4 order-1 lg:order-2">
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
                Search by job title
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

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">or browse</span>
              <div className="flex-1 h-px bg-border" />
            </div>

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

            {/* Info note */}
            <div className="flex items-start gap-2 text-[11px] text-muted-foreground/70">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>Data based on Michael Page Malaysia Salary Guide 2025/2026. Figures are annual base salaries in MYR.</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
