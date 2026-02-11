import React, { useState, useMemo } from 'react';
import IncomeRealityInputs from './IncomeRealityInputs';
import IncomeRealityChart from './IncomeRealityChart';
import { calculateIncomeReality, HouseholdType, Location, IncomeRealityResult } from '@/lib/incomeRealityCalculations';

interface IncomeRealityViewProps {
  initialMonthlyIncome?: number;
}

const IncomeRealityView: React.FC<IncomeRealityViewProps> = ({
  initialMonthlyIncome = 0,
}) => {
  const [inputs, setInputs] = useState({
    monthlyIncome: initialMonthlyIncome,
    housingCost: 0,
    householdType: "alone" as HouseholdType,
    dependants: 1,
    location: "kl" as Location,
  });

  const result: IncomeRealityResult | null = useMemo(() => {
    if (inputs.monthlyIncome <= 0) return null;
    return calculateIncomeReality(
      inputs.monthlyIncome,
      inputs.housingCost,
      inputs.householdType,
      inputs.dependants,
      inputs.location
    );
  }, [inputs]);

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
            onChanged={setInputs}
          />
        </div>
      </div>
    </div>
  );
};

export default IncomeRealityView;
