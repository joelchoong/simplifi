import React, { useState, useEffect } from 'react';
import EPFChart from './EPFChart';
import RetirementInputs from './RetirementInputs';
import { calculateEPFProjection, EPFData } from '@/lib/epfCalculations';

interface RetirementViewProps {
    initialMonthlyIncome?: number;
    initialCurrentEPF?: number;
    initialAge?: number;
    onSave: (data: { monthlyIncome: number; currentEPF: number; age: number }) => void;
}

const RetirementView: React.FC<RetirementViewProps> = ({
    initialMonthlyIncome = 5000,
    initialCurrentEPF = 50000,
    initialAge = 25,
    onSave,
}) => {
    const [epfData, setEpfData] = useState<EPFData[]>([]);
    const [monthlyIncome, setMonthlyIncome] = useState(initialMonthlyIncome);
    const [currentEPF, setCurrentEPF] = useState(initialCurrentEPF);
    const [age, setAge] = useState(initialAge);

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
                retirementAge: 60,
                monthlyIncome,
                currentEPFAmount: currentEPF,
            });
            setEpfData(projection);
        } else {
            setEpfData([]);
        }
    }, [monthlyIncome, currentEPF, age]);

    const handleSave = (data: { monthlyIncome: number; currentEPF: number; age: number }) => {
        setMonthlyIncome(data.monthlyIncome);
        setCurrentEPF(data.currentEPF);
        setAge(data.age);
        onSave(data);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                {/* Left: Chart (same proportions as classification page) */}
                <div className="lg:col-span-7 xl:col-span-8">
                    <div className="bg-card border border-border rounded-2xl shadow-sm p-4">
                        <h2 className="text-lg font-bold text-foreground mb-4">EPF Projection</h2>
                        {epfData.length > 0 ? (
                            <EPFChart data={epfData} />
                        ) : (
                            <div className="flex items-center justify-center h-64 text-muted-foreground">
                                <p>Enter your details to see your EPF projection</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Inputs (same proportions as classification page) */}
                <div className="lg:col-span-5 xl:col-span-4">
                    <RetirementInputs
                        initialMonthlyIncome={initialMonthlyIncome}
                        initialCurrentEPF={initialCurrentEPF}
                        initialAge={initialAge}
                        onSave={handleSave}
                    />
                </div>
            </div>
        </div>
    );
};

export default RetirementView;
