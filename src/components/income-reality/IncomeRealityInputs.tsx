import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Scale, Minus, Plus, RotateCcw, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { HouseholdType, Location, ExpenseAssumptions, DEFAULT_EXPENSES } from "@/lib/incomeRealityCalculations";

interface IncomeRealityInputsProps {
  initialMonthlyIncome?: number;
  onChanged: (data: {
    monthlyIncome: number;
    housingCost: number;
    householdType: HouseholdType;
    dependants: number;
    location: Location;
    expenses: ExpenseAssumptions;
  }) => void;
}

const IncomeRealityInputs: React.FC<IncomeRealityInputsProps> = ({ initialMonthlyIncome = 0, onChanged }) => {
  const [monthlyIncome, setMonthlyIncome] = useState(initialMonthlyIncome);
  const [inputIncome, setInputIncome] = useState(initialMonthlyIncome > 0 ? initialMonthlyIncome.toString() : "");
  const [housingCost, setHousingCost] = useState(0);
  const [inputHousing, setInputHousing] = useState("");
  const [householdType, setHouseholdType] = useState<HouseholdType>("alone");
  const [dependants, setDependants] = useState(1);
  const [location, setLocation] = useState<Location>("kl");

  const [expenses, setExpenses] = useState<ExpenseAssumptions>({ ...DEFAULT_EXPENSES });
  const [inputFood, setInputFood] = useState(DEFAULT_EXPENSES.food.toString());
  const [inputTransport, setInputTransport] = useState(DEFAULT_EXPENSES.transport.toString());
  const [inputUtilities, setInputUtilities] = useState(DEFAULT_EXPENSES.utilities.toString());
  const [expensesOpen, setExpensesOpen] = useState(false);

  const isCustomExpenses =
    expenses.food !== DEFAULT_EXPENSES.food ||
    expenses.transport !== DEFAULT_EXPENSES.transport ||
    expenses.utilities !== DEFAULT_EXPENSES.utilities;

  const resetExpenses = () => {
    setExpenses({ ...DEFAULT_EXPENSES });
    setInputFood(DEFAULT_EXPENSES.food.toString());
    setInputTransport(DEFAULT_EXPENSES.transport.toString());
    setInputUtilities(DEFAULT_EXPENSES.utilities.toString());
  };

  useEffect(() => {
    setMonthlyIncome(initialMonthlyIncome);
    setInputIncome(initialMonthlyIncome > 0 ? initialMonthlyIncome.toString() : "");
  }, [initialMonthlyIncome]);

  useEffect(() => {
    onChanged({ monthlyIncome, housingCost, householdType, dependants, location, expenses });
  }, [monthlyIncome, housingCost, householdType, dependants, location, expenses]);

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
        {/* Monthly Income */}
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
              className="pl-10 text-lg font-bold h-12 border-2 focus-visible:ring-primary/20"
            />
          </div>
        </div>

        {/* Housing / Rental Cost */}
        <div className="space-y-2">
          <Label htmlFor="housingCost" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Housing / Rental Cost
          </Label>
          <div className="relative group">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm group-focus-within:text-primary transition-colors">RM</span>
            <Input
              id="housingCost"
              type="number"
              placeholder="Enter your monthly rent or mortgage"
              value={inputHousing}
              onChange={(e) => handleNumericInput(e.target.value, setInputHousing, setHousingCost)}
              onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
              className="pl-10 text-lg font-bold h-12 border-2 focus-visible:ring-primary/20"
            />
          </div>
        </div>

        {/* Expense Assumptions - Collapsible */}
        <Collapsible open={expensesOpen} onOpenChange={setExpensesOpen}>
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expensesOpen ? "rotate-180" : ""}`} />
                Expense Assumptions
                {isCustomExpenses && (
                  <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full normal-case tracking-normal">
                    Edited
                  </span>
                )}
              </button>
            </CollapsibleTrigger>
            {isCustomExpenses && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                onClick={resetExpenses}
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </Button>
            )}
          </div>
          <CollapsibleContent className="mt-3 space-y-3">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Average monthly costs for a single adult in KL. Adjust to match your situation.
            </p>
            {/* Food */}
            <div className="flex items-center gap-3">
              <Label className="text-xs font-medium text-muted-foreground w-20 shrink-0">Food</Label>
              <div className="relative group flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold group-focus-within:text-primary transition-colors">RM</span>
                <Input
                  type="number"
                  value={inputFood}
                  onChange={(e) => handleNumericInput(e.target.value, setInputFood, (v) => setExpenses(prev => ({ ...prev, food: v })))}
                  onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
                  className="pl-10 h-9 text-sm font-bold border-2 focus-visible:ring-primary/20"
                />
              </div>
            </div>
            {/* Transport */}
            <div className="flex items-center gap-3">
              <Label className="text-xs font-medium text-muted-foreground w-20 shrink-0">Transport</Label>
              <div className="relative group flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold group-focus-within:text-primary transition-colors">RM</span>
                <Input
                  type="number"
                  value={inputTransport}
                  onChange={(e) => handleNumericInput(e.target.value, setInputTransport, (v) => setExpenses(prev => ({ ...prev, transport: v })))}
                  onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
                  className="pl-10 h-9 text-sm font-bold border-2 focus-visible:ring-primary/20"
                />
              </div>
            </div>
            {/* Utilities */}
            <div className="flex items-center gap-3">
              <Label className="text-xs font-medium text-muted-foreground w-20 shrink-0">Utilities</Label>
              <div className="relative group flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold group-focus-within:text-primary transition-colors">RM</span>
                <Input
                  type="number"
                  value={inputUtilities}
                  onChange={(e) => handleNumericInput(e.target.value, setInputUtilities, (v) => setExpenses(prev => ({ ...prev, utilities: v })))}
                  onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
                  className="pl-10 h-9 text-sm font-bold border-2 focus-visible:ring-primary/20"
                />
              </div>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-border/50">
              <span className="text-xs font-medium text-muted-foreground">Base total</span>
              <span className="text-sm font-bold text-foreground">
                RM {(expenses.food + expenses.transport + expenses.utilities).toLocaleString("en-MY")}
              </span>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Household Type */}
        <div className="space-y-3">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Household Type</Label>
          <RadioGroup
            value={householdType}
            onValueChange={(v) => setHouseholdType(v as HouseholdType)}
            className="grid gap-2"
          >
            <label
              htmlFor="ht-alone"
              className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all ${
                householdType === "alone" ? "border-primary bg-primary/5" : "border-border hover:border-border/80"
              }`}
            >
              <RadioGroupItem value="alone" id="ht-alone" />
              <span className="text-sm font-medium">Living alone</span>
            </label>
            <label
              htmlFor="ht-couple"
              className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all ${
                householdType === "couple" ? "border-primary bg-primary/5" : "border-border hover:border-border/80"
              }`}
            >
              <RadioGroupItem value="couple" id="ht-couple" />
              <span className="text-sm font-medium">Couple</span>
            </label>
            <label
              htmlFor="ht-family"
              className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all ${
                householdType === "family" ? "border-primary bg-primary/5" : "border-border hover:border-border/80"
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
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setDependants(Math.max(1, dependants - 1))} disabled={dependants <= 1}>
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <span className="text-lg font-bold tabular-nums w-6 text-center">{dependants}</span>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setDependants(Math.min(10, dependants + 1))} disabled={dependants >= 10}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Location</Label>
          <Select value={location} onValueChange={(v) => setLocation(v as Location)}>
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
