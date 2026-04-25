import { useMemo, useState, useEffect } from "react";
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
      <div className="flex flex-row items-center justify-between gap-4">
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
          {currentView === "net-worth" && (
            <ManageRecordsPanel
              records={records}
              saving={saving}
              selectedMonth={selectedMonth}
              onSaveCurrent={saveCurrentMonthRecord}
              onSaveAll={updateRecords}
            />
          )}
        </div>
      </div>

      {/* ── Content ── */}
      {currentView === "net-worth" && (
        <div className="w-full">
          {loading || profileLoading ? (
            <div className="bg-card rounded-2xl border border-border/60 overflow-hidden shadow-sm animate-pulse">
              <div className="p-6 space-y-8">
                {/* Header Skeleton */}
                <div className="flex justify-between items-center">
                  <div className="h-6 w-48 bg-secondary/20 rounded-md" />
                  <div className="h-10 w-32 bg-secondary/20 rounded-full" />
                </div>
                
                {/* Primary Figure Skeleton */}
                <div className="space-y-3">
                  <div className="h-12 w-64 bg-secondary/20 rounded-xl" />
                  <div className="h-6 w-32 bg-secondary/20 rounded-full" />
                </div>

                {/* Chart Area Skeleton */}
                <div className="h-[180px] w-full bg-secondary/10 rounded-2xl border border-border/40" />

                {/* Metric Grid Skeleton */}
                <div className="space-y-4">
                  <div className="h-4 w-24 bg-secondary/20 rounded-md" />
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-24 bg-secondary/10 rounded-xl" />
                    <div className="h-24 bg-secondary/10 rounded-xl" />
                    <div className="h-24 bg-secondary/10 rounded-xl" />
                  </div>
                </div>
              </div>
            </div>
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


interface ManageRecordsPanelProps {
  records: any[];
  saving: boolean;
  selectedMonth: string;
  onSaveCurrent: (values: any) => Promise<void>;
  onSaveAll: (records: any[], deletedIds: string[]) => Promise<void>;
}

function ManageRecordsPanel({ records, saving, selectedMonth: defaultSelected, onSaveCurrent, onSaveAll }: ManageRecordsPanelProps) {
  const [panelMonth, setPanelMonth] = useState(defaultSelected);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Sync with prop when main page month changes, but allow independent selection in panel
  useEffect(() => {
    setPanelMonth(defaultSelected);
  }, [defaultSelected]);

  const monthOptions = useMemo(() => {
    const current = getMonthStart();
    const months = new Set(records.map((r) => r.entryMonth));
    months.add(current);
    months.add(panelMonth); // Keep current edit month in options
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [records, panelMonth]);

  const selectedRecord = useMemo(() => {
    const found = records.find(r => r.entryMonth === panelMonth);
    if (!found) return { totalCash: 0, totalInvestments: 0, totalProperty: 0, totalLiabilities: 0 };
    return {
      totalCash: found.totalCash,
      totalInvestments: found.totalInvestments,
      totalProperty: found.totalProperty,
      totalLiabilities: found.totalLiabilities,
    };
  }, [records, panelMonth]);

  const panelMonthLabel = useMemo(() => formatMonthLabel(panelMonth), [panelMonth]);

  return (
    <div className="flex items-center gap-2">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2 rounded-full border-border/60 bg-background hover:bg-secondary/20 font-medium"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Update records</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col h-full overflow-hidden">
          <div className="p-6 pb-4 border-b">
            <SheetHeader>
              <SheetTitle>Update Net Worth</SheetTitle>
              <SheetDescription>
                {panelMonth === getMonthStart() 
                  ? "Add or update your current financial records." 
                  : `Updating records for ${panelMonthLabel}.`}
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-none">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                Select month to edit
              </label>
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-11 w-11 shrink-0 rounded-xl border-border/60 bg-secondary/5 hover:bg-secondary/10"
                  onClick={() => {
                    const idx = monthOptions.indexOf(panelMonth);
                    if (idx !== -1 && idx < monthOptions.length - 1) {
                      setPanelMonth(monthOptions[idx + 1]);
                    } else {
                      setPanelMonth(getPreviousMonthStart(panelMonth));
                    }
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <Select value={panelMonth} onValueChange={setPanelMonth}>
                  <SelectTrigger className="flex-1 h-11 rounded-xl border-border/60 bg-secondary/5 focus:ring-emerald-500/20 font-medium">
                    <SelectValue placeholder="Choose month" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map((m) => (
                      <SelectItem key={m} value={m}>
                        {formatMonthLabel(m)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-11 w-11 shrink-0 rounded-xl border-border/60 bg-secondary/5 hover:bg-secondary/10"
                  onClick={() => {
                    const idx = monthOptions.indexOf(panelMonth);
                    if (idx > 0) {
                      setPanelMonth(monthOptions[idx - 1]);
                    } else {
                      setPanelMonth(getNextMonthStart(panelMonth));
                    }
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <NetWorthForm
              key={panelMonth}
              formId="manage-nw-form"
              initialValues={selectedRecord}
              saving={saving}
              hideSubmitButton={true}
              onSubmit={async (values) => {
                const updatedRecord = {
                  id: records.find(r => r.entryMonth === panelMonth)?.id || `temp-${panelMonth}`,
                  entryMonth: panelMonth,
                  ...values,
                  netWorth: values.totalCash + values.totalInvestments + values.totalProperty - values.totalLiabilities
                };
                await onSaveAll([updatedRecord], []);
              }}
            />
          </div>

          <div className="p-6 border-t bg-secondary/5 space-y-3">
            <Button 
              form="manage-nw-form" 
              type="submit"
              className="w-full rounded-full bg-emerald-600 text-white hover:bg-emerald-700 h-11 font-semibold shadow-sm transition-all active:scale-[0.98]"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button 
              type="button"
              variant="outline" 
              className="w-full rounded-full gap-2 h-11 border-border/60" 
              onClick={() => setHistoryOpen(true)}
            >
              <WalletCards className="w-4 h-4 text-emerald-500" />
              View History Table
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
        <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Financial History</SheetTitle>
            <SheetDescription>
              View and edit your entire net worth history in a spreadsheet-like view.
            </SheetDescription>
          </SheetHeader>
          <NetWorthRecordsEditor 
            records={records} 
            saving={saving} 
            onSave={async (r, d) => {
              await onSaveAll(r, d);
              setHistoryOpen(false);
            }} 
            isEmbedded={true}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default FinancialRecordsPage;
