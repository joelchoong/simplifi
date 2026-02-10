import React from 'react';
import IncomeRealityInputs from './IncomeRealityInputs';
import { Scale } from 'lucide-react';

interface IncomeRealityViewProps {
  initialMonthlyIncome?: number;
}

const IncomeRealityView: React.FC<IncomeRealityViewProps> = ({
  initialMonthlyIncome = 0,
}) => {
  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left: Chart placeholder */}
        <div className="lg:col-span-7 xl:col-span-8">
          <section className="bg-card border border-border rounded-2xl shadow-sm p-4">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-foreground">Can your income support your life?</h2>
            </div>

            <div className="relative overflow-hidden rounded-xl bg-secondary/10 border border-border p-4 pb-0 h-[400px] flex flex-col items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Scale className="w-10 h-10 text-muted-foreground/40" />
                <p className="text-sm">Chart coming soon</p>
              </div>
            </div>
          </section>
        </div>

        {/* Right: Inputs */}
        <div className="lg:col-span-5 xl:col-span-4">
          <IncomeRealityInputs initialMonthlyIncome={initialMonthlyIncome} />
        </div>
      </div>
    </div>
  );
};

export default IncomeRealityView;
