import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Accessibility,
  Activity,
  Baby,
  BadgeAlert,
  Blocks,
  ChevronDown,
  ChevronLeft,
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
  Image as ImageIcon,
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
  getPlannerDataForYear,
  MY_TAX_SOURCE_URL,
  PlannerCategory,
  PlannerReceipt,
} from "@/features/financial-records/my-tax/domain/myTaxPlannerData";
import { AssessmentYear } from "@/features/financial-records/my-tax/domain/taxReliefs";
import { ApiService } from "@/shared/api";
import { useAuth } from "@/features/auth/data/useAuth";

type ClaimsByYear = Record<AssessmentYear, Record<string, number>>;

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS: AssessmentYear[] = Array.from({ length: Math.max(2, currentYear - 2024 + 1) }, (_, i) => (currentYear - i).toString());

const SOCSO_WAGE_CEILING = 6000;
const SOCSO_RATE = 0.005; 
const EPF_RATE = 0.11;    

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

function buildInitialClaims(autoAmounts: Record<string, number> = {}, years: string[] = YEAR_OPTIONS): ClaimsByYear {
  const claims: ClaimsByYear = {};
  for (const year of years) {
    claims[year] = Object.fromEntries(getPlannerDataForYear(year).flatMap((category) => category.subItems.map((subItem) => [subItem.id, autoAmounts[subItem.id] ?? 0])));
  }
  return claims;
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
  const lower = fileName.toLowerCase();
  for (const category of categories) {
    for (const subItem of category.subItems) {
      const keywords = DETECTION_KEYWORD_MAP[subItem.id] || [];
      if (keywords.some((kw) => lower.includes(kw))) {
        return subItem.id;
      }
    }
  }
  return "";
}

function detectAmount(fileName: string) {
  const match = fileName.match(/(\d+[\._]\d{2})|(\d+)/);
  if (match) return Number.parseFloat(match[0].replace("_", ".")) || 0;
  return 0;
}

export function MyTaxView({ monthlyIncome = 0, age = 30 }: { monthlyIncome?: number; age?: number }) {
  const { user } = useAuth();
  const [selectedYear, setSelectedYear] = useState<AssessmentYear>(currentYear.toString());
  const [saving, setSaving] = useState(false);

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
  const [receiptToDelete, setReceiptToDelete] = useState<PlannerReceipt | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReceiptsListOpen, setIsReceiptsListOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setClaimsByYear((prev) => {
      const updated: ClaimsByYear = { ...prev };
      for (const year of YEAR_OPTIONS) {
        updated[year] = { ...prev[year] };
        for (const [id, value] of Object.entries(autoAmounts)) {
          updated[year][id] = value;
        }
      }
      return updated;
    });
  }, [autoAmounts]);

  useEffect(() => {
    const loadReceipts = async () => {
      if (!user) return;
      try {
        const data = await ApiService.tax.fetchReceipts(user.id, Number(selectedYear));
        const mappedReceipts = data.map(r => ({
          id: r.id,
          name: r.file_name,
          amount: Number(r.amount),
          categoryId: r.category_id,
          subItemId: r.sub_item_id,
          year: String(r.tax_year) as AssessmentYear,
          storagePath: r.storage_path
        }));
        setReceipts(mappedReceipts);

        setClaimsByYear(prev => {
          const newYearClaims = { ...buildInitialClaims(autoAmounts)[selectedYear] };
          
          mappedReceipts.forEach(r => {
            if (r.subItemId) {
              const category = getPlannerDataForYear(selectedYear).find(c => c.id === r.categoryId);
              const subItem = category?.subItems.find(s => s.id === r.subItemId);
              if (subItem) {
                newYearClaims[r.subItemId] = Math.min(subItem.limit, (newYearClaims[r.subItemId] || 0) + r.amount);
              }
            }
          });
          
          return {
            ...prev,
            [selectedYear]: newYearClaims
          };
        });
      } catch (error) {
        console.error("Error loading receipts:", error);
      }
    };
    loadReceipts();
  }, [user, selectedYear, autoAmounts]);

  const categories = getPlannerDataForYear(selectedYear);
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

  const removeReceipt = async (receiptId: string) => {
    const receipt = receipts.find((entry) => entry.id === receiptId);
    if (!receipt || !user) return;

    setIsDeleting(true);
    try {
      await ApiService.tax.deleteReceipt(receipt.id, user.id, receipt.storagePath);

      const remainingReceipts = receipts.filter((entry) => entry.id !== receiptId);
      setReceipts(remainingReceipts);

      setClaimsByYear(prev => {
        const newYearClaims = { ...buildInitialClaims(autoAmounts)[receipt.year] };
        remainingReceipts
          .filter(r => r.year === receipt.year)
          .forEach(r => {
            if (r.subItemId) {
              const category = getPlannerDataForYear(receipt.year).find(c => c.id === r.categoryId);
              const subItem = category?.subItems.find(s => s.id === r.subItemId);
              if (subItem) {
                newYearClaims[r.subItemId] = Math.min(subItem.limit, (newYearClaims[r.subItemId] || 0) + r.amount);
              }
            }
          });
        return { ...prev, [receipt.year]: newYearClaims };
      });

      toast.success("Receipt deleted");
    } catch (error) {
      console.error("Error deleting receipt:", error);
      toast.error("Failed to delete receipt");
    } finally {
      setIsDeleting(false);
      setReceiptToDelete(null);
    }
  };

  const processFile = async (file: File) => {
    if (!user) return;
    setProcessingFileName(file.name);

    try {
      const nextCategories = getPlannerDataForYear(selectedYear);
      const guessedSubItemId = detectSubItemId(file.name, nextCategories);
      const category = nextCategories.find((entry) => entry.subItems.some((subItem) => subItem.id === guessedSubItemId));
      const guessedAmount = detectAmount(file.name);

      const filePath = await ApiService.storage.uploadReceipt(file, user.id);

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setProcessingFileName(null);
        setPendingReceipt({
          id: crypto.randomUUID(),
          year: selectedYear,
          name: file.name,
          categoryId: category?.id || "", 
          subItemId: guessedSubItemId || "",
          amount: guessedAmount,
          dataUrl,
          storagePath: filePath,
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Failed to upload receipt");
      setProcessingFileName(null);
    }
  };

  const confirmReceipt = async () => {
    if (!pendingReceipt || !user) return;

    const category = categories.find((c) => c.id === pendingReceipt.categoryId);
    const subItem = category?.subItems.find((s) => s.id === pendingReceipt.subItemId);

    if (!category || !subItem) {
      toast.error("Please select a valid category");
      return;
    }

    setSaving(true);
    try {
      await ApiService.tax.saveReceipt({
        user_id: user.id,
        file_name: pendingReceipt.name,
        storage_path: pendingReceipt.storagePath || "",
        tax_year: Number(selectedYear),
        amount: pendingReceipt.amount,
        category_id: pendingReceipt.categoryId,
        sub_item_id: pendingReceipt.subItemId,
      });

      setClaimsByYear((previous) => {
        const currentYearClaims = previous[selectedYear];
        const currentClaim = currentYearClaims[subItem.id] || 0;
        return {
          ...previous,
          [selectedYear]: {
            ...currentYearClaims,
            [subItem.id]: Math.min(subItem.limit, currentClaim + pendingReceipt.amount),
          },
        };
      });

      const updatedReceipts = await ApiService.tax.fetchReceipts(user.id, Number(selectedYear));
      setReceipts(updatedReceipts.map(r => ({
        id: r.id,
        name: r.file_name,
        amount: Number(r.amount),
        categoryId: r.category_id,
        subItemId: r.sub_item_id,
        year: String(r.tax_year) as AssessmentYear,
        storagePath: r.storage_path
      })));

      setOpenCategoryId(category.id);
      setFlashCategoryId(category.id);
      window.setTimeout(() => setFlashCategoryId(null), 800);
      toast.success("Receipt saved successfully");
    } catch (error) {
      console.error("Error saving receipt:", error);
      toast.error("Failed to save receipt");
    } finally {
      setSaving(false);
      setPendingReceipt(null);
    }
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
        if (receipt.storagePath) {
          const url = await ApiService.storage.createSignedUrl(receipt.storagePath);
          if (url) {
            const resp = await fetch(url);
            const blob = await resp.blob();
            folder?.file(receipt.name, blob);
          }
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

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchUrl = async () => {
      if (viewingReceipt?.storagePath) {
        const url = await ApiService.storage.createSignedUrl(viewingReceipt.storagePath);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(viewingReceipt?.dataUrl || null);
      }
    };
    fetchUrl();
  }, [viewingReceipt]);

  const handleUpdateReceipt = async () => {
    if (!viewingReceipt || !user) return;
    setSaving(true);
    try {
      await ApiService.tax.updateReceipt(viewingReceipt.id, user.id, {
        file_name: viewingReceipt.name,
        amount: viewingReceipt.amount,
        category_id: viewingReceipt.categoryId,
        sub_item_id: viewingReceipt.subItemId,
      });

      const updatedReceipts = receipts.map(r => r.id === viewingReceipt.id ? viewingReceipt : r);
      setReceipts(updatedReceipts);
      
      setClaimsByYear(prev => {
        const newYearClaims = { ...buildInitialClaims(autoAmounts)[viewingReceipt.year] };
        
        updatedReceipts
          .filter(r => r.year === viewingReceipt.year)
          .forEach(r => {
            if (r.subItemId) {
              const category = getPlannerDataForYear(viewingReceipt.year).find(c => c.id === r.categoryId);
              const subItem = category?.subItems.find(s => s.id === r.subItemId);
              if (subItem) {
                newYearClaims[r.subItemId] = Math.min(subItem.limit, (newYearClaims[r.subItemId] || 0) + r.amount);
              }
            }
          });
          
        return {
          ...prev,
          [viewingReceipt.year]: newYearClaims
        };
      });

      toast.success("Receipt updated successfully");
      setViewingReceipt(null);
    } catch (error: any) {
      console.error("Error updating receipt:", error);
      toast.error(`Save failed: ${error.message || "Unknown error"}`);
    } finally {
      setSaving(false);
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
      <div className="p-6 sm:p-8 space-y-2 sm:space-y-6">

        {/* ── Header: mobile = centred picker only, desktop = 3-col grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4 sm:gap-2">

          {/* Left: title (desktop only) */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <ReceiptText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-foreground tracking-tight">Tax Relief Planner</h2>
              <p className="text-[13px] font-normal text-muted-foreground">YA {selectedYear} • Tax Relief Assessment</p>
            </div>
          </div>

          {/* Centre: pill year picker */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-1 rounded-full bg-background/50 p-1 border border-border/60 shadow-sm">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-background/80"
                onClick={() => {
                  const idx = YEAR_OPTIONS.indexOf(selectedYear);
                  if (idx < YEAR_OPTIONS.length - 1) handleYearChange(YEAR_OPTIONS[idx + 1]);
                }}
                disabled={YEAR_OPTIONS.indexOf(selectedYear) >= YEAR_OPTIONS.length - 1}
              >
                <ChevronLeft className="h-5 w-5 text-muted-foreground" />
              </Button>
              <div className="px-3 min-w-[64px] text-center">
                <span className="text-[12px] font-medium text-foreground leading-none">YA {selectedYear}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-background/80"
                onClick={() => {
                  const idx = YEAR_OPTIONS.indexOf(selectedYear);
                  if (idx > 0) handleYearChange(YEAR_OPTIONS[idx - 1]);
                }}
                disabled={YEAR_OPTIONS.indexOf(selectedYear) <= 0}
              >
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
          </div>

          {/* Right: receipts button (desktop only) */}
          <div className="hidden sm:flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-full border-border/60 bg-background/50 px-4 font-medium"
              onClick={() => setIsReceiptsListOpen(true)}
            >
              <ReceiptText className="mr-2 h-4 w-4 text-emerald-600" />
              Receipts
              {yearReceipts.length > 0 && (
                <span className="ml-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white">
                  {yearReceipts.length}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* ── Hero RM amount ── */}
        <p className="sm:hidden text-[11px] font-medium text-muted-foreground/70 uppercase tracking-widest !mt-6">Total claimed</p>
        <div className="flex items-baseline gap-3 flex-wrap mb-2">
          <span className="text-4xl sm:text-[52px] font-medium tracking-tight leading-none text-foreground">
            {formatRM(totalClaimed)}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
            {totalPercentage}% of max relief
          </span>
        </div>

      </div>

      <hr className="border-border/60" />

      <div className="p-6 sm:p-8 space-y-4 sm:space-y-6 bg-secondary/5 animate-in fade-in slide-in-from-bottom-2 duration-500">
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
            "relative hidden sm:block rounded-[18px] border border-dashed bg-card px-6 py-8 text-center transition-colors",
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

        <div className="flex items-center gap-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground whitespace-nowrap">Relief categories</p>
          <div className="h-[1px] flex-1 bg-border/40" />
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
                  className="flex w-full items-start gap-3 px-3 py-3 sm:px-4 sm:py-4 text-left"
                >
                  <div className="w-6 pt-1 text-xs font-medium text-muted-foreground">{category.num}</div>
                  <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px]", tone.icon)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium tracking-[-0.02em] text-foreground">{category.name}</p>
                    <p className={cn("mt-0.5 text-[12px] text-muted-foreground", !isOpen && "hidden sm:block")}>{category.description}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={cn("text-[14px] font-medium", hasClaim ? "text-emerald-700" : "text-muted-foreground")}>
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

      </div>

      <Sheet open={isReceiptsListOpen} onOpenChange={setIsReceiptsListOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col h-full overflow-hidden">
          <div className="p-6 pb-4 border-b bg-muted/30">
            <SheetHeader>
              <div className="flex items-center justify-between pr-8">
                <SheetTitle className="text-xl font-semibold flex items-center gap-2">
                  <ReceiptText className="h-5 w-5 text-emerald-600" />
                  Scanned Receipts
                </SheetTitle>
              </div>
              <div className="flex justify-center pt-3">
                <Select value={selectedYear} onValueChange={handleYearChange}>
                  <SelectTrigger className="h-8 min-w-[120px] rounded-full border-border/70 bg-background text-xs font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {YEAR_OPTIONS.map((year) => (
                      <SelectItem key={year} value={year}>
                        YA {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </SheetHeader>
          </div>

          <div 
            className={cn(
              "flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none transition-all",
              isDragActive ? "bg-sky-50/50 ring-2 ring-inset ring-sky-400" : ""
            )}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragActive(true);
            }}
            onDragLeave={() => setIsDragActive(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragActive(false);
              const file = event.dataTransfer.files[0];
              if (file) {
                setIsReceiptsListOpen(false); // Close panel to show processing modal
                processFile(file);
              }
            }}
          >
            {yearReceipts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border/50 rounded-2xl bg-secondary/5 mx-2">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
                  <ReceiptText className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-medium">No receipts for {selectedYear}</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                  Drag and drop a receipt here or click to upload.
                </p>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="mt-4 rounded-full" 
                  onClick={() => {
                    setIsReceiptsListOpen(false);
                    fileInputRef.current?.click();
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Receipt
                </Button>
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
                            onClick={() => setReceiptToDelete(receipt)}
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

          <div className="p-4 border-t bg-secondary/5 flex flex-col gap-2">
            <Button 
              type="button"
              className="w-full h-11 rounded-xl shadow-sm"
              onClick={() => {
                setIsReceiptsListOpen(false);
                fileInputRef.current?.click();
              }}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload New Receipt
            </Button>
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

      {/* Standardized Receipt Modal (Split View Layout) */}
      <Dialog 
        open={!!viewingReceipt || !!pendingReceipt} 
        onOpenChange={(open) => {
          if (!open) {
            setViewingReceipt(null);
            setPendingReceipt(null);
            setShowMobilePreview(false);
          }
        }}
      >
        <DialogContent className="max-w-[850px] gap-0 overflow-hidden rounded-2xl p-0 sm:rounded-3xl max-h-[90vh] flex flex-col sm:block">
          <DialogHeader className="border-b bg-muted/30 px-6 py-4">
            <DialogTitle className="text-lg font-medium flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-emerald-600" />
              {pendingReceipt ? "Confirm Receipt Details" : "Edit Receipt Details"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col md:flex-row overflow-hidden bg-background">
            {/* Left side: Image preview */}
            <div className={cn(
              "flex-1 bg-zinc-900 flex items-center justify-center transition-all duration-300 relative",
              showMobilePreview ? "min-h-[300px] h-[50vh] md:h-auto" : "h-0 md:h-auto md:min-h-[500px] overflow-hidden"
            )}>
              {(previewUrl || pendingReceipt?.dataUrl) ? (
                (previewUrl || pendingReceipt?.dataUrl || "").includes("application/pdf") ? (
                  <iframe src={previewUrl || pendingReceipt?.dataUrl || ""} className="h-full w-full rounded-lg" title="PDF Preview" />
                ) : (
                  <img 
                    src={previewUrl || pendingReceipt?.dataUrl || ""} 
                    alt="Receipt Preview" 
                    className="max-h-[60vh] md:max-h-[70vh] rounded-lg shadow-xl p-4 object-contain" 
                  />
                )
              ) : (
                <div className="flex flex-col items-center gap-4 py-20 text-zinc-500">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p className="text-sm font-medium">Loading preview...</p>
                </div>
              )}
            </div>

            {/* Right side: Form */}
            <div className="w-full md:w-[350px] p-6 space-y-6 border-l border-border/50 flex flex-col justify-between">
              <div className="space-y-6">
                {/* Mobile Preview Toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full md:hidden mb-2 rounded-xl h-10 border-dashed border-emerald-500/30 text-emerald-600 bg-emerald-50/30"
                  onClick={() => setShowMobilePreview(!showMobilePreview)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  {showMobilePreview ? "Hide Preview" : "View Receipt"}
                </Button>

                <div className="space-y-2">
                  <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Merchant / Filename</Label>
                  <Input 
                    value={(pendingReceipt || viewingReceipt)?.name || ""}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (pendingReceipt) setPendingReceipt({ ...pendingReceipt, name: val });
                      if (viewingReceipt) {
                        setViewingReceipt({ ...viewingReceipt, name: val });
                        setReceipts(prev => prev.map(r => r.id === viewingReceipt.id ? { ...r, name: val } : r));
                      }
                    }}
                    className="rounded-xl border-border/60 font-medium"
                    placeholder="Enter merchant name..."
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Amount (RM)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">RM</span>
                    <Input 
                      type="number"
                      step="0.01"
                      value={(pendingReceipt || viewingReceipt)?.amount || ""}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        if (pendingReceipt) setPendingReceipt({ ...pendingReceipt, amount: val });
                        if (viewingReceipt) {
                          setViewingReceipt({ ...viewingReceipt, amount: val });
                          setReceipts(prev => prev.map(r => r.id === viewingReceipt.id ? { ...r, amount: val } : r));
                        }
                      }}
                      className="pl-10 rounded-xl border-border/60 font-bold text-emerald-700 h-11 text-lg"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Tax Relief Category</Label>
                  <Select 
                    value={(pendingReceipt || viewingReceipt)?.subItemId || ""}
                    onValueChange={(subId) => {
                      const parentCategory = categories.find(c => c.subItems.some(s => s.id === subId));
                      if (parentCategory) {
                        if (pendingReceipt) setPendingReceipt({ ...pendingReceipt, subItemId: subId, categoryId: parentCategory.id });
                        if (viewingReceipt) {
                          setViewingReceipt({ ...viewingReceipt, subItemId: subId, categoryId: parentCategory.id });
                          setReceipts(prev => prev.map(r => r.id === viewingReceipt.id ? { ...r, subItemId: subId, categoryId: parentCategory.id } : r));
                        }
                      }
                    }}
                  >
                    <SelectTrigger className="rounded-xl border-border/60 h-11">
                      <SelectValue placeholder="Select relief type" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="max-h-[300px] overflow-y-auto w-[var(--radix-select-trigger-width)]">
                      {categories.map((cat) => (
                        <div key={cat.id}>
                          <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/30">
                            {cat.name}
                          </div>
                          {cat.subItems.map((sub) => (
                            <SelectItem key={sub.id} value={sub.id} className="text-xs pl-8" disabled={sub.auto}>
                              {sub.name}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Estimated Relief Box */}
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100/50 space-y-2 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Estimated Relief</span>
                    <span className="text-lg font-bold text-emerald-700">
                      {formatRM((pendingReceipt || viewingReceipt)?.amount || 0)}
                    </span>
                  </div>
                  <p className="text-[10px] text-emerald-600 leading-relaxed italic">
                    * This amount will be applied to YA {(pendingReceipt || viewingReceipt)?.year} upon confirmation.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col gap-2">
                {viewingReceipt && (
                  <Button 
                    variant="outline" 
                    className="w-full rounded-xl h-12 gap-2"
                    onClick={async () => {
                      if (!previewUrl) return;
                      try {
                        const response = await fetch(previewUrl);
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = viewingReceipt.name;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                      } catch (err) {
                        window.open(previewUrl, '_blank');
                      }
                    }}
                  >
                    <Download className="h-4 w-4" />
                    Download Original
                  </Button>
                )}
                <Button 
                  onClick={pendingReceipt ? confirmReceipt : handleUpdateReceipt}
                  disabled={saving || !(pendingReceipt || viewingReceipt)?.subItemId}
                  className="w-full rounded-xl h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/20"
                >
                  {saving ? "Saving..." : (pendingReceipt ? "Confirm details" : "Save Changes")}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setViewingReceipt(null);
                    setPendingReceipt(null);
                  }}
                  className="w-full rounded-xl h-10 text-muted-foreground"
                >
                  {pendingReceipt ? "Discard" : "Cancel"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Delete confirmation dialog */}
      <Dialog open={!!receiptToDelete} onOpenChange={(open) => { if (!open) setReceiptToDelete(null); }}>
        <DialogContent className="max-w-sm rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Delete receipt?</DialogTitle>
          </DialogHeader>
          <p className="text-[13px] text-muted-foreground mt-1">
            <span className="font-medium text-foreground">{receiptToDelete?.name}</span> will be permanently removed from your records and storage. This cannot be undone.
          </p>
          <DialogFooter className="mt-4 flex gap-2">
            <Button
              variant="outline"
              className="flex-1 rounded-full"
              onClick={() => setReceiptToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1 rounded-full"
              onClick={() => receiptToDelete && removeReceipt(receiptToDelete.id)}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mobile fixed CTA — adapts based on whether receipts exist */}
      <div className="sm:hidden fixed bottom-16 left-0 right-0 z-40 px-4 pb-3 pt-2 bg-gradient-to-t from-background via-background to-transparent">
        <input
          type="file"
          multiple
          accept="image/*,.pdf"
          className="hidden"
          id="mobile-receipt-input"
          onChange={handleInputChange}
        />
        {yearReceipts.length > 0 ? (
          <Button
            onClick={() => setIsReceiptsListOpen(true)}
            className="w-full h-12 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 font-semibold shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98] gap-2 text-[15px]"
          >
            <ReceiptText className="w-4 h-4" />
            View uploaded documents
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/20 px-1.5 text-[11px] font-bold">
              {yearReceipts.length}
            </span>
          </Button>
        ) : (
          <Button
            onClick={() => document.getElementById("mobile-receipt-input")?.click()}
            className="w-full h-12 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 font-semibold shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98] gap-2 text-[15px]"
          >
            <Upload className="w-4 h-4" />
            Upload Receipt
          </Button>
        )}
      </div>
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
      <CardContent className="p-2.5 sm:p-4">
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
