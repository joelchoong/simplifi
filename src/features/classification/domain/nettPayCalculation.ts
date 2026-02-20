// Nett Pay Calculation - Malaysia statutory deductions
// Shared utility used by IncomeCalculator and phase determination logic

const WAGE_CEILING = 6000;
const EPF_RATE = 11; // %
const SOCSO_RATE = 0.5; // %
const EIS_RATE = 0.2; // %

// Standard Reliefs (2024)
const RELIEF_INDIVIDUAL = 9000;
const MAX_EPF_RELIEF = 4000;

function calculateAnnualTax(monthlyGross: number, monthlyEPF: number): number {
  const annualGross = monthlyGross * 12;
  const reliefEPF = Math.min(monthlyEPF * 12, MAX_EPF_RELIEF);
  const chargeableIncome = Math.max(0, annualGross - RELIEF_INDIVIDUAL - reliefEPF);

  if (chargeableIncome <= 5000) return 0;

  let totalTax = 0;
  if (chargeableIncome <= 20000) totalTax = (chargeableIncome - 5000) * 0.01;
  else if (chargeableIncome <= 35000) totalTax = 150 + (chargeableIncome - 20000) * 0.03;
  else if (chargeableIncome <= 50000) totalTax = 600 + (chargeableIncome - 35000) * 0.06;
  else if (chargeableIncome <= 70000) totalTax = 1500 + (chargeableIncome - 50000) * 0.11;
  else if (chargeableIncome <= 100000) totalTax = 3700 + (chargeableIncome - 70000) * 0.19;
  else if (chargeableIncome <= 400000) totalTax = 9400 + (chargeableIncome - 100000) * 0.25;
  else if (chargeableIncome <= 600000) totalTax = 84400 + (chargeableIncome - 400000) * 0.26;
  else if (chargeableIncome <= 2000000) totalTax = 136400 + (chargeableIncome - 600000) * 0.28;
  else totalTax = 528400 + (chargeableIncome - 2000000) * 0.30;

  return Math.max(0, totalTax);
}

/**
 * Calculate estimated nett pay (take-home) from gross monthly income.
 * Uses default statutory rates (EPF 11%, SOCSO 0.5%, EIS 0.2%, PCB auto).
 */
export function calculateNettPay(grossMonthly: number, age: number = 30): number {
  if (grossMonthly <= 0) return 0;

  const epf = (grossMonthly * EPF_RATE) / 100;
  const socsoBase = Math.min(grossMonthly, WAGE_CEILING);
  const socso = age >= 60 ? 0 : socsoBase * (SOCSO_RATE / 100);
  const eis = age >= 60 ? 0 : socsoBase * (EIS_RATE / 100);
  const monthlyTax = calculateAnnualTax(grossMonthly, epf) / 12;

  return Math.max(0, grossMonthly - epf - socso - eis - monthlyTax);
}
