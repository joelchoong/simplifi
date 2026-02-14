import { DashboardLayout } from "@/features/dashboard/presentation/DashboardLayout";
import { IncomeTierChart } from "@/features/tier/presentation/IncomeTierChart";
import { IncomeCalculator } from "@/features/classification/presentation/IncomeCalculator";

interface DashboardContentProps {
  monthlyIncome?: number;
  onSaveIncome?: (income: number) => void;
}

function DashboardContent({ monthlyIncome = 0, onSaveIncome }: DashboardContentProps) {
  const handleSaveIncome = (newGrossIncome: number) => {
    if (onSaveIncome) {
      onSaveIncome(newGrossIncome);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-7 xl:col-span-8">
          {monthlyIncome > 0 ? (
            <IncomeTierChart monthlyIncome={monthlyIncome} />
          ) : (
            <div className="h-[436px] bg-secondary/10 border border-dashed border-border rounded-2xl flex items-center justify-center">
              <p className="text-muted-foreground">Setup your income to see the chart</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 xl:col-span-4">
          <IncomeCalculator
            initialGross={monthlyIncome}
            onSave={handleSaveIncome}
          />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  );
}
