import { useEffect, useMemo, useState } from "react";
import { CalendarPlus, PencilLine, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  calculateNetWorthWithEPF,
  formatMonthLabel,
  getMonthStart,
  getNextMonthStart,
  getPreviousMonthStart,
  NetWorthRecord,
  normaliseNetWorthValues,
} from "@/features/financial-records/net-worth/domain/netWorth";
import { Plus } from "lucide-react";

interface NetWorthRecordsEditorProps {
  records: NetWorthRecord[];
  saving?: boolean;
  onSave: (records: NetWorthRecord[], deletedRecordIds: string[]) => Promise<void>;
  isEmbedded?: boolean;
}

const formatCurrency = (value: number) =>
  `RM ${Math.round(value).toLocaleString("en-MY", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

export function NetWorthRecordsEditor({
  records,
  saving = false,
  onSave,
  isEmbedded = false,
}: NetWorthRecordsEditorProps) {
  const [open, setOpen] = useState(false);
  const [draftRecords, setDraftRecords] = useState<NetWorthRecord[]>([]);
  const [editorMessage, setEditorMessage] = useState<string | null>(null);
  const [deletedRecordIds, setDeletedRecordIds] = useState<string[]>([]);

  // Sync draft with incoming records whenever they change
  useEffect(() => {
    setDraftRecords(records);
    setDeletedRecordIds([]);
  }, [records]);

  const sortedDrafts = useMemo(
    () => [...draftRecords].sort((a, b) => a.entryMonth.localeCompare(b.entryMonth)),
    [draftRecords]
  );

  const totalRows = useMemo(
    () =>
      sortedDrafts.map((record) => {
        const values = normaliseNetWorthValues({
          totalCash: record.totalCash,
          totalInvestments: record.totalInvestments,
          totalProperty: record.totalProperty,
          totalLiabilities: record.totalLiabilities,
        });

        return {
          ...record,
          netWorth: calculateNetWorthWithEPF(values, record.epfAmount || 0),
          totalAmount: calculateNetWorthWithEPF(values, record.epfAmount || 0),
        };
      }),
    [sortedDrafts],
  );

  const existingMonths = useMemo(
    () => new Set(draftRecords.map((record) => record.entryMonth.slice(0, 7))),
    [draftRecords],
  );

  const handleChange = (id: string, key: keyof Pick<NetWorthRecord, "totalCash" | "totalInvestments" | "totalProperty" | "totalLiabilities">, rawValue: string) => {
    const nextValue = rawValue === "" ? 0 : Number(rawValue);
    const safeValue = Number.isFinite(nextValue) ? nextValue : 0;

    setDraftRecords((current) =>
      current.map((record) => (record.id === id ? { ...record, [key]: safeValue } : record)),
    );
  };

  const handleEPFChange = (id: string, rawValue: string) => {
    const nextValue = rawValue === "" ? 0 : Number(rawValue);
    const safeValue = Number.isFinite(nextValue) ? nextValue : 0;

    setDraftRecords((current) =>
      current.map((record) => (record.id === id ? { ...record, epfAmount: safeValue } : record)),
    );
  };


  const [scrollTargetMonth, setScrollTargetMonth] = useState<string | null>(null);

  // High-Reliability Target-Based Scroll
  useEffect(() => {
    if (!scrollTargetMonth) return;

    // Use a small timeout to ensure the DOM element with the new ID is physically present
    const timer = setTimeout(() => {
      const targetElement = document.getElementById(`col-${scrollTargetMonth}`);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest"
        });
      }
      setScrollTargetMonth(null);
    }, 100);

    return () => clearTimeout(timer);
  }, [scrollTargetMonth, draftRecords.length]);

  const handleAddPreviousMonth = () => {
    const firstRecord = totalRows[0];
    const entryMonth = firstRecord 
      ? getPreviousMonthStart(firstRecord.entryMonth) 
      : getMonthStart();

    if (existingMonths.has(entryMonth)) {
      setEditorMessage(`Month ${formatMonthLabel(entryMonth)} already exists.`);
      return;
    }

    setEditorMessage(null);
    setScrollTargetMonth(entryMonth);
    setDraftRecords((current) =>
      [...current, {
        id: `temp-${entryMonth}`,
        entryMonth,
        totalCash: 0,
        totalInvestments: 0,
        totalProperty: 0,
        totalLiabilities: 0,
        netWorth: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }]
    );
  };

  const handleAddNextMonth = () => {
    const lastRecord = totalRows[totalRows.length - 1];
    const entryMonth = lastRecord 
      ? getNextMonthStart(lastRecord.entryMonth) 
      : getMonthStart();

    if (existingMonths.has(entryMonth)) {
      setEditorMessage(`Month ${formatMonthLabel(entryMonth)} already exists.`);
      return;
    }

    setEditorMessage(null);
    setScrollTargetMonth(entryMonth);
    setDraftRecords((current) =>
      [...current, {
        id: `temp-${entryMonth}`,
        entryMonth,
        totalCash: 0,
        totalInvestments: 0,
        totalProperty: 0,
        totalLiabilities: 0,
        netWorth: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }]
    );
  };

  const handleDeleteMonth = (id: string) => {
    setDraftRecords((current) => current.filter((record) => record.id !== id));
    setDeletedRecordIds((current) => (current.includes(id) ? current : [...current, id]));
    setEditorMessage(null);
  };

  const handleSave = async () => {
    await onSave(totalRows, deletedRecordIds);
    setEditorMessage(null);
    setOpen(false);
  };


  const content = (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {!totalRows.length ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-sm text-muted-foreground text-center space-y-4">
          <p>Your record history is empty.</p>
          <Button onClick={handleAddNextMonth} variant="outline" className="rounded-full">
            <CalendarPlus className="w-4 h-4 mr-2 text-emerald-500" />
            Add First Month
          </Button>
        </div>
      ) : (
        <>
          {editorMessage ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
              {editorMessage}
            </div>
          ) : null}

          <div className="relative group">
            {/* Previous Month Floating Button (On Border - Glassmorphism) */}
            <div className="absolute left-[160px] top-1/2 -translate-y-1/2 -translate-x-1/2 z-40 pointer-events-none">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full border-emerald-500/40 bg-emerald-500/10 backdrop-blur-md text-emerald-600 hover:bg-emerald-500/20 shadow-lg pointer-events-auto transition-all active:scale-95 flex items-center justify-center ring-4 ring-background/50"
                onClick={handleAddPreviousMonth}
                title="Add previous month"
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>

            {/* Next Month Floating Button (On Border - Glassmorphism) */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-40 pointer-events-none">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full border-emerald-500/40 bg-emerald-500/10 backdrop-blur-md text-emerald-600 hover:bg-emerald-500/20 shadow-lg pointer-events-auto transition-all active:scale-95 flex items-center justify-center ring-4 ring-background/50"
                onClick={handleAddNextMonth}
                title="Add next month"
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>

            <div className="rounded-xl border border-border overflow-hidden bg-card">
              <div className="overflow-x-auto overflow-y-hidden max-w-full">
                <Table className="border-collapse table-fixed min-w-max">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent bg-secondary/30 h-14">
                      <TableHead className="w-[160px] sticky left-0 bg-background/95 backdrop-blur-sm z-20 border-r border-border/60">
                        Month
                      </TableHead>
                    {totalRows.map((record) => (
                      <TableHead 
                        key={record.id} 
                        id={`col-${record.entryMonth}`}
                        className="w-[180px] text-center border-r border-border/40 font-bold uppercase tracking-wider text-[10px]"
                      >
                        <div className="flex items-center justify-between px-2">
                          <span className="flex-1">{formatMonthLabel(record.entryMonth)}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-rose-500 hover:bg-rose-50 rounded-full shrink-0"
                            onClick={() => handleDeleteMonth(record.id)}
                            aria-label={`Delete ${formatMonthLabel(record.entryMonth)}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Cash Row */}
                  <TableRow className="hover:bg-transparent h-14">
                    <TableCell className="sticky left-0 bg-background/95 backdrop-blur-sm z-10 border-r border-border/60 font-medium text-xs">
                      Cash
                    </TableCell>
                    {totalRows.map((record) => (
                      <TableCell key={`${record.id}-cash`} className="p-2 border-r border-border/40">
                        <Input
                          type="number"
                          value={record.totalCash || ""}
                          onChange={(e) => handleChange(record.id, "totalCash", e.target.value)}
                          className="h-9 border-transparent hover:border-border focus:border-emerald-500/50 bg-transparent text-center tabular-nums transition-all"
                        />
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Investments Row */}
                  <TableRow className="hover:bg-transparent bg-secondary/5 h-14">
                    <TableCell className="sticky left-0 bg-background/95 backdrop-blur-sm z-10 border-r border-border/60 font-medium text-xs">
                      Investments
                    </TableCell>
                    {totalRows.map((record) => (
                      <TableCell key={`${record.id}-invest`} className="p-2 border-r border-border/40">
                        <Input
                          type="number"
                          value={record.totalInvestments || ""}
                          onChange={(e) => handleChange(record.id, "totalInvestments", e.target.value)}
                          className="h-9 border-transparent hover:border-border focus:border-emerald-500/50 bg-transparent text-center tabular-nums transition-all"
                        />
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* EPF Row */}
                  <TableRow className="hover:bg-transparent h-14">
                    <TableCell className="sticky left-0 bg-background/95 backdrop-blur-sm z-10 border-r border-border/60 font-medium text-xs">
                      EPF
                    </TableCell>
                    {totalRows.map((record) => (
                      <TableCell key={`${record.id}-epf`} className="p-2 border-r border-border/40">
                        <Input
                          type="number"
                          value={record.epfAmount || ""}
                          onChange={(e) => handleEPFChange(record.id, e.target.value)}
                          className="h-9 border-transparent hover:border-border focus:border-emerald-500/50 bg-transparent text-center tabular-nums transition-all"
                        />
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Property Row */}
                  <TableRow className="hover:bg-transparent bg-secondary/5 h-14">
                    <TableCell className="sticky left-0 bg-background/95 backdrop-blur-sm z-10 border-r border-border/60 font-medium text-xs">
                      Property
                    </TableCell>
                    {totalRows.map((record) => (
                      <TableCell key={`${record.id}-prop`} className="p-2 border-r border-border/40">
                        <Input
                          type="number"
                          value={record.totalProperty || ""}
                          onChange={(e) => handleChange(record.id, "totalProperty", e.target.value)}
                          className="h-9 border-transparent hover:border-border focus:border-emerald-500/50 bg-transparent text-center tabular-nums transition-all"
                        />
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Liabilities Row */}
                  <TableRow className="hover:bg-transparent ring-1 ring-rose-500/10 bg-rose-50/10 h-14">
                    <TableCell className="sticky left-0 bg-background/95 backdrop-blur-sm z-10 border-r border-border/60 font-medium text-xs text-rose-600">
                      Liabilities
                    </TableCell>
                    {totalRows.map((record) => (
                      <TableCell key={`${record.id}-liab`} className="p-2 border-r border-border/40">
                        <Input
                          type="number"
                          value={record.totalLiabilities || ""}
                          onChange={(e) => handleChange(record.id, "totalLiabilities", e.target.value)}
                          className="h-9 border-transparent hover:border-border focus:border-emerald-500/50 bg-transparent text-center tabular-nums text-rose-600 transition-all font-medium"
                        />
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Net Worth (Summary) Row */}
                  <TableRow className="hover:bg-transparent bg-emerald-500/5 ring-t-2 ring-emerald-500/10 h-14">
                    <TableCell className="sticky left-0 bg-emerald-500/10 backdrop-blur-sm z-10 border-r border-emerald-500/20 font-bold text-xs text-emerald-700">
                      Total Net Worth
                    </TableCell>
                    {totalRows.map((record) => (
                      <TableCell key={`${record.id}-summary`} className="p-2 border-r border-emerald-500/10 text-center font-bold tabular-nums text-emerald-600">
                        {formatCurrency(record.totalAmount)}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </>
    )}

      <div className="p-6 border-t bg-secondary/5 flex justify-end gap-2">
        <Button variant="outline" onClick={() => (isEmbedded ? onSave([], []) : setOpen(false))} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving || !totalRows.length}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );

  if (isEmbedded) return content;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-full">
          <PencilLine className="h-4 w-4" />
          Edit Records
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-6xl max-h-[95vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>Edit Records</DialogTitle>
          <DialogDescription>
            Update any month directly here. It works like a lightweight spreadsheet, but keeps the totals calculated for you.
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}

export default NetWorthRecordsEditor;
