import { useEffect, useState } from "react";
import { ChevronDown, CircleHelp } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import {
  NetWorthFormValues,
  normaliseNetWorthValues,
} from "@/features/financial-records/domain/netWorth";

interface NetWorthFormProps {
  initialValues: NetWorthFormValues;
  saving?: boolean;
  onSubmit: (values: NetWorthFormValues) => Promise<void> | void;
}

const fields: Array<{
  key: keyof NetWorthFormValues;
  label: string;
  hint: string;
  optional?: boolean;
}> = [
  {
    key: "totalCash",
    label: "Cash (all accounts combined)",
    hint: "Include: bank accounts, savings, e-wallets (TnG, GrabPay), fixed deposits",
  },
  {
    key: "totalInvestments",
    label: "Investments (stocks, crypto, funds)",
    hint: "Include: stocks, crypto, unit trusts, robo-advisors (Versa, StashAway)",
  },
  {
    key: "totalProperty",
    label: "Total Property",
    hint: "Include: homes, land, or other property at today’s rough value",
    optional: true,
  },
  {
    key: "totalLiabilities",
    label: "Total Liabilities",
    hint: "Include: home loans, car loans, personal loans, and credit card balances",
  },
];

const helperFields = {
  totalCash: [
    { key: "maybank", label: "Maybank" },
    { key: "cimb", label: "CIMB" },
    { key: "tng", label: "TnG / e-wallets" },
    { key: "others", label: "Others" },
  ],
  totalInvestments: [
    { key: "stocks", label: "Stocks / ETFs" },
    { key: "crypto", label: "Crypto" },
    { key: "funds", label: "Unit trusts / funds" },
    { key: "robo", label: "Robo-advisors" },
  ],
} as const;

type HelperKey = keyof typeof helperFields;
type HelperValues = Record<HelperKey, Record<string, number>>;

export function NetWorthForm({ initialValues, saving = false, onSubmit }: NetWorthFormProps) {
  const [values, setValues] = useState<NetWorthFormValues>(initialValues);
  const [expandedHelpers, setExpandedHelpers] = useState<Record<HelperKey, boolean>>({
    totalCash: false,
    totalInvestments: false,
  });
  const [helperValues, setHelperValues] = useState<HelperValues>({
    totalCash: { maybank: 0, cimb: 0, tng: 0, others: 0 },
    totalInvestments: { stocks: 0, crypto: 0, funds: 0, robo: 0 },
  });

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const handleChange = (key: keyof NetWorthFormValues, rawValue: string) => {
    const nextValue = rawValue === "" ? 0 : Number(rawValue);
    setValues((current) => ({
      ...current,
      [key]: Number.isFinite(nextValue) ? nextValue : 0,
    }));
  };

  const handleHelperToggle = (key: HelperKey) => {
    setExpandedHelpers((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const handleHelperChange = (section: HelperKey, key: string, rawValue: string) => {
    const nextValue = rawValue === "" ? 0 : Number(rawValue);
    const safeValue = Number.isFinite(nextValue) ? nextValue : 0;

    setHelperValues((current) => {
      const nextSectionValues = {
        ...current[section],
        [key]: safeValue,
      };

      const total = Object.values(nextSectionValues).reduce((sum, item) => sum + item, 0);

      setValues((currentValues) => ({
        ...currentValues,
        [section]: total,
      }));

      return {
        ...current,
        [section]: nextSectionValues,
      };
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(normaliseNetWorthValues(values));
  };

  return (
    <TooltipProvider delayDuration={100}>
      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-foreground">Update your net worth</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Four quick numbers. We’ll save one record for this month.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {fields.map((field) => (
              <div key={field.key} className="space-y-2 rounded-xl border border-border/70 bg-secondary/10 p-3">
                <label className="space-y-1.5">
                  <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <span>
                      {field.label}
                      {field.optional ? <span className="ml-1 text-muted-foreground">(optional)</span> : null}
                    </span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="text-muted-foreground transition-colors hover:text-foreground"
                          aria-label={`${field.label} help`}
                        >
                          <CircleHelp className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[260px] text-xs leading-relaxed">
                        <p>{field.hint}</p>
                      </TooltipContent>
                    </Tooltip>
                  </span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={values[field.key] || ""}
                    onChange={(event) => handleChange(field.key, event.target.value)}
                    placeholder="0"
                  />
                </label>

                {(field.key === "totalCash" || field.key === "totalInvestments") && (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => handleHelperToggle(field.key)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 transition-colors hover:text-emerald-800"
                    >
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform duration-200 ${expandedHelpers[field.key] ? "rotate-180" : ""}`}
                      />
                      Break it down (optional)
                    </button>

                    {expandedHelpers[field.key] && (
                      <div className="grid grid-cols-1 gap-2 rounded-lg border border-border/70 bg-background/90 p-3">
                        {helperFields[field.key].map((helperField) => (
                          <label key={helperField.key} className="grid grid-cols-[minmax(0,1fr)_120px] items-center gap-3">
                            <span className="text-xs font-medium text-muted-foreground">{helperField.label}</span>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              inputMode="decimal"
                              value={helperValues[field.key][helperField.key] || ""}
                              onChange={(event) => handleHelperChange(field.key, helperField.key, event.target.value)}
                              placeholder="0"
                              className="h-9"
                            />
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <Button
            type="submit"
            className="w-full rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save This Month"}
          </Button>
        </form>
      </section>
    </TooltipProvider>
  );
}

export default NetWorthForm;
