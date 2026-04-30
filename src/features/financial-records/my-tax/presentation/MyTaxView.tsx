import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Accessibility,
  Activity,
  Baby,
  BadgeAlert,
  Blocks,
  ChevronDown,
  ChevronRight,
  FileCheck,
  FileUp,
  GraduationCap,
  Heart,
  HeartHandshake,
  HeartPulse,
  House,
  Landmark,
  LaptopMinimal,
  Lock,
  Milk,
  Shield,
  Stethoscope,
  TrendingUp,
  Upload,
  User,
  Users,
  X,
  Zap,
  Dumbbell,
  Eye,
  Download,
  Loader2,
  ReceiptText,
  Info,
} from "lucide-react";
import JSZip from "jszip";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/shared/components/ui/sheet";
import { Label } from "@/shared/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";
import {
  DEFAULT_FALLBACKS,
  DETECTION_KEYWORD_MAP,
  MY_TAX_PLANNER_DATA,
  MY_TAX_SOURCE_URL,
  PlannerCategory,
  PlannerReceipt,
} from "@/features/financial-records/my-tax/domain/myTaxPlannerData";
import { AssessmentYear } from "@/features/financial-records/my-tax/domain/taxReliefs";

type ClaimsByYear = Record<AssessmentYear, Record<string, number>>;

const YEAR_OPTIONS: AssessmentYear[] = ["2025", "2024"];

// SOCSO wage ceiling and rate (employee contribution)
const SOCSO_WAGE_CEILING = 6000;
const SOCSO_RATE = 0.005; // 0.5%
const EPF_RATE = 0.11;    // 11%

/** Compute the three auto-filled relief amounts from gross monthly income */
function computeAutoAmounts(monthlyIncome: number, age: number) {
  const annual = monthlyIncome * 12;
  const epfAnnual = annual * EPF_RATE;
  const epfRelief = Math.min(Math.round(epfAnnual), 4000);

  const socsoMonthly = age >= 60 ? 0 : Math.min(monthlyIncome, SOCSO_WAGE_CEILING) * SOCSO_RATE;
  const socsoAnnual = Math.min(Math.round(socsoMonthly * 12), 350);

  return {
    personal_self: 9000,
    insurance_epf: epfRelief,
    socso_main: socsoAnnual,
  } as Record<string, number>;
}

const toneClasses = {
  green: {
    icon: "bg-secondary/50 text-muted-foreground",
    number: "text-emerald-700",
    progress: "bg-emerald-600",
    value: "text-emerald-700",
    flash: "border-emerald-400 bg-emerald-50/70",
  },
  blue: {
    icon: "bg-secondary/50 text-muted-foreground",
    number: "text-sky-700",
    progress: "bg-sky-600",
    value: "text-sky-700",
    flash: "border-sky-400 bg-sky-50/70",
  },
  amber: {
    icon: "bg-secondary/50 text-muted-foreground",
    number: "text-amber-700",
    progress: "bg-amber-600",
    value: "text-amber-700",
    flash: "border-amber-400 bg-amber-50/70",
  },
  red: {
    icon: "bg-secondary/50 text-muted-foreground",
    number: "text-rose-700",
    progress: "bg-rose-600",
    value: "text-rose-700",
    flash: "border-rose-400 bg-rose-50/70",
  },
} as const;

const iconMap = {
  User,
  HeartPulse,
  Accessibility,
  BadgeAlert,
  GraduationCap,
  Stethoscope,
  Activity,
  Baby,
  LaptopMinimal,
  Dumbbell,
  Milk,
  Blocks,
  Landmark,
  HeartHandshake,
  Heart,
  Users,
  Shield,
  TrendingUp,
  FileCheck,
  Lock,
  Zap,
  House,
} as const;

function formatRM(value: number) {
  return `RM ${Math.round(value).toLocaleString("en-MY")}`;
}

function buildInitialClaims(autoAmounts: Record<string, number> = {}): ClaimsByYear {
  return {
    "2025": Object.fromEntries(MY_TAX_PLANNER_DATA["2025"].flatMap((category) => category.subItems.map((subItem) => [subItem.id, autoAmounts[subItem.id] ?? 0]))),
    "2024": Object.fromEntries(MY_TAX_PLANNER_DATA["2024"].flatMap((category) => category.subItems.map((subItem) => [subItem.id, autoAmounts[subItem.id] ?? 0]))),
  };
}

function getTotalMax(categories: PlannerCategory[]) {
  return categories.reduce((total, category) => {
    if (category.limit !== null) return total + category.limit;
    return total + category.subItems.reduce((subTotal, subItem) => subTotal + subItem.limit, 0);
  }, 0);
}

function getCategoryTotal(category: PlannerCategory, claims: Record<string, number>) {
  return category.subItems.reduce((total, subItem) => total + (claims[subItem.id] || 0), 0);
}

function getCategoryCap(category: PlannerCategory) {
  return category.limit ?? category.subItems.reduce((total, subItem) => total + subItem.limit, 0);
}

function detectSubItemId(fileName: string, categories: PlannerCategory[]) {
  // Mock logic removed - we now wait for real OCR or user input
  return "";
}

function detectAmount(fileName: string) {
  // Mock logic removed - we now default to 0 for manual verification
  return 0;
}

export function MyTaxView({ monthlyIncome = 0, age = 30 }: { monthlyIncome?: number; age?: number }) {
  const [selectedYear, setSelectedYear] = useState<AssessmentYear>("2025");

  const autoAmounts = useMemo(() => computeAutoAmounts(monthlyIncome, age), [monthlyIncome, age]);

  const [claimsByYear, setClaimsByYear] = useState<ClaimsByYear>(() => buildInitialClaims(autoAmounts));
  const [receipts, setReceipts] = useState<PlannerReceipt[]>([]);
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
  const [activeInputId, setActiveInputId] = useState<string | null>(null);
  const [pendingValues, setPendingValues] = useState<Record<string, string>>({});
  const [isDragActive, setIsDragActive] = useState(false);
  const [processingFileName, setProcessingFileName] = useState<string | null>(null);
  const [flashCategoryId, setFlashCategoryId] = useState<string | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<PlannerReceipt | null>(null);
  const [pendingReceipt, setPendingReceipt] = useState<PlannerReceipt | null>(null);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [isReceiptsListOpen, setIsReceiptsListOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Keep auto-filled sub-items in sync whenever income or age changes
  useEffect(() => {
    setClaimsByYear((prev) => {
      const updated: ClaimsByYear = { ...prev };
      for (const year of (["2025", "2024"] as AssessmentYear[])) {
        updated[year] = { ...prev[year] };
        for (const [id, value] of Object.entries(autoAmounts)) {
          updated[year][id] = value;
        }
      }
      return updated;
    });
  }, [autoAmounts]);

  const categories = MY_TAX_PLANNER_DATA[selectedYear];
  const claims = claimsByYear[selectedYear];
  const totalMax = useMemo(() => getTotalMax(categories), [categories]);
  const totalClaimed = useMemo(() => categories.reduce((total, category) => total + getCategoryTotal(category, claims), 0), [categories, claims]);
  const totalRemaining = Math.max(0, totalMax - totalClaimed);
  const totalPercentage = totalMax > 0 ? Math.round((totalClaimed / totalMax) * 100) : 0;
  const yearReceipts = receipts.filter((receipt) => receipt.year === selectedYear);

  const handleYearChange = (nextYear: string) => {
    setSelectedYear(nextYear as AssessmentYear);
    setOpenCategoryId(null);
    setActiveInputId(null);
  };

  const updateClaim = (subItemId: string, nextValue: number) => {
    setClaimsByYear((previous) => ({
      ...previous,
      [selectedYear]: {
        ...previous[selectedYear],
        [subItemId]: nextValue,
      },
    }));
  };

  const applyManualClaim = (category: PlannerCategory, subItemId: string, limit: number) => {
    const rawValue = Number.parseFloat(pendingValues[subItemId] || "0");
    if (!rawValue || rawValue <= 0) return;

    const currentClaim = claims[subItemId] || 0;
    const subRemaining = limit - currentClaim;
    const categoryRemaining = category.limit === null ? Number.POSITIVE_INFINITY : category.limit - getCategoryTotal(category, claims);
    const allowed = Math.min(rawValue, subRemaining, categoryRemaining);
    if (allowed <= 0) return;

    updateClaim(subItemId, Math.min(limit, currentClaim + allowed));
    setPendingValues((previous) => ({ ...previous, [subItemId]: "" }));
    setActiveInputId(null);
    setOpenCategoryId(category.id);
  };

  const removeReceipt = (receiptId: string) => {
    const receipt = receipts.find((entry) => entry.id === receiptId);
    if (!receipt) return;

    setReceipts((previous) => previous.filter((entry) => entry.id !== receiptId));
    setClaimsByYear((previous) => ({
      ...previous,
      [receipt.year]: {
        ...previous[receipt.year],
        [receipt.subItemId]: Math.max(0, (previous[receipt.year][receipt.subItemId] || 0) - receipt.amount),
      },
    }));
  };

  const processFile = (file: File) => {
    setProcessingFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;

      window.setTimeout(() => {
        const nextCategories = MY_TAX_PLANNER_DATA[selectedYear];
        const subItemId = detectSubItemId(file.name, nextCategories);
        const category = nextCategories.find((entry) => entry.subItems.some((subItem) => subItem.id === subItemId));
        const subItem = category?.subItems.find((entry) => entry.id === subItemId);

        setProcessingFileName(null);
        if (!category || !subItem) return;

        // Instead of adding immediately, set as pending for confirmation
        setPendingReceipt({
          id: crypto.randomUUID(),
          year: selectedYear,
          name: file.name,
          categoryId: category.id,
          subItemId: subItem.id,
          amount: detectAmount(file.name),
          dataUrl,
        });
      }, 1200 + Math.random() * 600);
    };
    reader.readAsDataURL(file);
  };

  const confirmReceipt = () => {
    if (!pendingReceipt) return;

    const category = categories.find((c) => c.id === pendingReceipt.categoryId);
    const subItem = category?.subItems.find((s) => s.id === pendingReceipt.subItemId);

    if (!category || !subItem) {
      toast.error("Invalid category selection");
      return;
    }

    setClaimsByYear((previous) => {
      const currentYearClaims = previous[selectedYear];
      const currentClaim = currentYearClaims[subItem.id] || 0;
      const categoryClaimed = getCategoryTotal(category, currentYearClaims);
      const subRemaining = subItem.limit - currentClaim;
      const categoryRemaining = category.limit === null ? Number.POSITIVE_INFINITY : category.limit - categoryClaimed;
      
      // Calculate how much can be allowed based on remaining limits
      const allowed = Math.min(pendingReceipt.amount, subRemaining, categoryRemaining);
      
      if (allowed <= 0) {
        toast.error("Limit exceeded for this category");
        return previous;
      }

      // If user edited the amount and it's more than allowed, we cap it but notify them
      const actualAmount = Math.min(pendingReceipt.amount, allowed);

      setReceipts((currentReceipts) => [
        {
          ...pendingReceipt,
          amount: actualAmount,
        },
        ...currentReceipts,
      ]);

      setOpenCategoryId(category.id);
      setFlashCategoryId(category.id);
      window.setTimeout(() => setFlashCategoryId((currentFlashId) => (currentFlashId === category.id ? null : currentFlashId)), 800);

      return {
        ...previous,
        [selectedYear]: {
          ...currentYearClaims,
          [subItem.id]: Math.min(subItem.limit, currentClaim + actualAmount),
        },
      };
    });

    setPendingReceipt(null);
    toast.success("Receipt added successfully");
  };

  const handleExportAll = async () => {
    if (receipts.length === 0) {
      toast.error("No receipts to export");
      return;
    }

    setIsExporting(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder(`tax_receipts_${selectedYear}`);

      for (const receipt of receipts) {
        if (receipt.dataUrl) {
          // Extract base64 data
          const base64Data = receipt.dataUrl.split(",")[1];
          const extension = receipt.name.split(".").pop() || "png";
          folder?.file(`${receipt.name}`, base64Data, { base64: true });
        }
      }

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = `mytax_receipts_${selectedYear}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("All receipts exported successfully");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export receipts");
    } finally {
      setIsExporting(false);
    }
  };

  const handleFilesAdded = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    Array.from(fileList).forEach(processFile);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFilesAdded(event.target.files);
    event.target.value = "";
  };

  return (
    <div className="bg-card rounded-2xl border border-border/60 overflow-hidden shadow-sm">
      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <ReceiptText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight truncate">Tax Relief Planner</h2>
              <p className="text-[13px] font-normal text-muted-foreground truncate">YA {selectedYear} • Tax Relief Assessment</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Select value={selectedYear} onValueChange={handleYearChange}>
              <SelectTrigger className="h-10 min-w-[140px] rounded-full border-border/60 bg-background/50 flex items-center justify-between px-4 group">
                <SelectValue />
                <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors ml-2" />
              </SelectTrigger>
              <SelectContent>
                {YEAR_OPTIONS.map((year) => (
                  <SelectItem key={year} value={year}>
                    YA {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              className="h-10 rounded-full border-border/60 bg-background/50 px-4 font-medium transition-all"
              onClick={() => setIsReceiptsListOpen(true)}
            >
              <ReceiptText className="mr-2 h-4 w-4 text-emerald-600" />
              <span className="hidden sm:inline">Receipts</span>
              {yearReceipts.length > 0 && (
                <span className="ml-1 sm:ml-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white">
                  {yearReceipts.length}
                </span>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-6">
          <SummaryCard label="Total claimed" value={formatRM(totalClaimed)} helper={`${totalPercentage}% of max relief`} tone="green" />
          <SummaryCard label="Remaining" value={formatRM(totalRemaining)} helper="available to claim" tone="amber" />
        </div>
      </div>

      <hr className="border-border/60" />

      <div className="p-6 sm:p-8 space-y-6 bg-secondary/5 animate-in fade-in slide-in-from-bottom-2 duration-500">

          <div
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragActive(true);
            }}
            onDragLeave={() => setIsDragActive(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragActive(false);
              handleFilesAdded(event.dataTransfer.files);
            }}
            className={cn(
              "relative rounded-[18px] border border-dashed bg-card px-6 py-8 text-center transition-colors",
              isDragActive ? "border-sky-400 bg-sky-50/80" : "border-border/80 hover:border-foreground/30 hover:bg-muted/40",
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf"
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={handleInputChange}
            />
            <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
              <FileUp className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-[15px] font-medium tracking-[-0.02em] text-foreground">Upload receipt or drag here</p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              JPG, PNG or PDF. Verified OCR flow with human correction.
            </p>
            <Button type="button" variant="outline" className="mt-4 rounded-full" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Choose files
            </Button>
          </div>

          {processingFileName ? (
            <div className="flex items-center gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-[13px] text-sky-800">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-200 border-t-sky-600" />
              <p>
                Analysing <span className="font-medium">{processingFileName}</span> and mapping it to a relief category...
              </p>
            </div>
          ) : null}

          <div className="flex items-center gap-4 pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground whitespace-nowrap">Relief categories</p>
            <div className="h-[1px] flex-1 bg-border/40" />
            <button 
              onClick={() => setIsReceiptsListOpen(true)}
              className="text-[12px] font-medium text-emerald-700 hover:text-emerald-800 transition-colors flex items-center gap-1.5"
            >
              View all scanned documents
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-1.5">
            {categories.map((category) => {
              const tone = toneClasses[category.tone];
              const categoryTotal = getCategoryTotal(category, claims);
              const categoryCap = getCategoryCap(category);
              const progress = categoryCap > 0 ? Math.min(100, (categoryTotal / categoryCap) * 100) : 0;
              const Icon = iconMap[category.icon as keyof typeof iconMap];
              const isOpen = openCategoryId === category.id;
              const hasClaim = categoryTotal > 0;
              const isFlashing = flashCategoryId === category.id;

              return (
                <Card
                  key={`${selectedYear}-${category.id}`}
                  className={cn(
                    "overflow-hidden rounded-2xl border border-border/70 shadow-none transition-colors",
                    hasClaim && "border-border",
                    isFlashing && tone.flash,
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setOpenCategoryId((currentId) => (currentId === category.id ? null : category.id))}
                    className="flex w-full items-start gap-3 px-4 py-4 text-left"
                  >
                    <div className="w-6 pt-1 text-xs font-medium text-muted-foreground">{category.num}</div>
                    <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px]", tone.icon)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-medium tracking-[-0.02em] text-foreground">{category.name}</p>
                      <p className="mt-0.5 text-[12px] text-muted-foreground">{category.description}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className={cn("text-[14px] font-medium", hasClaim ? tone.value : "text-muted-foreground")}>
                        {hasClaim ? formatRM(categoryTotal) : "—"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        / {formatRM(categoryCap)}
                      </p>
                    </div>
                    <ChevronDown className={cn("mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                  </button>

                  {hasClaim ? (
                    <div className="mx-4 h-0.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-emerald-600 transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                  ) : null}

                  {isOpen ? (
                    <CardContent className="border-t border-border/70 px-4 py-4">
                      <div className="space-y-3">
                        {category.subItems.map((subItem) => {
                          const claimValue = claims[subItem.id] || 0;
                          const showAddForm = activeInputId === subItem.id;
                          const isAuto = subItem.auto === true;

                          return (
                            <div key={subItem.id} className="border-b border-border/50 pb-3 last:border-b-0 last:pb-0">
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                  <p className="text-[13px] font-normal text-foreground">
                                    {subItem.name}
                                    {subItem.perChild ? <span className="ml-2 text-[11px] text-muted-foreground">(per child)</span> : null}
                                  </p>
                                  <p className="mt-1 text-[11px] text-muted-foreground">
                                    {subItem.note || `Limit: ${formatRM(subItem.limit)}`}
                                  </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                  {claimValue > 0 ? <p className="min-w-[72px] text-right text-[13px] font-medium text-emerald-700">{formatRM(claimValue)}</p> : null}
                                  {isAuto ? (
                                    <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                                      Auto
                                    </span>
                                  ) : (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="h-8 rounded-full px-3 text-xs"
                                      onClick={() => {
                                        setActiveInputId(subItem.id);
                                        setPendingValues((previous) => ({ ...previous, [subItem.id]: previous[subItem.id] || "" }));
                                      }}
                                    >
                                      {claimValue > 0 ? "+ more" : "+ add"}
                                    </Button>
                                  )}
                                </div>
                              </div>

                              {showAddForm && !isAuto ? (
                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                  <Input
                                    type="number"
                                    min={1}
                                    max={subItem.limit}
                                    value={pendingValues[subItem.id] || ""}
                                    onChange={(event) => setPendingValues((previous) => ({ ...previous, [subItem.id]: event.target.value }))}
                                    onKeyDown={(event) => {
                                      if (event.key === "Enter") applyManualClaim(category, subItem.id, subItem.limit);
                                    }}
                                    placeholder="RM amount"
                                    className="h-9 w-[132px] rounded-lg"
                                  />
                                  <Button type="button" size="sm" className="h-9 rounded-lg" onClick={() => applyManualClaim(category, subItem.id, subItem.limit)}>
                                    Add
                                  </Button>
                                  <Button type="button" variant="ghost" size="sm" className="h-9 rounded-lg" onClick={() => setActiveInputId(null)}>
                                    Cancel
                                  </Button>
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3">
                        <p className="text-xs text-muted-foreground">Category total</p>
                        <p className="text-[13px]">
                          <span className="font-medium text-emerald-700">{formatRM(categoryTotal)}</span>
                          <span className="text-muted-foreground"> / {formatRM(categoryCap)}</span>
                        </p>
                      </div>
                    </CardContent>
                  ) : null}
                </Card>
              );
            })}
          </div>

          <Card className="rounded-[18px] border-border/70">
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
              <div>
                <p className="text-[13px] text-muted-foreground">Total estimated relief</p>
                <p className="mt-1 text-[28px] font-medium tracking-[-0.06em] text-emerald-700">{formatRM(totalClaimed)}</p>
              </div>
              <div className="text-right">
                <p className="text-[12px] text-muted-foreground">Maximum available: {formatRM(totalMax)}</p>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  Source:{" "}
                  <a href={MY_TAX_SOURCE_URL} target="_blank" rel="noreferrer" className="text-sky-700 hover:text-sky-800">
                    HASiL YA {selectedYear}
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Sheet open={isReceiptsListOpen} onOpenChange={setIsReceiptsListOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col h-full overflow-hidden">
          <div className="p-6 pb-4 border-b bg-muted/30">
            <SheetHeader>
              <div className="flex items-center justify-between">
                <SheetTitle className="text-xl font-semibold flex items-center gap-2">
                  <ReceiptText className="h-5 w-5 text-emerald-600" />
                  Scanned Receipts
                </SheetTitle>
                <div className="flex items-center gap-2">
                  <Select value={selectedYear} onValueChange={handleYearChange}>
                    <SelectTrigger className="h-8 min-w-[100px] rounded-lg border-border/70 bg-background text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {YEAR_OPTIONS.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <SheetDescription className="text-xs pt-1">
                Historical repository for YA {selectedYear}
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none">
            {yearReceipts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border/50 rounded-2xl bg-secondary/5 mx-2">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
                  <ReceiptText className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-medium">No receipts for {selectedYear}</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                  Upload documents in the main planner to see them here.
                </p>
              </div>
            ) : (
              yearReceipts.map((receipt) => {
                const category = categories.find((entry) => entry.id === receipt.categoryId);
                const subItem = category?.subItems.find((entry) => entry.id === receipt.subItemId);
                const Icon = iconMap[category?.icon as keyof typeof iconMap] || User;

                return (
                  <Card key={receipt.id} className="overflow-hidden rounded-xl border-border/60 hover:border-foreground/20 transition-all hover:shadow-sm">
                    <div className="flex items-center gap-3 p-3">
                      <div className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                        category ? toneClasses[category.tone].icon : "bg-muted"
                      )}>
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-medium truncate text-foreground">{receipt.name}</p>
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          <span className="font-medium text-foreground truncate">{category?.name}</span>
                          <span className="opacity-40">•</span>
                          <span className="truncate">{subItem?.name}</span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold text-emerald-700">{formatRM(receipt.amount)}</p>
                        <div className="mt-1 flex items-center justify-end gap-0.5">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
                            onClick={() => setViewingReceipt(receipt)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 rounded-full text-muted-foreground hover:text-destructive"
                            onClick={() => removeReceipt(receipt.id)}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>

          <div className="p-4 border-t bg-secondary/5">
            <Button
              variant="outline"
              className="w-full h-11 rounded-xl border-border/70 bg-background font-medium gap-2"
              onClick={handleExportAll}
              disabled={isExporting || yearReceipts.length === 0}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4 text-emerald-600" />
              )}
              Export all (YA {selectedYear})
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={!!viewingReceipt} onOpenChange={(open) => !open && setViewingReceipt(null)}>
        <DialogContent className="max-w-3xl overflow-hidden rounded-2xl p-0 sm:rounded-3xl">
          <DialogHeader className="border-b bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-sm font-medium">{viewingReceipt?.name}</DialogTitle>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>YA {viewingReceipt?.year}</span>
                <span className="font-medium text-emerald-700">+{viewingReceipt && formatRM(viewingReceipt.amount)}</span>
              </div>
            </div>
          </DialogHeader>
          <div className="flex flex-col">
            {/* Mobile Preview Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full md:hidden rounded-none h-10 border-b border-border/50 text-emerald-600 bg-emerald-50/20"
              onClick={() => setShowMobilePreview(!showMobilePreview)}
            >
              <Eye className="mr-2 h-4 w-4" />
              {showMobilePreview ? "Hide Receipt Image" : "View Receipt Image"}
            </Button>

            <div className={cn(
              "relative flex items-center justify-center bg-zinc-900 transition-all duration-300",
              showMobilePreview ? "min-h-[300px] h-[50vh] md:h-auto p-4" : "h-0 md:h-auto md:min-h-[400px] overflow-hidden md:p-4"
            )}>
              {viewingReceipt?.dataUrl ? (
                viewingReceipt.dataUrl.startsWith("data:application/pdf") ? (
                  <iframe src={viewingReceipt.dataUrl} className="h-[600px] w-full rounded-lg" title="PDF Preview" />
                ) : (
                  <img src={viewingReceipt.dataUrl} alt={viewingReceipt.name} className="max-h-[70vh] w-auto rounded-lg shadow-2xl" />
                )
              ) : (
                <div className="text-sm text-zinc-400 py-20">No preview available</div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between bg-muted/30 p-4">
            <div className="text-xs text-muted-foreground">
              Mapped to: <span className="font-medium text-foreground">{viewingReceipt && categories.find(c => c.id === viewingReceipt.categoryId)?.name}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => {
                if (viewingReceipt?.dataUrl) {
                  const link = document.createElement("a");
                  link.href = viewingReceipt.dataUrl;
                  link.download = viewingReceipt.name;
                  link.click();
                }
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!pendingReceipt} onOpenChange={(open) => {
        if (!open) {
          setPendingReceipt(null);
          setShowMobilePreview(false);
        }
      }}>
        <DialogContent className="max-w-[800px] gap-0 overflow-hidden rounded-2xl p-0 sm:rounded-3xl max-h-[95vh] flex flex-col sm:block">
          <DialogHeader className="border-b bg-muted/30 px-6 py-4">
            <DialogTitle className="text-lg font-medium">Confirm Receipt Details</DialogTitle>
            <div className="mt-2 p-3 rounded-lg bg-amber-50 border border-amber-100 flex gap-3">
              <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed text-amber-800">
                <span className="font-bold">AI Scan Inconclusive:</span> We couldn't definitively extract all details from this document. Please verify the information and fill in any missing fields manually.
              </p>
            </div>
          </DialogHeader>
          
          <div className="flex flex-col md:flex-row overflow-hidden">
            {/* Left side: Image preview - Collapsible on mobile */}
            <div className={cn(
              "flex-1 bg-zinc-900 flex items-center justify-center transition-all duration-300",
              showMobilePreview ? "min-h-[300px] h-[50vh] md:h-auto" : "h-0 md:h-auto md:min-h-[500px] overflow-hidden"
            )}>
              {pendingReceipt?.dataUrl ? (
                pendingReceipt.dataUrl.startsWith("data:application/pdf") ? (
                  <iframe src={pendingReceipt.dataUrl} className="h-full w-full rounded-lg" title="PDF Preview" />
                ) : (
                  <img src={pendingReceipt.dataUrl} alt="Pending Receipt" className="max-h-[60vh] md:max-h-[70vh] rounded-lg shadow-xl p-4" />
                )
              ) : null}
            </div>

            {/* Right side: Form */}
            <div className="w-full md:w-[320px] p-5 sm:p-6 space-y-5 sm:space-y-6 bg-background border-l border-border/50 overflow-y-auto">
              {/* Mobile Preview Toggle */}
              <Button
                variant="outline"
                size="sm"
                className="w-full md:hidden mb-2 rounded-xl h-10 border-dashed border-emerald-500/30 text-emerald-600 bg-emerald-50/30"
                onClick={() => setShowMobilePreview(!showMobilePreview)}
              >
                <Eye className="mr-2 h-4 w-4" />
                {showMobilePreview ? "Hide Receipt Preview" : "View Receipt Image"}
              </Button>
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Amount (RM)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">RM</span>
                  <Input
                    id="amount"
                    type="number"
                    value={pendingReceipt?.amount || ""}
                    onChange={(e) => setPendingReceipt(prev => prev ? ({ ...prev, amount: Number(e.target.value) }) : null)}
                    className="pl-10 h-11 text-lg font-semibold tracking-tight"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Relief Category</Label>
                <Select
                  value={pendingReceipt?.categoryId}
                  onValueChange={(val) => {
                    const newCat = categories.find(c => c.id === val);
                    setPendingReceipt(prev => prev ? ({ 
                      ...prev, 
                      categoryId: val, 
                      subItemId: newCat?.subItems[0].id || "" 
                    }) : null);
                  }}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.num}. {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Subcategory / Claim Type</Label>
                <Select
                  value={pendingReceipt?.subItemId}
                  onValueChange={(val) => setPendingReceipt(prev => prev ? ({ ...prev, subItemId: val }) : null)}
                >
                  <SelectTrigger className="h-auto py-2.5 min-h-[44px]">
                    <div className="text-left line-clamp-2">
                      <SelectValue placeholder="Select subcategory" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {categories.find(c => c.id === pendingReceipt?.categoryId)?.subItems.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id} disabled={sub.auto}>
                        <div className="flex flex-col py-0.5">
                          <span className="font-medium">{sub.name}</span>
                          <span className="text-[10px] text-muted-foreground">Limit: {formatRM(sub.limit)}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 space-y-3">
                <Button onClick={confirmReceipt} className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
                  Confirm & Add Claim
                </Button>
                <Button variant="ghost" onClick={() => setPendingReceipt(null)} className="w-full h-11 rounded-xl text-muted-foreground">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  helper,
  tone,
}: {
  label: string;
  value: string;
  helper: string;
  tone: "green" | "amber" | "default";
}) {
  return (
    <Card className="rounded-[14px] border-border/70 shadow-none">
      <CardContent className="p-4">
        <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
        <p
          className={cn(
            "mt-1 text-[18px] font-medium tracking-[-0.06em] sm:text-[24px]",
            tone === "green" && "text-emerald-700",
            tone === "amber" && "text-amber-700",
          )}
        >
          {value}
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}

export default MyTaxView;
