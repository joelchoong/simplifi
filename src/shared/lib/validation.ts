/**
 * Centralized validation schemas for SimpliFi application
 * Using Zod for runtime type validation and data sanitization
 */
import { z } from "zod";

/**
 * Schema for financial data validation
 * Ensures data integrity for income, EPF, and age fields
 */
export const financialDataSchema = z.object({
    monthly_income: z
        .number({
            required_error: "Monthly income is required",
            invalid_type_error: "Monthly income must be a number",
        })
        .min(0, "Income cannot be negative")
        .max(1000000, "Income value seems unrealistic (max: RM 1,000,000)")
        .int("Income must be a whole number"),

    current_epf: z
        .number({
            invalid_type_error: "EPF amount must be a number",
        })
        .min(0, "EPF amount cannot be negative")
        .max(100000000, "EPF amount seems unrealistic (max: RM 100,000,000)")
        .optional(),

    age: z
        .number({
            invalid_type_error: "Age must be a number",
        })
        .int("Age must be a whole number")
        .min(18, "Age must be at least 18")
        .max(100, "Age must be less than 100")
        .optional(),
});

/**
 * Schema for profile updates
 * Validates user profile data before saving to database
 */
export const profileUpdateSchema = z.object({
    full_name: z
        .string()
        .min(1, "Name cannot be empty")
        .max(100, "Name is too long")
        .optional()
        .nullable(),

    monthly_income: z
        .number()
        .min(0, "Income cannot be negative")
        .max(1000000, "Income value seems unrealistic")
        .optional()
        .nullable(),
});

/**
 * Schema for retirement data
 * Validates retirement planning inputs
 */
export const retirementDataSchema = z.object({
    current_age: z
        .number()
        .int()
        .min(18, "Age must be at least 18")
        .max(100, "Age must be less than 100"),

    current_epf: z
        .number()
        .min(0, "EPF amount cannot be negative")
        .max(100000000, "EPF amount seems unrealistic"),

    employee_contribution_rate: z
        .number()
        .min(0, "Contribution rate cannot be negative")
        .max(100, "Contribution rate cannot exceed 100%"),

    employer_contribution_rate: z
        .number()
        .min(0, "Contribution rate cannot be negative")
        .max(100, "Contribution rate cannot exceed 100%"),

    annual_return_rate: z
        .number()
        .min(-50, "Return rate seems unrealistic")
        .max(100, "Return rate cannot exceed 100%"),

    retirement_age: z
        .number()
        .int()
        .min(50, "Retirement age must be at least 50")
        .max(100, "Retirement age must be less than 100"),
});

/**
 * Schema for income reality data
 * Validates income reality calculation inputs
 */
export const incomeRealityDataSchema = z.object({
    household_type: z.enum(["single", "dual_income", "single_parent"]),
    location: z.enum(["urban", "suburban", "rural"]),
    monthly_expenses: z
        .number()
        .min(0, "Expenses cannot be negative")
        .max(1000000, "Expenses seem unrealistic"),
});

/**
 * Type exports for use in components
 */
export type FinancialData = z.infer<typeof financialDataSchema>;
export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;
export type RetirementData = z.infer<typeof retirementDataSchema>;
export type IncomeRealityData = z.infer<typeof incomeRealityDataSchema>;
