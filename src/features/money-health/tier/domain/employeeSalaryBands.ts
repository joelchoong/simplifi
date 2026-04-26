// Employee Salary Distribution Bands - DOSM Malaysia Q2 2025
export interface SalaryBand {
  min: number;
  max: number;
  cumLow: number;
  cumHigh: number;
}

export const EMPLOYEE_SALARY_DISTRIBUTION_BANDS: SalaryBand[] = [
  { min: 0, max: 1499, cumLow: 0, cumHigh: 12.3 },
  { min: 1500, max: 1999, cumLow: 12.3, cumHigh: 24.8 },
  { min: 2000, max: 2499, cumLow: 24.8, cumHigh: 37.5 },
  { min: 2500, max: 2999, cumLow: 37.5, cumHigh: 48.2 },
  { min: 3000, max: 3499, cumLow: 48.2, cumHigh: 56.8 },
  { min: 3500, max: 3999, cumLow: 56.8, cumHigh: 63.5 },
  { min: 4000, max: 4499, cumLow: 63.5, cumHigh: 69.1 },
  { min: 4500, max: 4999, cumLow: 69.1, cumHigh: 73.6 },
  { min: 5000, max: 5999, cumLow: 73.6, cumHigh: 80.2 },
  { min: 6000, max: 6999, cumLow: 80.2, cumHigh: 84.8 },
  { min: 7000, max: 7999, cumLow: 84.8, cumHigh: 88.1 },
  { min: 8000, max: 8999, cumLow: 88.1, cumHigh: 90.5 },
  { min: 9000, max: 9999, cumLow: 90.5, cumHigh: 92.3 },
  { min: 10000, max: 14999, cumLow: 92.3, cumHigh: 96.2 },
  { min: 15000, max: 19999, cumLow: 96.2, cumHigh: 97.8 },
  { min: 20000, max: Infinity, cumLow: 97.8, cumHigh: 100 },
];

export function getIncomePercentileRange(income: number): { lo: number; hi: number } {
  for (const band of EMPLOYEE_SALARY_DISTRIBUTION_BANDS) {
    if (income >= band.min && income <= band.max) {
      return { lo: 100 - band.cumHigh, hi: 100 - band.cumLow };
    }
  }
  return { lo: 0, hi: 2.2 };
}

export function rmBand(value: number): string {
  if (value === Infinity) return "RM20,000+";
  return `RM${value.toLocaleString("en-MY")}`;
}
