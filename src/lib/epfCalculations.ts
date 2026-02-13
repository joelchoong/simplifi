export interface EPFData {
    age: number;
    totalAmount: number;
    totalContribution: number;
    dividendEarned: number;
    yearlyDividend: number;
    yearlyExpenses: number;
    isPostRetirement: boolean;
}

interface EPFProjectionParams {
    currentAge: number;
    retirementAge?: number;
    targetAge?: number; // Age to project until (default 90)
    monthlyIncome: number;
    currentEPFAmount: number;
    annualDividendRate?: number; // e.g., 0.055 for 5.5%
    employeeRate?: number; // Custom employee contribution rate (default 0.11 = 11%)
    employerRate?: number; // Custom employer contribution rate (default auto-calculated)
    monthlyExpenses?: number; // Post-retirement monthly expenses (deducted after retirement)
}

/**
 * Calculate EPF projection from current age to target age
 * 
 * Malaysian EPF contribution rates:
 * - Employee: 11% of monthly salary (customizable)
 * - Employer: 12% (for salary ≤ RM5,000) or 13% (for salary > RM5,000) (customizable)
 * 
 * Contributions stop at retirement age, but dividends continue until target age.
 * 
 * @param params Projection parameters
 * @returns Array of EPF data points by age
 */
export function calculateEPFProjection(params: EPFProjectionParams): EPFData[] {
    const {
        currentAge,
        retirementAge = 60,
        targetAge = 90,
        monthlyIncome,
        currentEPFAmount,
        annualDividendRate = 0.055, // Default 5.5% based on recent EPF dividends
        employeeRate: customEmployeeRate,
        employerRate: customEmployerRate,
        monthlyExpenses = 0,
    } = params;

    const result: EPFData[] = [];

    // Determine employer contribution rate (use custom or default)
    // Rule: 13% for RM5,000 and below, 12% for above RM5,000
    const employerRate = customEmployerRate ?? (monthlyIncome <= 5000 ? 0.13 : 0.12);
    const employeeRate = customEmployeeRate ?? 0.11;

    // Monthly contribution (only until retirement)
    const monthlyContribution = monthlyIncome * (employeeRate + employerRate);

    let totalAmount = currentEPFAmount;
    let totalContribution = 0;
    let totalDividend = 0;

    for (let age = currentAge; age <= targetAge; age++) {
        // Add contributions only until retirement age
        if (age <= retirementAge) {
            const yearlyContribution = monthlyContribution * 12;
            totalContribution += yearlyContribution;
            totalAmount += yearlyContribution;
        }

        // Deduct post-retirement expenses (before dividend, so expenses come out first)
        let currentYearExpenses = 0;
        if (age > retirementAge && monthlyExpenses > 0) {
            currentYearExpenses = monthlyExpenses * 12;
            totalAmount = Math.max(0, totalAmount - currentYearExpenses);
        }

        // Apply dividend at end of year (continues after retirement)
        const yearlyDividend = totalAmount * annualDividendRate;
        totalDividend += yearlyDividend;
        totalAmount += yearlyDividend;

        result.push({
            age,
            totalAmount: Math.round(totalAmount),
            totalContribution: Math.round(totalContribution),
            dividendEarned: Math.round(totalDividend),
            yearlyDividend: Math.round(yearlyDividend),
            yearlyExpenses: Math.round(currentYearExpenses),
            isPostRetirement: age > retirementAge,
        });
    }

    return result;
}

/**
 * Calculate the maximum sustainable monthly withdrawal from retirement age until target age
 * ensuring a remaining balance of at least RM 1.
 */
export function calculateSustainableWithdrawal(params: Omit<EPFProjectionParams, 'monthlyExpenses'>): number {
    let min = 0;
    let max = 1000000; // Start with a high upper bound
    let result = 0;
    const tolerance = 1; // Tolerance for balance search

    // Binary search for the maximum sustainable monthly withdrawal
    for (let i = 0; i < 20; i++) { // 20 iterations gives ~RM1 precision for 1M range
        const mid = (min + max) / 2;
        const projection = calculateEPFProjection({ ...params, monthlyExpenses: mid });

        // Safety check: if projection is empty, something is wrong with inputs (e.g. currentAge > targetAge)
        if (!projection.length) break;

        const finalAmount = projection[projection.length - 1].totalAmount;

        if (finalAmount >= 1) {
            result = mid;
            min = mid;
        } else {
            max = mid;
        }
    }

    return Math.floor(result);
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
    return `RM${amount.toLocaleString('en-MY', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

/**
 * Format large amounts in millions
 */
export function formatMillions(amount: number): string {
    return `RM${(amount / 1_000_000).toFixed(2)}M`;
}
