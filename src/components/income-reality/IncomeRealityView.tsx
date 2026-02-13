import React, { useState, useMemo } from 'react';
import IncomeRealityInputs from './IncomeRealityInputs';
import IncomeRealityChart from './IncomeRealityChart';
import { calculateIncomeReality, HouseholdType, Location, IncomeRealityResult, ExpenseAssumptions, DEFAULT_EXPENSES } from '@/lib/incomeRealityCalculations';

interface IncomeRealityViewProps {
  initialMonthlyIncome?: number;
  initialHousingCost?: number;
  initialHouseholdType?: string;
  initialDependants?: number;
  initialLocation?: string;
  initialExpenses?: ExpenseAssumptions;
  onSave?: (data: {
    housingCost: number;
    householdType: string;
    dependants: number;
    location: string;
    expenseFood: number;
    expenseTransport: number;
    expenseUtilities: number;
    expenseOthers: number;
  }) => void;
}

const IncomeRealityView: React.FC<IncomeRealityViewProps> = ({
  initialMonthlyIncome = 0,
  initialHousingCost = 0,
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

  const handleChanged = (data: typeof inputs) => {
    setInputs(data);
  };

  const handleSave = (data: typeof inputs) => {
    if (onSave) {
      onSave({
        housingCost: data.housingCost,
        householdType: data.householdType,
        dependants: data.dependants,
        location: data.location,
        expenseFood: data.expenses.food,
        expenseTransport: data.expenses.transport,
        expenseUtilities: data.expenses.utilities,
        expenseOthers: data.expenses.others,
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left: Chart */}
        <div className="lg:col-span-7 xl:col-span-8">
          <section className="bg-card border border-border rounded-2xl shadow-sm p-4">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-foreground">Can your income support your life?</h2>
            </div>
            <div className="relative overflow-hidden rounded-xl bg-secondary/10 border border-border p-4 h-[400px]">
              <IncomeRealityChart result={result} />
            </div>
          </section>
        </div>

        {/* Right: Inputs */}
        <div className="lg:col-span-5 xl:col-span-4">
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
