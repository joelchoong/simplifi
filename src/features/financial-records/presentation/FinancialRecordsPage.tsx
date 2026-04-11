import { useMemo, useState } from "react";
import { WalletCards } from "lucide-react";
import SEO from "@/shared/components/SEO";
import NetWorthForm from "@/features/financial-records/presentation/NetWorthForm";
import NetWorthSummary from "@/features/financial-records/presentation/NetWorthSummary";
import NetWorthChart from "@/features/financial-records/presentation/NetWorthChart";
import NetWorthRecordsEditor from "@/features/financial-records/presentation/NetWorthRecordsEditor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useNetWorthRecords } from "@/features/financial-records/hooks/useNetWorthRecords";
import { useProfileData } from "@/features/profile/hooks/useProfileData";
import { calculateMonthlyChange, getMonthStart, getPreviousMonthStart } from "@/features/financial-records/domain/netWorth";

type FinancialRecordsView = "net-worth";

export function FinancialRecordsPage() {
  const [currentView, setCurrentView] = useState<FinancialRecordsView>("net-worth");
  const { profileData } = useProfileData();
  const {
    loading,
    saving,
    initialValues,
    records,
    saveCurrentMonthRecord,
    updateRecords,
  } = useNetWorthRecords(profileData);

  const currentMonth = useMemo(() => getMonthStart(), []);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);

  const availableMonths = useMemo(() => {
    const months = new Set(records.map((r) => r.entryMonth));
    months.add(currentMonth);
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [records, currentMonth]);

  const filteredRecords = useMemo(() => {
    const previousMonth = getPreviousMonthStart(selectedMonth);
    return records
      .filter((record) => record.entryMonth === selectedMonth || record.entryMonth === previousMonth)
      .sort((a, b) => a.entryMonth.localeCompare(b.entryMonth));
  }, [selectedMonth, records]);

  const selectedRecord = useMemo(
    () => records.find((r) => r.entryMonth === selectedMonth) || null,
    [selectedMonth, records],
  );

  const selectedMonthlyChange = useMemo(() => {
    if (!selectedRecord) {
      return { absolute: null, percentage: null };
    }

    const previousMonthRecord = records.find(
      (record) => record.entryMonth === getPreviousMonthStart(selectedRecord.entryMonth),
    );

    return calculateMonthlyChange(selectedRecord.netWorth, previousMonthRecord?.netWorth ?? null);
  }, [records, selectedRecord]);

  const filteredChartData = useMemo(
    () => filteredRecords.map((record) => ({ month: new Intl.DateTimeFormat("en-MY", { month: "short", year: "numeric" }).format(new Date(`${record.entryMonth}T00:00:00`)), netWorth: record.netWorth })),
    [filteredRecords],
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-1 pb-6">
      <SEO
        title="Financial Records | SimpliFi"
        description="Save your monthly net worth and track changes over time."
      />

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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="w-40">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="h-9 rounded-full border-border/60 bg-card px-4">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                {availableMonths.map((month) => (
                  <SelectItem key={month} value={month}>
                    {new Intl.DateTimeFormat("en-MY", {
                      month: "long",
                      year: "numeric",
                    }).format(new Date(`${month}T00:00:00`))}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <NetWorthRecordsEditor records={records} saving={saving} onSave={updateRecords} />
        </div>
      </div>

      {currentView === "net-worth" && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <div className="xl:col-span-4">
            <NetWorthForm
              initialValues={initialValues}
              saving={saving}
              onSubmit={saveCurrentMonthRecord}
            />
          </div>

          <div className="space-y-2 xl:col-span-8">
            {loading ? (
              <section className="rounded-[10px] border border-border/60 bg-card p-3 text-sm text-muted-foreground shadow-sm">
                Loading your latest records...
              </section>
            ) : (
              <>
                <NetWorthSummary latestRecord={selectedRecord} monthlyChange={selectedMonthlyChange} />
                <NetWorthChart data={filteredChartData} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FinancialRecordsPage;
