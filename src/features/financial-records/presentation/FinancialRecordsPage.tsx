import { useMemo, useState } from "react";
import { WalletCards, Edit3, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import SEO from "@/shared/components/SEO";
import NetWorthForm from "@/features/financial-records/presentation/NetWorthForm";
import NetWorthSummary from "@/features/financial-records/presentation/NetWorthSummary";
import NetWorthRecordsEditor from "@/features/financial-records/presentation/NetWorthRecordsEditor";
import { calculateIncomeReality } from "@/features/income-reality/domain/incomeRealityCalculations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { Button } from "@/shared/components/ui/button";
import { useNetWorthRecords } from "@/features/financial-records/hooks/useNetWorthRecords";
import { useProfileData } from "@/features/profile/hooks/useProfileData";
import {
  calculateMonthlyChange,
  formatMonthLabel,
  getMonthStart,
  getPreviousMonthStart,
  getNextMonthStart,
} from "@/features/financial-records/domain/netWorth";

type FinancialRecordsView = "net-worth";

export function FinancialRecordsPage() {
  const [currentView, setCurrentView] = useState<FinancialRecordsView>("net-worth");
  const { profileData, loading: profileLoading } = useProfileData();
  const {
    loading,
    saving,
    initialValues,
    records,
    saveCurrentMonthRecord,
    updateRecords,
    chartData: allChartData,
  } = useNetWorthRecords(profileData);

  const currentMonth = useMemo(() => getMonthStart(), []);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);

  const availableMonths = useMemo(() => {
    const months = new Set(records.map((r) => r.entryMonth));
    months.add(currentMonth);
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [records, currentMonth]);

  const earliestMonth = useMemo(() => {
    if (!records.length) return currentMonth;
    return records.reduce((earliest, record) => 
      record.entryMonth < earliest ? record.entryMonth : earliest, 
      currentMonth
    );
  }, [records, currentMonth]);

  const selectedRecord = useMemo(
    () => records.find((r) => r.entryMonth === selectedMonth) || null,
    [selectedMonth, records]
  );

  const financialData = useMemo(() => {
    if (!profileData || !selectedRecord) return { assets: 0, liabilities: 0, expenses: 0 };

    const assets =
      selectedRecord.totalCash +
      selectedRecord.totalInvestments +
      selectedRecord.totalProperty +
      (selectedRecord.epfAmount || 0);
    const liabilities = selectedRecord.totalLiabilities;

    const realityResult = calculateIncomeReality(
      profileData.monthlyIncome || 0,
      profileData.housingCost || 0,
      (profileData.householdType as any) || "alone",
      profileData.dependants || 1,
      (profileData.location as any) || "kl",
      {
        food: profileData.expenseFood || 0,
        transport: profileData.expenseTransport || 0,
        utilities: profileData.expenseUtilities || 0,
        others: profileData.expenseOthers || 0,
        entertainment: profileData.expenseEntertainment || 0,
      }
    );

    return { assets, liabilities, expenses: realityResult.baselineLifeCost };
  }, [profileData, selectedRecord]);

  const previousMonthRecord = useMemo(() => {
    if (!selectedRecord) return null;
    return (
      records.find(
        (record) => record.entryMonth === getPreviousMonthStart(selectedRecord.entryMonth)
      ) || null
    );
  }, [records, selectedRecord]);

  const selectedMonthlyChange = useMemo(() => {
    if (!selectedRecord) {
      return { absolute: null, percentage: null };
    }
    return calculateMonthlyChange(
      selectedRecord.netWorth,
      previousMonthRecord?.netWorth ?? null
    );
  }, [selectedRecord, previousMonthRecord]);

  const handlePrevMonth = () => setSelectedMonth(getPreviousMonthStart(selectedMonth));
  const handleNextMonth = () => setSelectedMonth(getNextMonthStart(selectedMonth));
  const handleResetMonth = () => setSelectedMonth(currentMonth);

  const filteredChartData = useMemo(() => {
    const previousMonth = getPreviousMonthStart(selectedMonth);
    return records
      .filter(
        (record) =>
          record.entryMonth === selectedMonth || record.entryMonth === previousMonth
      )
      .sort((a, b) => a.entryMonth.localeCompare(b.entryMonth))
      .map((record) => ({
        month: formatMonthLabel(record.entryMonth),
        netWorth: record.netWorth,
      }));
  }, [selectedMonth, records]);

  const selectedMonthShort = new Intl.DateTimeFormat("en-MY", {
    month: "short",
    year: "numeric",
  }).format(new Date(`${selectedMonth}T00:00:00`));

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-1 pb-12">
      <SEO
        title="Financial Records | SimpliFi"
        description="Save your monthly net worth and track changes over time."
      />

      {/* ── Subheader bar (same pattern as Money Health tabs) ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex justify-start">
          <div className="flex items-center gap-2 rounded-full bg-secondary/20 p-1">
            <button
              onClick={() => setCurrentView("net-worth")}
              className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300 ${
                currentView === "net-worth"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
              }`}
            >
              <WalletCards className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">Net Worth</span>
            </button>
        </div>
      </div>

      <div className="flex flex-row items-center gap-2">
          {/* Removed Mobile month nav as it is now inside the card */}

          {currentView === "net-worth" && (
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-2 rounded-full border-border/60"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Update {selectedMonthShort}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader className="mb-6">
                  <SheetTitle>Update Net Worth</SheetTitle>
                  <SheetDescription>
                    Update your financial data for {selectedMonth}.
                  </SheetDescription>
                </SheetHeader>
                <NetWorthForm
                  initialValues={initialValues}
                  saving={saving}
                  onSubmit={saveCurrentMonthRecord}
                />
              </SheetContent>
            </Sheet>
          )}
          <NetWorthRecordsEditor records={records} saving={saving} onSave={updateRecords} />
        </div>
      </div>

      {/* ── Content ── */}
      {currentView === "net-worth" && (
        <div className="w-full">
          {loading || profileLoading ? (
            <section className="rounded-xl border border-border/60 bg-card p-6 text-sm text-muted-foreground shadow-sm">
              Loading your latest records...
            </section>
          ) : (
            <NetWorthSummary
              latestRecord={selectedRecord}
              previousRecord={previousMonthRecord}
              monthlyChange={selectedMonthlyChange}
              income={profileData.monthlyIncome || 0}
              expenses={financialData.expenses}
              chartData={filteredChartData}
              allChartData={allChartData}
              selectedMonth={selectedMonth}
              currentMonth={currentMonth}
              earliestMonth={earliestMonth}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onResetMonth={handleResetMonth}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default FinancialRecordsPage;
