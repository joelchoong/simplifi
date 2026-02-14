// Household Income Distribution Bands - DOSM Malaysia 2024
export interface IncomeBand {
  min: number;
  max: number;
  cumLow: number;
  cumHigh: number;
}

export const HOUSEHOLD_INCOME_DISTRIBUTION_BANDS: IncomeBand[] = [
  { min: 0, max: 999, cumLow: 0, cumHigh: 1.8 },
  { min: 1000, max: 1999, cumLow: 1.8, cumHigh: 8.5 },
  { min: 2000, max: 2999, cumLow: 8.5, cumHigh: 19.2 },
  { min: 3000, max: 3999, cumLow: 19.2, cumHigh: 31.4 },
  { min: 4000, max: 4999, cumLow: 31.4, cumHigh: 42.6 },
  { min: 5000, max: 5999, cumLow: 42.6, cumHigh: 52.1 },
  { min: 6000, max: 6999, cumLow: 52.1, cumHigh: 59.8 },
  { min: 7000, max: 7999, cumLow: 59.8, cumHigh: 66.2 },
  { min: 8000, max: 8999, cumLow: 66.2, cumHigh: 71.5 },
  { min: 9000, max: 9999, cumLow: 71.5, cumHigh: 75.8 },
  { min: 10000, max: 10999, cumLow: 75.8, cumHigh: 79.3 },
  { min: 11000, max: 11999, cumLow: 79.3, cumHigh: 82.2 },
  { min: 12000, max: 12999, cumLow: 82.2, cumHigh: 84.6 },
  { min: 13000, max: 13999, cumLow: 84.6, cumHigh: 86.7 },
  { min: 14000, max: 14999, cumLow: 86.7, cumHigh: 88.4 },
  { min: 15000, max: 19999, cumLow: 88.4, cumHigh: 93.3 },
  { min: 20000, max: 24999, cumLow: 93.3, cumHigh: 95.8 },
  { min: 25000, max: 29999, cumLow: 95.8, cumHigh: 97.2 },
  { min: 30000, max: 39999, cumLow: 97.2, cumHigh: 98.5 },
  { min: 40000, max: Infinity, cumLow: 98.5, cumHigh: 100 },
];

export function getIncomePercentileRange(income: number): { lo: number; hi: number } {
  for (const band of HOUSEHOLD_INCOME_DISTRIBUTION_BANDS) {
    if (income >= band.min && income <= band.max) {
      // Return the percentile range (inverted for "top X%")
      return { lo: 100 - band.cumHigh, hi: 100 - band.cumLow };
    }
  }
  // If income is very high (above all bands)
  return { lo: 0, hi: 1.5 };
}

export function rmBand(value: number): string {
  if (value === Infinity) return "RM40,000+";
  return `RM${value.toLocaleString("en-MY")}`;
}
