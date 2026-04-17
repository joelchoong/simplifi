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
  calculateNetWorth,
  formatMonthLabel,
  getMonthStart,
  NetWorthRecord,
  normaliseEntryMonth,
  normaliseNetWorthValues,
} from "@/features/financial-records/domain/netWorth";

interface NetWorthRecordsEditorProps {
  records: NetWorthRecord[];
  saving?: boolean;
  onSave: (records: NetWorthRecord[], deletedRecordIds: string[]) => Promise<void>;
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
}: NetWorthRecordsEditorProps) {
  const [open, setOpen] = useState(false);
  const [draftRecords, setDraftRecords] = useState<NetWorthRecord[]>([]);
  const [newMonth, setNewMonth] = useState(() => getMonthStart().slice(0, 7));
  const [editorMessage, setEditorMessage] = useState<string | null>(null);
  const [deletedRecordIds, setDeletedRecordIds] = useState<string[]>([]);

  // Sync draft with incoming records whenever they change, 
  // but only if the modal is not open yet to avoid mid-edit flickering.
  // Actually, standard behavior for this kind of editor is to refresh when 'records' changes.
  useEffect(() => {
    setDraftRecords(records);
    setDeletedRecordIds([]);
  }, [records]);

  const totalRows = useMemo(
    () =>
      draftRecords.map((record) => ({
        ...record,
        netWorth: calculateNetWorth(
          normaliseNetWorthValues({
            totalCash: record.totalCash,
            totalInvestments: record.totalInvestments,
            totalProperty: record.totalProperty,
            totalLiabilities: record.totalLiabilities,
          }),
        ),
        totalAmount: record.totalCash + record.totalInvestments + record.totalProperty + (record.epfAmount ?? 0),
      })),
    [draftRecords],
  );

  const existingMonths = useMemo(
    () => new Set(draftRecords.map((record) => normaliseEntryMonth(record.entryMonth))),
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

  const handleAddMonth = () => {
    const entryMonth = normaliseEntryMonth(newMonth);

    if (existingMonths.has(entryMonth)) {
      setEditorMessage("That month already exists in your records.");
      return;
    }

    setEditorMessage(null);
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
      }].sort((a, b) => a.entryMonth.localeCompare(b.entryMonth)),
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

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!totalRows.length ? (
            <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground text-center">
              Add a month below to start your record history.
            </div>
          ) : null}

          <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-secondary/10 p-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1.5">
              <label htmlFor="new-record-month" className="text-sm font-medium text-foreground">
                Add month
              </label>
              <Input
                id="new-record-month"
                type="month"
                value={newMonth}
                onChange={(event) => {
                  setNewMonth(event.target.value);
                  setEditorMessage(null);
                }}
                className="w-full sm:w-[180px]"
              />
            </div>
            <Button type="button" variant="outline" onClick={handleAddMonth} className="rounded-full">
              <CalendarPlus className="h-4 w-4" />
              Add Month
            </Button>
          </div>

          {editorMessage ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
              {editorMessage}
            </div>
          ) : null}

          <div className="rounded-xl border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Month</TableHead>
                  <TableHead>Cash</TableHead>
                  <TableHead>Investments</TableHead>
                  <TableHead>EPF</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Liabilities</TableHead>
                  <TableHead className="whitespace-nowrap text-right">Total Amount</TableHead>
                  <TableHead className="w-[72px] whitespace-nowrap text-right">Delete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {totalRows.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="whitespace-nowrap font-medium">{formatMonthLabel(record.entryMonth)}</TableCell>
                    <TableCell><Input type="number" min="0" step="0.01" value={record.totalCash || ""} onChange={(event) => handleChange(record.id, "totalCash", event.target.value)} className="min-w-[120px]" /></TableCell>
                    <TableCell><Input type="number" min="0" step="0.01" value={record.totalInvestments || ""} onChange={(event) => handleChange(record.id, "totalInvestments", event.target.value)} className="min-w-[120px]" /></TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={record.epfAmount || ""}
                        onChange={(event) => handleEPFChange(record.id, event.target.value)}
                        className="min-w-[120px]"
                      />
                    </TableCell>
                    <TableCell><Input type="number" min="0" step="0.01" value={record.totalProperty || ""} onChange={(event) => handleChange(record.id, "totalProperty", event.target.value)} className="min-w-[120px]" /></TableCell>
                    <TableCell><Input type="number" min="0" step="0.01" value={record.totalLiabilities || ""} onChange={(event) => handleChange(record.id, "totalLiabilities", event.target.value)} className="min-w-[120px]" /></TableCell>
                    <TableCell className="whitespace-nowrap text-right font-semibold tabular-nums">
                      <div>{formatCurrency(record.totalAmount)}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        onClick={() => handleDeleteMonth(record.id)}
                        aria-label={`Delete ${formatMonthLabel(record.entryMonth)}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="p-6 border-t bg-secondary/5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !totalRows.length}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default NetWorthRecordsEditor;
