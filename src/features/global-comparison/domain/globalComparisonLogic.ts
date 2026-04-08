export interface CountryData {
  id: string;
  name: string;
  flag: string;
  currency: string;
  symbol: string;
  exchangeRate: number; // 1 MYR to Country Currency
  colIndex: number; // Relative Price level (Baseline = Malaysia = 1.0)
  taxRate: number; // Approximate effective tax rate
  baseLivingCost: number; // Monthly base living cost for 1 person in original currency
}

export const COUNTRIES: CountryData[] = [
  { id: 'my', name: 'Malaysia', flag: '🇲🇾', currency: 'MYR', symbol: 'RM', exchangeRate: 1, colIndex: 1.0, taxRate: 0.12, baseLivingCost: 3500 },
  { id: 'sg', name: 'Singapore', flag: '🇸🇬', currency: 'SGD', symbol: 'S$', exchangeRate: 0.28, colIndex: 1.75, taxRate: 0.10, baseLivingCost: 4500 },
  { id: 'uk', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', symbol: '£', exchangeRate: 0.17, colIndex: 1.90, taxRate: 0.25, baseLivingCost: 2800 },
  { id: 'us', name: 'United States', flag: '🇺🇸', currency: 'USD', symbol: '$', exchangeRate: 0.21, colIndex: 2.10, taxRate: 0.22, baseLivingCost: 3800 },
  { id: 'au', name: 'Australia', flag: '🇦🇺', currency: 'AUD', symbol: 'A$', exchangeRate: 0.32, colIndex: 1.85, taxRate: 0.24, baseLivingCost: 3500 },
  { id: 'ae', name: 'UAE', flag: '🇦🇪', currency: 'AED', symbol: 'د.إ', exchangeRate: 0.77, colIndex: 1.60, taxRate: 0.05, baseLivingCost: 8000 },
];

export type LifestyleLevel = 'frugal' | 'balanced' | 'comfortable';

export const LIFESTYLE_MULTIPLIERS: Record<LifestyleLevel, number> = {
  frugal: 0.8,
  balanced: 1.0,
  comfortable: 1.3,
};

export interface ComparisonResult {
  equivalentSalary: number;
  colAdjustment: number;
  taxAdjustment: number;
  savingsPotential: number;
  countryB: CountryData;
  disposableIncomeA: number;
  costIndex: number;
  netIncomeA: number;
}

/**
 * Formula Logic:
 * 1. Net Income (A) = Salary (A) * (1 - Tax (A))
 * 2. Disposable (A) = Net (A) - Base Living Cost (A)
 * 3. Required Disposable (B) = Disposable (A) * (Cost Index B/A) * Lifestyle Multiplier
 * 4. Required Net (B) = Base Living Cost (B) + Required Disposable (B)
 * 5. Final Gross Salary (B) = Required Net (B) / (1 - Tax Rate (B))
 */
export function calculateGlobalComparison(
  salaryA: number,
  countryA: CountryData,
  countryB: CountryData,
  lifestyle: LifestyleLevel
): ComparisonResult {
  const lifestyleMultiplier = LIFESTYLE_MULTIPLIERS[lifestyle];
  
  // A. Origin Country analysis
  const netIncomeA = salaryA * (1 - countryA.taxRate);
  const disposableIncomeA = netIncomeA - countryA.baseLivingCost;
  
  // B. Scaling factors
  const costIndex = countryB.colIndex / countryA.colIndex;
  
  // C. Target Country requirement
  // Scaling ONLY the disposable portion (the "Upgrade")
  const disposableRequirementB = disposableIncomeA * countryB.exchangeRate * costIndex * lifestyleMultiplier;
  
  // Adding back the Base Living Cost of target country (the "Survival")
  const netRequiredB = countryB.baseLivingCost + disposableRequirementB;
  
  // Grossing up for taxes
  const equivalentSalaryB = netRequiredB / (1 - countryB.taxRate);
  
  return {
    equivalentSalary: equivalentSalaryB,
    colAdjustment: disposableRequirementB * (1 - 1/costIndex),
    taxAdjustment: equivalentSalaryB * countryB.taxRate,
    savingsPotential: disposableRequirementB * 0.2, // Estimated savings buffer
    countryB,
    disposableIncomeA,
    costIndex,
    netIncomeA
  };
}
