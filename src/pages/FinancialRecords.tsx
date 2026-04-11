import { DashboardLayout } from "@/features/dashboard/presentation/DashboardLayout";
import FinancialRecordsPage from "@/features/financial-records/presentation/FinancialRecordsPage";

export default function FinancialRecords() {
  return (
    <DashboardLayout>
      <FinancialRecordsPage />
    </DashboardLayout>
  );
}
