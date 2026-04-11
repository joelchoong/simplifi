export interface NetWorthFormValues {
  totalCash: number;
  totalInvestments: number;
  totalProperty: number;
  totalLiabilities: number;
}

export interface NetWorthRecord extends NetWorthFormValues {
  id: string;
  entryMonth: string;
  netWorth: number;
  epfAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyNetWorthChange {
  absolute: number | null;
  percentage: number | null;
}

export const EMPTY_NET_WORTH_VALUES: NetWorthFormValues = {
  totalCash: 0,
  totalInvestments: 0,
  totalProperty: 0,
  totalLiabilities: 0,
};

export function normaliseNetWorthValues(values: Partial<NetWorthFormValues>): NetWorthFormValues {
  return {
    totalCash: Math.max(0, Number(values.totalCash) || 0),
    totalInvestments: Math.max(0, Number(values.totalInvestments) || 0),
    totalProperty: Math.max(0, Number(values.totalProperty) || 0),
    totalLiabilities: Math.max(0, Number(values.totalLiabilities) || 0),
  };
}

export function calculateNetWorth(values: NetWorthFormValues): number {
  return values.totalCash + values.totalInvestments + values.totalProperty - values.totalLiabilities;
}

export function calculateNetWorthWithEPF(values: NetWorthFormValues, epfAmount = 0): number {
  return calculateNetWorth(values) + Math.max(0, epfAmount);
}

export function getMonthStart(date = new Date()): string {
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const year = monthStart.getFullYear();
  const month = String(monthStart.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

export function normaliseEntryMonth(value: string): string {
  if (!value) return getMonthStart();
  if (/^\d{4}-\d{2}$/.test(value)) {
    return `${value}-01`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month] = value.split("-");
    return `${year}-${month}-01`;
  }
  return getMonthStart();
}

export function getMonthDifference(fromEntryMonth: string, toEntryMonth: string): number {
  const [fromYear, fromMonth] = normaliseEntryMonth(fromEntryMonth).split("-").map(Number);
  const [toYear, toMonth] = normaliseEntryMonth(toEntryMonth).split("-").map(Number);
  return (toYear - fromYear) * 12 + (toMonth - fromMonth);
}

export function calculateDefaultMonthlyEPFContribution(
  monthlyIncome: number,
  monthlyVoluntaryContribution = 0,
): number {
  const safeIncome = Math.max(0, monthlyIncome || 0);
  const employerRate = safeIncome <= 5000 ? 0.13 : 0.12;
  const employeeRate = 0.11;
  return (safeIncome * (employeeRate + employerRate)) + Math.max(0, monthlyVoluntaryContribution || 0);
}

export function projectEPFForMonth(params: {
  currentEPF: number;
  currentMonth: string;
  targetMonth: string;
  monthlyContribution: number;
}): number {
  const monthsDelta = getMonthDifference(params.currentMonth, params.targetMonth);
  const projected = params.currentEPF + (monthsDelta * params.monthlyContribution);
  return Math.max(0, Math.round(projected));
}

export function getPreviousMonthStart(entryMonth: string): string {
  const [year, month] = entryMonth.split("-").map(Number);
  const previous = new Date(year, month - 2, 1);
  return getMonthStart(previous);
}

export function calculateMonthlyChange(
  currentNetWorth: number | null,
  previousNetWorth: number | null,
): MonthlyNetWorthChange {
  if (currentNetWorth === null || previousNetWorth === null) {
    return { absolute: null, percentage: null };
  }

  const absolute = currentNetWorth - previousNetWorth;
  if (previousNetWorth === 0) {
    return { absolute, percentage: null };
  }

  return {
    absolute,
    percentage: (absolute / previousNetWorth) * 100,
  };
}

export function formatMonthLabel(entryMonth: string): string {
  const date = new Date(`${entryMonth}T00:00:00`);
  return new Intl.DateTimeFormat("en-MY", {
    month: "short",
    year: "numeric",
  }).format(date);
}
