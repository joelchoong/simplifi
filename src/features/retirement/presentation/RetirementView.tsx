import React, { useState, useEffect, useMemo } from 'react';
import EPFChart from './EPFChart';
import RetirementInputs from './RetirementInputs';
import { calculateEPFProjection, EPFData } from '@/features/retirement/domain/epfCalculations';
import { Palmtree } from 'lucide-react';

interface RetirementViewProps {
    initialMonthlyIncome?: number;
    initialCurrentEPF?: number;
    initialAge?: number;
    maxSpendAmount?: number;
    onSave: (data: { monthlyIncome: number; currentEPF: number; age: number }) => void;
}

const RetirementView: React.FC<RetirementViewProps> = ({
    initialMonthlyIncome = 5000,
    initialCurrentEPF = 50000,
    initialAge = 25,
    maxSpendAmount = 0,
    onSave,
}) => {
    const [epfData, setEpfData] = useState<EPFData[]>([]);
    const [monthlyIncome, setMonthlyIncome] = useState(initialMonthlyIncome);
    const [currentEPF, setCurrentEPF] = useState(initialCurrentEPF);
    const [age, setAge] = useState(initialAge);
    const [retirementAge, setRetirementAge] = useState(60);

    // Use income reality baseline life cost as default monthly expenses
    const [monthlyExpenses, setMonthlyExpenses] = useState(maxSpendAmount);

    // Custom rates state
    const [customRates, setCustomRates] = useState<{
        employeeRate?: number;
        employerRate?: number;
        dividendRate?: number;
    }>({});

    // Sync state with props when they change (e.g., after data loads)
    useEffect(() => {
        setMonthlyIncome(initialMonthlyIncome);
        setCurrentEPF(initialCurrentEPF);
        setAge(initialAge);
    }, [initialMonthlyIncome, initialCurrentEPF, initialAge]);

    // Calculate projection whenever inputs change
    useEffect(() => {
        if (monthlyIncome > 0 && age >= 18 && age <= 60) {
            const projection = calculateEPFProjection({
                currentAge: age,
                retirementAge,
                targetAge: 90,
                monthlyIncome,
                currentEPFAmount: currentEPF,
                employeeRate: customRates.employeeRate,
                employerRate: customRates.employerRate,
                annualDividendRate: customRates.dividendRate,
                monthlyExpenses,
            });
            setEpfData(projection);
        } else {
            setEpfData([]);
        }
    }, [monthlyIncome, currentEPF, age, retirementAge, monthlyExpenses, customRates]);

    // Calculate key metrics for green highlights
    const epfAtRetirement = useMemo(() => {
        const retirementData = epfData.find(d => d.age === retirementAge);
        return retirementData?.totalAmount || 0;
    }, [epfData, retirementAge]);

    const ageToReach1M = useMemo(() => {
        const milestone = epfData.find(d => d.totalAmount >= 1_000_000);
        return milestone?.age;
    }, [epfData]);

    const handleSave = (data: {
        monthlyIncome: number;
        currentEPF: number;
        age: number;
        retirementAge?: number;
        monthlyExpenses?: number;
        employeeRate?: number;
        employerRate?: number;
        dividendRate?: number;
    }) => {
        setMonthlyIncome(data.monthlyIncome);
        setCurrentEPF(data.currentEPF);
        setAge(data.age);
        if (data.retirementAge !== undefined) setRetirementAge(data.retirementAge);
        if (data.monthlyExpenses !== undefined) setMonthlyExpenses(data.monthlyExpenses);

        // Update custom rates if provided
        if (data.employeeRate !== undefined || data.employerRate !== undefined || data.dividendRate !== undefined) {
            setCustomRates({
                employeeRate: data.employeeRate,
                employerRate: data.employerRate,
                dividendRate: data.dividendRate,
            });
        }

        onSave({ monthlyIncome: data.monthlyIncome, currentEPF: data.currentEPF, age: data.age });
    };

    return (
        <div className="max-w-6xl mx-auto space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                {/* Left: Chart & Highlights (same proportions as classification page) */}
                <div className="lg:col-span-7 xl:col-span-8">
                    <section className="bg-card border border-border rounded-2xl shadow-sm p-4">
                        <div className="mb-4">
                            <h2 className="text-xl font-bold text-foreground">Your EPF projection for retirement</h2>
                        </div>

                        {/* Relocated Summary Card */}
                        {epfAtRetirement > 0 && (
                            <div className="bg-secondary/20 border border-border/50 rounded-xl p-4 shadow-sm relative group hover:border-border transition-colors mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                                        <Palmtree className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm text-foreground leading-relaxed">
                                            You'll have projected{" "}
                                            <span className="font-bold text-emerald-600">
                                                RM {epfAtRetirement.toLocaleString('en-MY', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                            </span>
                                            {" "}in your EPF at retirement (age {retirementAge}).
                                            {ageToReach1M && ageToReach1M <= 90 && (
                                                <>
                                                    {" "}You'll reach the{" "}
                                                    <span className="font-bold text-amber-600">RM1M milestone</span>
                                                    {" "}at age <span className="font-bold">{ageToReach1M}</span>.
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="relative overflow-hidden rounded-xl bg-secondary/10 border border-border p-4 pb-0 h-[400px] flex flex-col justify-end">
                            {/* Overlay Legend */}
                            <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 p-3 rounded-lg bg-background/80 backdrop-blur-sm border border-border/40 shadow-sm text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm animate-pulse"></span>
                                    <span className="font-medium">Projected EPF Total</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-[2px] bg-amber-500 shadow-sm"></span>
                                    <span className="font-medium">RM 1M Milestone</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-[2px] bg-indigo-500 shadow-sm" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #6366f1 0, #6366f1 3px, transparent 3px, transparent 6px)' }}></span>
                                    <span className="font-medium">Retirement Age ({retirementAge})</span>
                                </div>
                            </div>
                            {epfData.length > 0 ? (
                                <EPFChart
                                    data={epfData}
                                    retirementAge={retirementAge}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-64 text-muted-foreground">
                                    <p>Enter your details to see your EPF projection</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Right: Inputs (same proportions as classification page) */}
                <div className="lg:col-span-5 xl:col-span-4">
                    <RetirementInputs
                        initialMonthlyIncome={initialMonthlyIncome}
                        initialCurrentEPF={initialCurrentEPF}
                        initialAge={initialAge}
                        maxSpendAmount={maxSpendAmount}
                        onSave={handleSave}
                    />
                </div>
            </div>
        </div>
    );
};

export default RetirementView;
