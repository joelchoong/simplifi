import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface RetirementInputsProps {
    initialMonthlyIncome?: number;
    initialCurrentEPF?: number;
    initialAge?: number;
    onSave: (data: { monthlyIncome: number; currentEPF: number; age: number }) => void;
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
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        setMonthlyIncome(initialMonthlyIncome.toString());
        setCurrentEPF(initialCurrentEPF.toString());
        setAge(initialAge.toString());
    }, [initialMonthlyIncome, initialCurrentEPF, initialAge]);

    const handleSave = () => {
        const income = parseFloat(monthlyIncome) || 0;
        const epf = parseFloat(currentEPF) || 0;
        const userAge = parseInt(age) || 25;

        onSave({
            monthlyIncome: income,
            currentEPF: epf,
            age: userAge,
        });

        setHasChanges(false);
    };

    const handleIncomeChange = (value: string) => {
        setMonthlyIncome(value);
        setHasChanges(true);
    };

    const handleEPFChange = (value: string) => {
        setCurrentEPF(value);
        setHasChanges(true);
    };

    const handleAgeChange = (value: string) => {
        setAge(value);
        setHasChanges(true);
    };

    const handleIncomeBlur = () => {
        const num = parseFloat(monthlyIncome);
        if (!isNaN(num)) {
            setMonthlyIncome(num.toFixed(2));
        }
    };

    const handleEPFBlur = () => {
        const num = parseFloat(currentEPF);
        if (!isNaN(num)) {
            setCurrentEPF(num.toFixed(2));
        }
    };

    return (
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6 space-y-6">
            <div>
                <h3 className="text-lg font-bold text-foreground mb-1">Retirement Planning</h3>
                <p className="text-sm text-muted-foreground">
                    Enter your details to see your EPF projection
                </p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="age" className="text-sm font-medium">
                        Current Age
                    </Label>
                    <Input
                        id="age"
                        type="number"
                        min="18"
                        max="60"
                        value={age}
                        onChange={(e) => handleAgeChange(e.target.value)}
                        placeholder="25"
                        className="text-base"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="monthly-income" className="text-sm font-medium">
                        Gross Monthly Income (RM)
                    </Label>
                    <Input
                        id="monthly-income"
                        type="number"
                        min="0"
                        step="0.01"
                        value={monthlyIncome}
                        onChange={(e) => handleIncomeChange(e.target.value)}
                        onBlur={handleIncomeBlur}
                        placeholder="5000.00"
                        className="text-base"
                    />
                    <p className="text-xs text-muted-foreground">
                        Your monthly salary before deductions
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="current-epf" className="text-sm font-medium">
                        Current EPF Balance (RM)
                    </Label>
                    <Input
                        id="current-epf"
                        type="number"
                        min="0"
                        step="0.01"
                        value={currentEPF}
                        onChange={(e) => handleEPFChange(e.target.value)}
                        onBlur={handleEPFBlur}
                        placeholder="50000.00"
                        className="text-base"
                    />
                    <p className="text-xs text-muted-foreground">
                        Your total EPF savings (Account 1 + Account 2)
                    </p>
                </div>

                <Button
                    onClick={handleSave}
                    disabled={!hasChanges}
                    className="w-full"
                    size="lg"
                >
                    <Save className="w-4 h-4 mr-2" />
                    Update Projection
                </Button>
            </div>

            <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-semibold text-foreground mb-2">EPF Contribution Rates</h4>
                <div className="space-y-1 text-xs text-muted-foreground">
                    <p>• Employee: 11% of monthly salary</p>
                    <p>• Employer: 12-13% (based on salary)</p>
                    <p>• Assumed dividend: 5.5% per year</p>
                </div>
            </div>
        </div>
    );
};

export default RetirementInputs;
