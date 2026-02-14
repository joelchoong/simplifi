// Default monthly essentials for a single adult in KL (no housing)
export const DEFAULT_EXPENSES = {
  food: 1500,
  transport: 600,
  utilities: 300,
  others: 100,
  entertainment: 500,
};

export interface ExpenseAssumptions {
  food: number;
  transport: number;
  utilities: number;
  others: number;
  entertainment: number;
}

export function getBaseEssentials(expenses: ExpenseAssumptions): number {
  return expenses.food + expenses.transport + expenses.utilities + expenses.others + expenses.entertainment;
}
// Household multipliers
const HOUSEHOLD_MULTIPLIERS: Record<string, number> = {
  alone: 1.0,
  couple: 1.6,
};

// Per-dependant increments (couple + children)
// 1 child = 2.2, 2 children = 2.7 → each child adds ~0.5 on top of couple's 1.6
// But "family" starts at 1 dependant = 2.2, so base family = 2.2, each extra +0.5
const FAMILY_BASE_MULTIPLIER = 2.2;
const PER_EXTRA_DEPENDANT = 0.5;

// Location multipliers
const LOCATION_MULTIPLIERS: Record<string, number> = {
  kl: 1.0,
  urban: 0.85,
  "non-urban": 0.7,
};

export type HouseholdType = "alone" | "couple" | "family";
export type Location = "kl" | "urban" | "non-urban";

export interface IncomeRealityResult {
  baseEssentials: number;
  householdMultiplier: number;
  adjustedEssentials: number;
  locationMultiplier: number;
  locationAdjusted: number;
  othersCost: number;
  housingCost: number;
  baselineLifeCost: number;
  monthlyIncome: number;
  coveragePercent: number;
  surplus: number; // positive = surplus, negative = shortfall
}

export function getHouseholdMultiplier(type: HouseholdType, dependants: number): number {
  if (type === "alone") return HOUSEHOLD_MULTIPLIERS.alone;
  if (type === "couple") return HOUSEHOLD_MULTIPLIERS.couple;
  // family
  return FAMILY_BASE_MULTIPLIER + Math.max(0, dependants - 1) * PER_EXTRA_DEPENDANT;
}

export function getLocationMultiplier(location: Location): number {
  return LOCATION_MULTIPLIERS[location] ?? 1.0;
}

export function calculateIncomeReality(
  monthlyIncome: number,
  housingCost: number,
  householdType: HouseholdType,
  dependants: number,
  location: Location,
  expenses: ExpenseAssumptions = DEFAULT_EXPENSES,
): IncomeRealityResult {
  const baseEssentials = getBaseEssentials(expenses);
  const householdMultiplier = getHouseholdMultiplier(householdType, dependants);
  const locationMultiplier = getLocationMultiplier(location);

  const adjustedEssentials = baseEssentials * householdMultiplier;
  const locationAdjusted = adjustedEssentials * locationMultiplier;
  const othersCost = expenses.others * householdMultiplier * locationMultiplier;
  const baselineLifeCost = locationAdjusted + housingCost;

  const coveragePercent = baselineLifeCost > 0 ? (monthlyIncome / baselineLifeCost) * 100 : 0;
  const surplus = monthlyIncome - baselineLifeCost;

  return {
    baseEssentials,
    householdMultiplier,
    adjustedEssentials,
    locationMultiplier,
    locationAdjusted,
    othersCost,
    housingCost,
    baselineLifeCost,
    monthlyIncome,
    coveragePercent,
    surplus,
  };
}
