import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Palmtree, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface RetirementInputsProps {
  initialMonthlyIncome?: number;
  initialCurrentEPF?: number;
  initialAge?: number;
  onSave: (data: {
    monthlyIncome: number;
    currentEPF: number;
    age: number;
    retirementAge?: number;
    monthlyExpenses?: number;
    employeeRate?: number;
    employerRate?: number;
    dividendRate?: number;
  }) => void;
}

const RetirementInputs: React.FC<RetirementInputsProps> = ({
  initialMonthlyIncome = 0,
  initialCurrentEPF = 0,
  initialAge = 25,
  onSave,
}) => {
  const [monthlyIncome, setMonthlyIncome] = useState(initialMonthlyIncome.toString());
  const [currentEPF, setCurrentEPF] = useState(initialCurrentEPF.toString());
  const [age, setAge] = useState(initialAge.toString());
  const [retirementAge, setRetirementAge] = useState("60");
  const [monthlyExpenses, setMonthlyExpenses] = useState("");
  const [isExpensesCustom, setIsExpensesCustom] = useState(false);
  const [isRatesOpen, setIsRatesOpen] = useState(false);

  // Custom rates state
  const [employeeRate, setEmployeeRate] = useState("11");
  const [employerRate, setEmployerRate] = useState("");
  const [dividendRate, setDividendRate] = useState("5.5");

  // Track initial values to detect actual changes
  const initialValuesRef = useRef({
    monthlyIncome: initialMonthlyIncome,
    currentEPF: initialCurrentEPF,
    age: initialAge,
  });

  useEffect(() => {
    setMonthlyIncome(initialMonthlyIncome.toString());
    setCurrentEPF(initialCurrentEPF.toString());
    setAge(initialAge.toString());
    initialValuesRef.current = { monthlyIncome: initialMonthlyIncome, currentEPF: initialCurrentEPF, age: initialAge };

    // Set default employer rate based on income
    const defaultEmployerRate = initialMonthlyIncome <= 5000 ? "13" : "12";
    setEmployerRate(defaultEmployerRate);

    // Set default expenses (70% of income) if not custom
    if (!isExpensesCustom) {
      setMonthlyExpenses(Math.round(initialMonthlyIncome * 0.7).toString());
    }
  }, [initialMonthlyIncome, initialCurrentEPF, initialAge]);

  const triggerSave = (
    income: number,
    epf: number,
    userAge: number,
    empRate?: number,
    emplRate?: number,
    divRate?: number,
    retAge?: number,
    expenses?: number,
  ) => {
    onSave({
      monthlyIncome: income,
      currentEPF: epf,
      age: userAge,
      retirementAge: retAge !== undefined ? retAge : (parseInt(retirementAge) || 60),
      monthlyExpenses: expenses !== undefined ? expenses : (parseFloat(monthlyExpenses) || Math.round(income * 0.7)),
      employeeRate: empRate,
      employerRate: emplRate,
      dividendRate: divRate,
    });
    initialValuesRef.current = { monthlyIncome: income, currentEPF: epf, age: userAge };
  };

  const getCurrentRates = () => ({
    employeeRate: parseFloat(employeeRate) / 100 || 0.11,
    employerRate: parseFloat(employerRate) / 100 || (parseFloat(monthlyIncome) <= 5000 ? 0.13 : 0.12),
    dividendRate: parseFloat(dividendRate) / 100 || 0.055,
  });

  const handleIncomeBlur = () => {
    const num = parseFloat(monthlyIncome) || 0;
    const formatted = Math.round(num).toString();
    setMonthlyIncome(formatted);

    // Auto-update employer rate based on income
    const defaultEmployerRate = num <= 5000 ? "13" : "12";
    if (!employerRate || employerRate === "12" || employerRate === "13") {
      setEmployerRate(defaultEmployerRate);
    }

    // Auto-update expenses if not custom
    if (!isExpensesCustom) {
      setMonthlyExpenses(Math.round(num * 0.7).toString());
    }

    const rates = getCurrentRates();
    triggerSave(num, parseFloat(currentEPF) || 0, parseInt(age) || 25, rates.employeeRate, rates.employerRate, rates.dividendRate);
  };

  const handleEPFBlur = () => {
    const num = parseFloat(currentEPF) || 0;
    setCurrentEPF(Math.round(num).toString());
    const rates = getCurrentRates();
    triggerSave(parseFloat(monthlyIncome) || 0, num, parseInt(age) || 25, rates.employeeRate, rates.employerRate, rates.dividendRate);
  };

  const handleAgeBlur = () => {
    const userAge = parseInt(age) || 25;
    setAge(userAge.toString());
    const rates = getCurrentRates();
    triggerSave(parseFloat(monthlyIncome) || 0, parseFloat(currentEPF) || 0, userAge, rates.employeeRate, rates.employerRate, rates.dividendRate);
  };

  const handleRetirementAgeBlur = () => {
    const retAge = parseInt(retirementAge) || 60;
    setRetirementAge(retAge.toString());
    const rates = getCurrentRates();
    triggerSave(parseFloat(monthlyIncome) || 0, parseFloat(currentEPF) || 0, parseInt(age) || 25, rates.employeeRate, rates.employerRate, rates.dividendRate, retAge);
  };

  const handleExpensesBlur = () => {
    const num = parseFloat(monthlyExpenses) || 0;
    setMonthlyExpenses(Math.round(num).toString());
    setIsExpensesCustom(true);
    const rates = getCurrentRates();
    triggerSave(parseFloat(monthlyIncome) || 0, parseFloat(currentEPF) || 0, parseInt(age) || 25, rates.employeeRate, rates.employerRate, rates.dividendRate, undefined, num);
  };

  const handleResetExpenses = () => {
    const defaultExpenses = Math.round((parseFloat(monthlyIncome) || 0) * 0.7);
    setMonthlyExpenses(defaultExpenses.toString());
    setIsExpensesCustom(false);
    const rates = getCurrentRates();
    triggerSave(parseFloat(monthlyIncome) || 0, parseFloat(currentEPF) || 0, parseInt(age) || 25, rates.employeeRate, rates.employerRate, rates.dividendRate, undefined, defaultExpenses);
  };

  const handleRateChange = () => {
    const rates = getCurrentRates();
    triggerSave(parseFloat(monthlyIncome) || 0, parseFloat(currentEPF) || 0, parseInt(age) || 25, rates.employeeRate, rates.employerRate, rates.dividendRate);
  };

  const monthlyContribution = () => {
    const income = parseFloat(monthlyIncome) || 0;
    const empRate = parseFloat(employeeRate) / 100 || 0.11;
    const emplRate = parseFloat(employerRate) / 100 || (income <= 5000 ? 0.13 : 0.12);
    return income * (empRate + emplRate);
  };

  return (
    <Card className="w-full shadow-md border-border/60">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Palmtree className="h-5 w-5 text-primary" />
          Retirement Planning
        </CardTitle>
        <CardDescription className="text-xs">Auto-calculates your EPF growth until retirement.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="age" className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
              Current Age
            </Label>
            <Input
              id="age"
              type="number"
              min="18"
              max="60"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              onBlur={handleAgeBlur}
              onKeyDown={(e) => e.key === "Enter" && handleAgeBlur()}
              placeholder="25"
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="monthly-income"
              className="text-xs font-semibold text-muted-foreground tracking-wide uppercase"
            >
              Gross Monthly Income
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">RM</span>
              <Input
                id="monthly-income"
                type="number"
                min="0"
                step="0.01"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                onBlur={handleIncomeBlur}
                onKeyDown={(e) => e.key === "Enter" && handleIncomeBlur()}
                placeholder="5000.00"
                className="text-base pl-12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="current-epf"
              className="text-xs font-semibold text-muted-foreground tracking-wide uppercase"
            >
              Current EPF Balance
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">RM</span>
              <Input
                id="current-epf"
                type="number"
                min="0"
                step="0.01"
                value={currentEPF}
                onChange={(e) => setCurrentEPF(e.target.value)}
                onBlur={handleEPFBlur}
                onKeyDown={(e) => e.key === "Enter" && handleEPFBlur()}
                placeholder="50000.00"
                className="text-base pl-12"
              />
            </div>
            <p className="text-xs text-muted-foreground">Your total EPF savings (Account 1, 2 & 3)</p>
          </div>
        </div>

        {/* Retirement Assumptions Dropdown */}
        <Collapsible open={isRatesOpen} onOpenChange={setIsRatesOpen} className="border border-border rounded-xl">
          <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors rounded-xl">
            <div className="text-left">
              <h4 className="text-sm font-semibold text-foreground">Retirement Assumptions</h4>
              <p className="text-xs text-muted-foreground">
                Retire at {retirementAge} · RM {Math.round(monthlyContribution()).toLocaleString()}/mo contribution
              </p>
            </div>
            {isRatesOpen ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="retirement-age" className="text-xs font-medium">
                Retirement Age
              </Label>
              <Input
                id="retirement-age"
                type="number"
                min={parseInt(age) || 18}
                max="80"
                value={retirementAge}
                onChange={(e) => setRetirementAge(e.target.value)}
                onBlur={handleRetirementAgeBlur}
                onKeyDown={(e) => e.key === "Enter" && handleRetirementAgeBlur()}
                placeholder="60"
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="monthly-expenses" className="text-xs font-medium">
                  Post-Retirement Monthly Expenses
                </Label>
                {isExpensesCustom && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetExpenses}
                    className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset to 70%
                  </Button>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">RM</span>
                <Input
                  id="monthly-expenses"
                  type="number"
                  min="0"
                  step="100"
                  value={monthlyExpenses}
                  onChange={(e) => { setMonthlyExpenses(e.target.value); setIsExpensesCustom(true); }}
                  onBlur={handleExpensesBlur}
                  onKeyDown={(e) => e.key === "Enter" && handleExpensesBlur()}
                  placeholder="3500"
                  className="text-sm pl-12"
                />
              </div>
              <p className="text-xs text-muted-foreground">Default: 70% of income (RM {Math.round((parseFloat(monthlyIncome) || 0) * 0.7).toLocaleString()}/mo)</p>
            </div>

            <div className="pt-2 border-t border-border space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">EPF Contribution Rates</p>
              <div className="space-y-2">
                <Label htmlFor="employee-rate" className="text-xs font-medium">
                  Employee Contribution (%)
                </Label>
                <Input
                  id="employee-rate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={employeeRate}
                  onChange={(e) => setEmployeeRate(e.target.value)}
                  onBlur={handleRateChange}
                  onKeyDown={(e) => e.key === "Enter" && handleRateChange()}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employer-rate" className="text-xs font-medium">
                  Employer Contribution (%)
                </Label>
                <Input
                  id="employer-rate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={employerRate}
                  onChange={(e) => setEmployerRate(e.target.value)}
                  onBlur={handleRateChange}
                  onKeyDown={(e) => e.key === "Enter" && handleRateChange()}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dividend-rate" className="text-xs font-medium">
                  Annual Dividend Rate (%)
                </Label>
                <Input
                  id="dividend-rate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={dividendRate}
                  onChange={(e) => setDividendRate(e.target.value)}
                  onBlur={handleRateChange}
                  onKeyDown={(e) => e.key === "Enter" && handleRateChange()}
                  className="text-sm"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Default: Employee 11%, Employer 13-12% (based on salary), Dividend 5.5%
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default RetirementInputs;
