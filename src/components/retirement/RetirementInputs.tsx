import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Palmtree, ChevronDown, ChevronUp } from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface RetirementInputsProps {
    initialMonthlyIncome?: number;
    initialCurrentEPF?: number;
    initialAge?: number;
    onSave: (data: {
        monthlyIncome: number;
        currentEPF: number;
        age: number;
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
    const [isRatesOpen, setIsRatesOpen] = useState(false);

    // Custom rates state
    const [employeeRate, setEmployeeRate] = useState('11');
    const [employerRate, setEmployerRate] = useState('');
    const [dividendRate, setDividendRate] = useState('5.5');

    // Track initial values to detect actual changes
    const initialValuesRef = useRef({
        monthlyIncome: initialMonthlyIncome,
        currentEPF: initialCurrentEPF,
        age: initialAge
    });

    useEffect(() => {
        setMonthlyIncome(initialMonthlyIncome.toString());
        setCurrentEPF(initialCurrentEPF.toString());
        setAge(initialAge.toString());
        initialValuesRef.current = { monthlyIncome: initialMonthlyIncome, currentEPF: initialCurrentEPF, age: initialAge };

        // Set default employer rate based on income
        const defaultEmployerRate = initialMonthlyIncome <= 5000 ? '12' : '13';
        setEmployerRate(defaultEmployerRate);
    }, [initialMonthlyIncome, initialCurrentEPF, initialAge]);

    const saveIfChanged = (
        income: number,
        epf: number,
        userAge: number,
        empRate?: number,
        emplRate?: number,
        divRate?: number
    ) => {
        const initial = initialValuesRef.current;
        if (income !== initial.monthlyIncome || epf !== initial.currentEPF || userAge !== initial.age) {
            onSave({
                monthlyIncome: income,
                currentEPF: epf,
                age: userAge,
                employeeRate: empRate,
                employerRate: emplRate,
                dividendRate: divRate,
            });
            initialValuesRef.current = { monthlyIncome: income, currentEPF: epf, age: userAge };
        }
    };

    const getCurrentRates = () => ({
        employeeRate: parseFloat(employeeRate) / 100 || 0.11,
        employerRate: parseFloat(employerRate) / 100 || (parseFloat(monthlyIncome) <= 5000 ? 0.12 : 0.13),
        dividendRate: parseFloat(dividendRate) / 100 || 0.055,
    });

    const handleIncomeBlur = () => {
        const num = parseFloat(monthlyIncome) || 0;
        const formatted = num.toFixed(2);
        setMonthlyIncome(formatted);

        // Auto-update employer rate based on income
        const defaultEmployerRate = num <= 5000 ? '12' : '13';
        if (!employerRate || employerRate === '12' || employerRate === '13') {
            setEmployerRate(defaultEmployerRate);
        }

        const rates = getCurrentRates();
        saveIfChanged(num, parseFloat(currentEPF) || 0, parseInt(age) || 25, rates.employeeRate, rates.employerRate, rates.dividendRate);
    };

    const handleEPFBlur = () => {
        const num = parseFloat(currentEPF) || 0;
        const formatted = num.toFixed(2);
        setCurrentEPF(formatted);
        const rates = getCurrentRates();
        saveIfChanged(parseFloat(monthlyIncome) || 0, num, parseInt(age) || 25, rates.employeeRate, rates.employerRate, rates.dividendRate);
    };

    const handleAgeBlur = () => {
        const userAge = parseInt(age) || 25;
        setAge(userAge.toString());
        const rates = getCurrentRates();
        saveIfChanged(parseFloat(monthlyIncome) || 0, parseFloat(currentEPF) || 0, userAge, rates.employeeRate, rates.employerRate, rates.dividendRate);
    };

    const handleRateChange = () => {
        const rates = getCurrentRates();
        saveIfChanged(
            parseFloat(monthlyIncome) || 0,
            parseFloat(currentEPF) || 0,
            parseInt(age) || 25,
            rates.employeeRate,
            rates.employerRate,
            rates.dividendRate
        );
    };

    const monthlyContribution = () => {
        const income = parseFloat(monthlyIncome) || 0;
        const empRate = parseFloat(employeeRate) / 100 || 0.11;
        const emplRate = parseFloat(employerRate) / 100 || (income <= 5000 ? 0.12 : 0.13);
        return income * (empRate + emplRate);
    };

    return (
        <Card className="w-full shadow-md border-border/60">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                    <Palmtree className="h-5 w-5 text-primary" />
                    Retirement Planning
                </CardTitle>
                <CardDescription className="text-xs">
                    Auto-calculates your EPF growth until retirement.
                </CardDescription>
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
                        onKeyDown={(e) => e.key === 'Enter' && handleAgeBlur()}
                        placeholder="25"
                        className="text-base"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="monthly-income" className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                        Gross Monthly Income
                    </Label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                            RM
                        </span>
                        <Input
                            id="monthly-income"
                            type="number"
                            min="0"
                            step="0.01"
                            value={monthlyIncome}
                            onChange={(e) => setMonthlyIncome(e.target.value)}
                            onBlur={handleIncomeBlur}
                            onKeyDown={(e) => e.key === 'Enter' && handleIncomeBlur()}
                            placeholder="5000.00"
                            className="text-base pl-12"
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Your monthly salary before deductions
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="current-epf" className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                        Current EPF Balance
                    </Label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                            RM
                        </span>
                        <Input
                            id="current-epf"
                            type="number"
                            min="0"
                            step="0.01"
                            value={currentEPF}
                            onChange={(e) => setCurrentEPF(e.target.value)}
                            onBlur={handleEPFBlur}
                            onKeyDown={(e) => e.key === 'Enter' && handleEPFBlur()}
                            placeholder="50000.00"
                            className="text-base pl-12"
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Your total EPF savings (Account 1 + Account 2)
                    </p>
                </div>
            </div>

            {/* Editable EPF Rates Dropdown */}
            <Collapsible open={isRatesOpen} onOpenChange={setIsRatesOpen} className="border border-border rounded-xl">
                <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors rounded-xl">
                    <div className="text-left">
                        <h4 className="text-sm font-semibold text-foreground">EPF Contribution Rates</h4>
                        <p className="text-xs text-muted-foreground">
                            Monthly contribution: RM {monthlyContribution().toFixed(2)}
                        </p>
                    </div>
                    {isRatesOpen ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4 space-y-3">
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
                            onKeyDown={(e) => e.key === 'Enter' && handleRateChange()}
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
                            onKeyDown={(e) => e.key === 'Enter' && handleRateChange()}
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
                            onKeyDown={(e) => e.key === 'Enter' && handleRateChange()}
                            className="text-sm"
                        />
                    </div>
                    <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                        Default: Employee 11%, Employer 12-13% (based on salary), Dividend 5.5%
                    </p>
                </CollapsibleContent>
            </Collapsible>
            </CardContent>
        </Card>
    );
};

export default RetirementInputs;
