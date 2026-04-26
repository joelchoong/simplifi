import React, { useState, useMemo } from 'react';
import IncomeRealityInputs from './IncomeRealityInputs';
import IncomeRealityChart from './IncomeRealityChart';
import { calculateIncomeReality, HouseholdType, Location, IncomeRealityResult, ExpenseAssumptions, DEFAULT_EXPENSES } from '@/features/money-health/income-reality/domain/incomeRealityCalculations';
import { calculateSustainableWithdrawal, calculateEPFProjection } from '@/features/money-health/retirement/domain/epfCalculations';
import { calculateNettPay } from '@/features/money-health/classification/domain/nettPayCalculation';

interface IncomeRealityViewProps {
  initialMonthlyIncome?: number;
  initialHousingCost?: number;
  initialCurrentEPF?: number;
  initialAge?: number;
  initialHouseholdType?: string;
  initialDependants?: number;
  initialLocation?: string;
  initialExpenses?: ExpenseAssumptions;
  onSave?: (data: {
    monthlyIncome: number;
    housingCost: number;
    householdType: string;
    dependants: number;
    location: string;
    expenseFood: number;
    expenseTransport: number;
    expenseUtilities: number;
    expenseOthers: number;
    expenseEntertainment: number;
  }) => void;
}

const IncomeRealityView: React.FC<IncomeRealityViewProps> = ({
  initialMonthlyIncome = 0,
  initialHousingCost = 0,
  initialCurrentEPF = 0,
  initialAge = 25,
  initialHouseholdType = 'alone',
  initialDependants = 1,
  initialLocation = 'kl',
  initialExpenses,
  onSave,
}) => {
  const [inputs, setInputs] = useState({
    monthlyIncome: initialMonthlyIncome,
    housingCost: initialHousingCost,
    householdType: initialHouseholdType as HouseholdType,
    dependants: initialDependants,
    location: initialLocation as Location,
    expenses: initialExpenses ? { ...initialExpenses } : { ...DEFAULT_EXPENSES } as ExpenseAssumptions,
  });

  const result: IncomeRealityResult | null = useMemo(() => {
    if (inputs.monthlyIncome <= 0) return null;
    return calculateIncomeReality(
      inputs.monthlyIncome,
      inputs.housingCost,
      inputs.householdType,
      inputs.dependants,
      inputs.location,
      inputs.expenses
    );
  }, [inputs]);

  const { sustainableWithdrawal, retirementDividends } = useMemo(() => {
    if (!initialAge || initialAge < 18 || initialAge > 60 || !inputs.monthlyIncome) {
      return { sustainableWithdrawal: 0, retirementDividends: 0 };
    }

    const sustainable = calculateSustainableWithdrawal({
      currentAge: initialAge,
      retirementAge: 60,
      targetAge: 90,
      monthlyIncome: inputs.monthlyIncome,
      currentEPFAmount: initialCurrentEPF,
    });

    // To get retirement dividends, we look at the dividend at age 60 from a "no-expense" projection
    const projection = calculateEPFProjection({
      currentAge: initialAge,
      retirementAge: 60,
      targetAge: 90,
      monthlyIncome: inputs.monthlyIncome,
      currentEPFAmount: initialCurrentEPF,
      monthlyExpenses: 0,
    });

    const retirementData = projection.find(d => d.age === 60);
    const monthlyDividend = retirementData ? Math.round(retirementData.yearlyDividend / 12) : 0;

    return { sustainableWithdrawal: sustainable, retirementDividends: monthlyDividend };
  }, [initialAge, inputs.monthlyIncome, initialCurrentEPF]);

  const nettPay = useMemo(() => calculateNettPay(inputs.monthlyIncome, initialAge), [inputs.monthlyIncome, initialAge]);

  const handleChanged = (data: typeof inputs) => {
    setInputs(data);
  };

  const handleSave = (data: typeof inputs) => {
    if (onSave) {
      onSave({
        monthlyIncome: data.monthlyIncome,
        housingCost: data.housingCost,
        householdType: data.householdType,
        dependants: data.dependants,
        location: data.location,
        expenseFood: data.expenses.food,
        expenseTransport: data.expenses.transport,
        expenseUtilities: data.expenses.utilities,
        expenseOthers: data.expenses.others,
        expenseEntertainment: data.expenses.entertainment,
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Chart */}
        <div className="lg:col-span-7 xl:col-span-8 order-1">
          <section className="bg-card border border-border rounded-2xl shadow-sm p-3 sm:p-4">
            <div className="mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-foreground">Can your income support your life?</h2>
            </div>

            {result && inputs.monthlyIncome > 0 && (
              <div className="bg-secondary/20 border border-border/50 rounded-xl p-4 shadow-sm relative group hover:border-border transition-colors mb-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${(result.baselineLifeCost / inputs.monthlyIncome) > 0.8
                    ? "bg-amber-500/10 text-amber-600"
                    : "bg-emerald-500/10 text-emerald-600"
                    }`}>
                    <span className="text-lg">{(result.baselineLifeCost / inputs.monthlyIncome) > 0.8 ? "⚠️" : "✅"}</span>
                  </div>
                  <div className="flex-1 min-w-0 flex items-center h-10">
                    <div className="text-sm text-foreground leading-relaxed">
                      {(() => {
                        if (!result || inputs.monthlyIncome <= 0) return null;
                        const isExceeding = (result.baselineLifeCost / inputs.monthlyIncome) > 0.8;

                        if (isExceeding) {
                          // Compare against baseline defaults adjusted for household/location
                          const baseMultiplier = result.householdMultiplier * result.locationMultiplier;

                          // Actual input expenses
                          const currentEntertainment = inputs.expenses.entertainment;
                          // Calculated "essential" parts from inputs (excluding entertainment)
                          const currentEssentials = inputs.expenses.food + inputs.expenses.transport + inputs.expenses.utilities + inputs.expenses.others;

                          // Default baseline expenses adjusted for their specific situation
                          const baselineEntertainment = DEFAULT_EXPENSES.entertainment * baseMultiplier;
                          const baselineEssentials = (DEFAULT_EXPENSES.food + DEFAULT_EXPENSES.transport + DEFAULT_EXPENSES.utilities + DEFAULT_EXPENSES.others) * baseMultiplier;

                          let reduceRecommendation = "";

                          // 1. Check if entertainment is bloated relative to its baseline
                          if (currentEntertainment > baselineEntertainment) {
                            reduceRecommendation = "entertainment costs";
                          }
                          // 2. Check if living essentials are bloated relative to their baseline
                          else if (currentEssentials > baselineEssentials) {
                            reduceRecommendation = "living essentials";
                          }
                          // 3. If neither of the above are bloated, housing must be the issue
                          else {
                            reduceRecommendation = "housing costs";
                          }

                          return (
                            <span>
                              Your expenses of <span className="font-bold text-amber-600">RM {Math.round(result.baselineLifeCost).toLocaleString()}</span> are <span className="font-bold text-amber-600">{Math.round((result.baselineLifeCost / inputs.monthlyIncome) * 100)}%</span> of your income. Consider reducing your {reduceRecommendation}.
                            </span>
                          );
                        }

                        return (
                          <span>
                            Great job! Your expenses of <span className="font-bold text-emerald-600">RM {Math.round(result.baselineLifeCost).toLocaleString()}</span> are <span className="font-bold text-emerald-600">{Math.round((result.baselineLifeCost / inputs.monthlyIncome) * 100)}%</span> of your income, leaving a healthy buffer.
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="relative overflow-hidden rounded-xl bg-secondary/10 border border-border p-2 sm:p-4 h-[320px] sm:h-[400px]">
              <IncomeRealityChart
                result={result}
                sustainableWithdrawal={sustainableWithdrawal}
                retirementDividends={retirementDividends}
                nettPay={nettPay}
              />
            </div>
          </section>
        </div>

        {/* Inputs */}
        <div className="lg:col-span-5 xl:col-span-4 order-2">
          <IncomeRealityInputs
            initialMonthlyIncome={initialMonthlyIncome}
            initialHousingCost={initialHousingCost}
            initialHouseholdType={initialHouseholdType}
            initialDependants={initialDependants}
            initialLocation={initialLocation}
            initialExpenses={initialExpenses}
            onChanged={handleChanged}
            onSave={handleSave}
          />
        </div>
      </div>
    </div>
  );
};

export default IncomeRealityView;
