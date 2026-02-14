import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Scale, Minus, Plus, RotateCcw, ChevronDown } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/components/ui/collapsible";
import { HouseholdType, Location, ExpenseAssumptions, DEFAULT_EXPENSES } from "@/features/income-reality/domain/incomeRealityCalculations";

interface IncomeRealityInputsProps {
  initialMonthlyIncome?: number;
  initialHousingCost?: number;
  initialCurrentEPF?: number;
  initialAge?: number;
  initialHouseholdType?: string;
  initialDependants?: number;
  initialLocation?: string;
  initialExpenses?: ExpenseAssumptions;
  onChanged: (data: {
    monthlyIncome: number;
    housingCost: number;
    householdType: HouseholdType;
    dependants: number;
    location: Location;
    expenses: ExpenseAssumptions;
  }) => void;
  onSave?: (data: {
    monthlyIncome: number;
    housingCost: number;
    householdType: HouseholdType;
    dependants: number;
    location: Location;
    expenses: ExpenseAssumptions;
  }) => void;
}

const IncomeRealityInputs: React.FC<IncomeRealityInputsProps> = ({
  initialMonthlyIncome = 0,
  initialHousingCost = 0,
  initialHouseholdType = 'alone',
  initialDependants = 1,
  initialLocation = 'kl',
  initialExpenses,
  onChanged,
  onSave,
}) => {
  const [monthlyIncome, setMonthlyIncome] = useState(initialMonthlyIncome);
  const [inputIncome, setInputIncome] = useState(initialMonthlyIncome > 0 ? initialMonthlyIncome.toString() : "");
  const [housingCost, setHousingCost] = useState(initialHousingCost);
  const [inputHousing, setInputHousing] = useState(initialHousingCost > 0 ? initialHousingCost.toString() : "");
  const [householdType, setHouseholdType] = useState<HouseholdType>(initialHouseholdType as HouseholdType);
  const [dependants, setDependants] = useState(initialDependants);
  const [location, setLocation] = useState<Location>(initialLocation as Location);

  const initExp = initialExpenses || DEFAULT_EXPENSES;
  const [expenses, setExpenses] = useState<ExpenseAssumptions>({ ...initExp });
  const [inputFood, setInputFood] = useState(initExp.food.toString());
  const [inputTransport, setInputTransport] = useState(initExp.transport.toString());
  const [inputUtilities, setInputUtilities] = useState(initExp.utilities.toString());
  const [inputOthers, setInputOthers] = useState(initExp.others.toString());
  const [inputEntertainment, setInputEntertainment] = useState(initExp.entertainment.toString());
  const [expensesOpen, setExpensesOpen] = useState(false);

  const isCustomExpenses =
    expenses.food !== DEFAULT_EXPENSES.food ||
    expenses.transport !== DEFAULT_EXPENSES.transport ||
    expenses.utilities !== DEFAULT_EXPENSES.utilities ||
    expenses.others !== DEFAULT_EXPENSES.others ||
    expenses.entertainment !== DEFAULT_EXPENSES.entertainment;

  const resetExpenses = () => {
    const reset = { ...DEFAULT_EXPENSES };
    setExpenses(reset);
    setInputFood(DEFAULT_EXPENSES.food.toString());
    setInputTransport(DEFAULT_EXPENSES.transport.toString());
    setInputUtilities(DEFAULT_EXPENSES.utilities.toString());
    setInputOthers(DEFAULT_EXPENSES.others.toString());
    setInputEntertainment(DEFAULT_EXPENSES.entertainment.toString());
    // Auto-save reset
    if (onSave) {
      onSave({ monthlyIncome, housingCost, householdType, dependants, location, expenses: reset });
    }
  };

  useEffect(() => {
    setMonthlyIncome(initialMonthlyIncome);
    setInputIncome(initialMonthlyIncome > 0 ? initialMonthlyIncome.toString() : "");
  }, [initialMonthlyIncome]);

  useEffect(() => {
    onChanged({ monthlyIncome, housingCost, householdType, dependants, location, expenses });
  }, [monthlyIncome, housingCost, householdType, dependants, location, expenses]);

  // Auto-save on selection changes (household type, location, dependants)
  const triggerSave = (overrides?: Partial<{ monthlyIncome: number; housingCost: number; householdType: HouseholdType; dependants: number; location: Location; expenses: ExpenseAssumptions }>) => {
    if (onSave) {
      onSave({ monthlyIncome, housingCost, householdType, dependants, location, expenses, ...overrides });
    }
  };

  const handleNumericInput = (
    value: string,
    setInput: (v: string) => void,
    setValue: (v: number) => void
  ) => {
    setInput(value);
    const val = parseFloat(value);
    if (!isNaN(val)) setValue(val);
    else if (value === "") setValue(0);
  };

  return (
    <Card className="w-full shadow-md border-border/60">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Scale className="h-5 w-5 text-primary" />
          Baseline Life Cost
        </CardTitle>
        <CardDescription className="text-xs">
          Automatically calculates how much of a typical life your income can support.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Monthly Income and Housing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="realityIncome" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Monthly Income
            </Label>
            <div className="relative group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm group-focus-within:text-primary transition-colors">RM</span>
              <Input
                id="realityIncome"
                type="number"
                value={inputIncome}
                onChange={(e) => handleNumericInput(e.target.value, setInputIncome, setMonthlyIncome)}
                onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
                onBlur={() => triggerSave({ monthlyIncome })}
                className="pl-10 text-lg font-bold h-12 border-2 focus-visible:ring-primary/20"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="housingCost" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Housing / Rental
            </Label>
            <div className="relative group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm group-focus-within:text-primary transition-colors">RM</span>
              <Input
                id="housingCost"
                type="number"
                value={inputHousing}
                onChange={(e) => handleNumericInput(e.target.value, setInputHousing, setHousingCost)}
                onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
                onBlur={() => triggerSave({ housingCost })}
                className="pl-10 text-lg font-bold h-12 border-2 focus-visible:ring-primary/20"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Expense Assumptions - Collapsible (matches Retirement Assumptions UX) */}
        <Collapsible open={expensesOpen} onOpenChange={setExpensesOpen} className="border border-border rounded-xl">
          <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors rounded-xl">
            <div className="text-left">
              <h4 className="text-sm font-semibold text-foreground">Expense Assumptions</h4>
              <p className="text-xs text-muted-foreground">
                RM {(expenses.food + expenses.transport + expenses.utilities + expenses.others + expenses.entertainment).toLocaleString("en-MY")}/mo base{isCustomExpenses ? " · Edited" : ""}
              </p>
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expensesOpen ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4 space-y-3">
            <p className="text-xs text-muted-foreground">
              Average monthly costs for a single adult in KL. Adjust to match your situation.
            </p>
            {/* Food */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Food</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">RM</span>
                <Input
                  type="number"
                  value={inputFood}
                  onChange={(e) => handleNumericInput(e.target.value, setInputFood, (v) => setExpenses(prev => ({ ...prev, food: v })))}
                  onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
                  onBlur={() => triggerSave()}
                  className="pl-12 text-sm"
                />
              </div>
            </div>
            {/* Transport */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Transport</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">RM</span>
                <Input
                  type="number"
                  value={inputTransport}
                  onChange={(e) => handleNumericInput(e.target.value, setInputTransport, (v) => setExpenses(prev => ({ ...prev, transport: v })))}
                  onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
                  onBlur={() => triggerSave()}
                  className="pl-12 text-sm"
                />
              </div>
            </div>
            {/* Utilities */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Utilities</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">RM</span>
                <Input
                  type="number"
                  value={inputUtilities}
                  onChange={(e) => handleNumericInput(e.target.value, setInputUtilities, (v) => setExpenses(prev => ({ ...prev, utilities: v })))}
                  onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
                  onBlur={() => triggerSave()}
                  className="pl-12 text-sm"
                />
              </div>
            </div>
            {/* Others */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Others</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">RM</span>
                <Input
                  type="number"
                  value={inputOthers}
                  onChange={(e) => handleNumericInput(e.target.value, setInputOthers, (v) => setExpenses(prev => ({ ...prev, others: v })))}
                  onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
                  onBlur={() => triggerSave()}
                  className="pl-12 text-sm"
                />
              </div>
            </div>
            {/* Entertainment / Travel */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Entertainment / Travel</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">RM</span>
                <Input
                  type="number"
                  value={inputEntertainment}
                  onChange={(e) => handleNumericInput(e.target.value, setInputEntertainment, (v) => setExpenses(prev => ({ ...prev, entertainment: v })))}
                  onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
                  onBlur={() => triggerSave()}
                  className="pl-12 text-sm"
                />
              </div>
            </div>
            {isCustomExpenses && (
              <div className="pt-2 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetExpenses}
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset to defaults
                </Button>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Household Type */}
        <div className="space-y-3">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Household Type</Label>
          <RadioGroup
            value={householdType}
            onValueChange={(v) => { setHouseholdType(v as HouseholdType); triggerSave({ householdType: v as HouseholdType }); }}
            className="grid gap-2"
          >
            <label
              htmlFor="ht-alone"
              className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all ${householdType === "alone" ? "border-primary bg-primary/5" : "border-border hover:border-border/80"
                }`}
            >
              <RadioGroupItem value="alone" id="ht-alone" />
              <span className="text-sm font-medium">Living alone</span>
            </label>
            <label
              htmlFor="ht-couple"
              className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all ${householdType === "couple" ? "border-primary bg-primary/5" : "border-border hover:border-border/80"
                }`}
            >
              <RadioGroupItem value="couple" id="ht-couple" />
              <span className="text-sm font-medium">Couple</span>
            </label>
            <label
              htmlFor="ht-family"
              className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all ${householdType === "family" ? "border-primary bg-primary/5" : "border-border hover:border-border/80"
                }`}
            >
              <RadioGroupItem value="family" id="ht-family" />
              <span className="text-sm font-medium">Family with dependants</span>
            </label>
          </RadioGroup>

          {householdType === "family" && (
            <div className="flex items-center justify-between bg-secondary/20 border border-border/50 rounded-xl px-4 py-3 mt-1">
              <span className="text-sm font-medium text-foreground">Number of dependants</span>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => { const d = Math.max(1, dependants - 1); setDependants(d); triggerSave({ dependants: d }); }} disabled={dependants <= 1}>
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <span className="text-lg font-bold tabular-nums w-6 text-center">{dependants}</span>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => { const d = Math.min(10, dependants + 1); setDependants(d); triggerSave({ dependants: d }); }} disabled={dependants >= 10}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Location</Label>
          <Select value={location} onValueChange={(v) => { setLocation(v as Location); triggerSave({ location: v as Location }); }}>
            <SelectTrigger className="h-12 text-sm font-medium border-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kl">KL / Klang Valley</SelectItem>
              <SelectItem value="urban">Other Urban</SelectItem>
              <SelectItem value="non-urban">Non-urban</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default IncomeRealityInputs;
