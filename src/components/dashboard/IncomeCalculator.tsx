import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface IncomeCalculatorProps {
    initialGross?: number;
    onSave: (grossIncome: number) => void;
    saving?: boolean;
}

export function IncomeCalculator({ initialGross = 0, onSave, saving = false }: IncomeCalculatorProps) {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [gross, setGross] = useState<number>(initialGross);
    const [inputGross, setInputGross] = useState<string>(initialGross.toString());

    // Deductions State
    const [deductions, setDeductions] = useState({
        epfRate: 11,
        socsoRate: 0.5,
        eisRate: 0.2,
        pcbAuto: 0,
        pcbOnAR: 0,
        cp38: 0,
        age: 30, // Default age
    });

    // Overrides State
    const [overrides, setOverrides] = useState({
        enable: false,
        epf: null as number | null,
        socso: null as number | null,
        eis: null as number | null,
        pcb: null as number | null,
        cp38: null as number | null,
    });

    // Calculations
    const WAGE_CEILING = 6000;

    const computedEPF = useMemo(() => (gross * deductions.epfRate) / 100, [gross, deductions.epfRate]);

    const computedSOCSO = useMemo(() => {
        const socsoBase = Math.min(gross, WAGE_CEILING);
        return deductions.age >= 60 ? 0 : socsoBase * (deductions.socsoRate / 100);
    }, [gross, deductions.age, deductions.socsoRate]);

    const computedEIS = useMemo(() => {
        const eisBase = Math.min(gross, WAGE_CEILING);
        return deductions.age >= 60 ? 0 : eisBase * (deductions.eisRate / 100);
    }, [gross, deductions.age, deductions.eisRate]);

    // PCB Calculation Logic (Simplified for Single Individual)
    const calculatePCB = (monthlyGross: number, monthlyEPF: number) => {
        // Annualize income
        const annualGross = monthlyGross * 12;

        // Standard Reliefs (2024)
        const RELIEF_INDIVIDUAL = 9000;
        const RELIEF_EPF = Math.min(monthlyEPF * 12, 4000); // Max 4000 for EPF

        // Taxable Income
        const chargeableIncome = Math.max(0, annualGross - RELIEF_INDIVIDUAL - RELIEF_EPF);

        // Tax Brackets 2024
        const taxBrackets = [
            { threshold: 5000, rate: 0, cumulative: 0 },
            { threshold: 20000, rate: 0.01, cumulative: 0 },       // 5,001 - 20,000
            { threshold: 35000, rate: 0.03, cumulative: 150 },     // 20,001 - 35,000
            { threshold: 50000, rate: 0.06, cumulative: 600 },     // 35,001 - 50,000
            { threshold: 70000, rate: 0.11, cumulative: 1500 },    // 50,001 - 70,000
            { threshold: 100000, rate: 0.19, cumulative: 3700 },   // 70,001 - 100,000
            { threshold: 400000, rate: 0.25, cumulative: 9400 },   // 100,001 - 400,000
            { threshold: 600000, rate: 0.26, cumulative: 84400 },  // 400,001 - 600,000
            { threshold: 2000000, rate: 0.28, cumulative: 136400 },// 600,001 - 2,000,000
            { threshold: Infinity, rate: 0.30, cumulative: 528400 }// > 2,000,000
        ];

        let annualTax = 0;

        // Find applicable bracket
        for (let i = taxBrackets.length - 1; i >= 0; i--) {
            if (chargeableIncome > taxBrackets[i].threshold) {
                // Not lowest bracket logic; standard progressive calculation
                // Actually simpler to iterate up
                break;
            }
        }

        // Re-implementing simplified loop
        let remainingIncome = chargeableIncome;
        let totalTax = 0;
        let previousThreshold = 0;

        // Correct logic:
        // iterate through brackets. 
        // 0-5000: 0%
        // 5001-20000: 1%

        // Let's use the cumulative table lookup method for simplicity and accuracy matching LHDN table logic
        // But for code, iterating ranges is clearer.

        if (chargeableIncome <= 5000) return 0;

        // Bracket approach
        if (chargeableIncome <= 20000) totalTax = (chargeableIncome - 5000) * 0.01;
        else if (chargeableIncome <= 35000) totalTax = 150 + (chargeableIncome - 20000) * 0.03;
        else if (chargeableIncome <= 50000) totalTax = 600 + (chargeableIncome - 35000) * 0.06;
        else if (chargeableIncome <= 70000) totalTax = 1500 + (chargeableIncome - 50000) * 0.11;
        else if (chargeableIncome <= 100000) totalTax = 3700 + (chargeableIncome - 70000) * 0.19;
        else if (chargeableIncome <= 400000) totalTax = 9400 + (chargeableIncome - 100000) * 0.25;
        else if (chargeableIncome <= 600000) totalTax = 84400 + (chargeableIncome - 400000) * 0.26;
        else if (chargeableIncome <= 2000000) totalTax = 136400 + (chargeableIncome - 600000) * 0.28;
        else totalTax = 528400 + (chargeableIncome - 2000000) * 0.30;

        return Math.max(0, totalTax / 12);
    };

    const computedPCB_MTD = useMemo(() => {
        return calculatePCB(gross, computedEPF) + deductions.pcbOnAR;
    }, [gross, computedEPF, deductions.pcbOnAR]);

    const computedCP38 = useMemo(() => Number(deductions.cp38 || 0), [deductions.cp38]);

    // Applied values
    const epfUsed = overrides.enable && overrides.epf !== null ? overrides.epf : computedEPF;
    const socsoUsed = overrides.enable && overrides.socso !== null ? overrides.socso : computedSOCSO;
    const eisUsed = overrides.enable && overrides.eis !== null ? overrides.eis : computedEIS;
    const pcbUsed = overrides.enable && overrides.pcb !== null ? overrides.pcb : computedPCB_MTD;
    const cp38Used = overrides.enable && overrides.cp38 !== null ? overrides.cp38 : computedCP38;

    const totalDeductions = epfUsed + socsoUsed + eisUsed + pcbUsed + cp38Used;
    const nettPay = Math.max(0, gross - totalDeductions);

    useEffect(() => {
        const val = parseFloat(inputGross);
        if (!isNaN(val)) setGross(val);
    }, [inputGross]);

    const handleUpdate = () => {
        if (isNaN(gross) || gross < 0) {
            toast({
                title: "Invalid income",
                description: "Please enter a valid gross income",
                variant: "destructive",
            });
            return;
        }
        onSave(gross);
    };

    const formatRM = (val: number) => `RM ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return (
        <Card className="w-full shadow-md border-border/60">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                    <Calculator className="h-5 w-5 text-primary" />
                    Nett Pay Calculator
                </CardTitle>
                <CardDescription className="text-xs">
                    Auto-calculates your take-home pay after deductions.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="grossIncome" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Gross Monthly Income
                        </Label>
                        <div className="relative group">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm group-focus-within:text-primary transition-colors">RM</span>
                            <Input
                                id="grossIncome"
                                type="number"
                                value={inputGross}
                                onChange={(e) => setInputGross(e.target.value)}
                                onBlur={handleUpdate}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.currentTarget.blur();
                                    }
                                }}
                                className="pl-10 text-lg font-bold h-12 border-2 focus-visible:ring-primary/20"
                            />
                        </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex flex-col items-center justify-center gap-1 shadow-sm">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Estimated Nett Pay</span>
                        <span className="text-3xl font-black text-primary tracking-tight tabular-nums">{formatRM(nettPay)}</span>
                    </div>
                </div>

                <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border border-border rounded-xl overflow-hidden bg-white/50">
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full flex justify-between items-center p-4 hover:bg-secondary/30 rounded-none h-auto">
                            <div className="flex flex-col items-start gap-0.5">
                                <span className="font-bold text-sm">Deductions Breakdown</span>
                                <span className="text-[10px] font-medium text-muted-foreground">
                                    Total deductions: {formatRM(totalDeductions)}
                                </span>
                            </div>
                            {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-4 pt-0 space-y-4">
                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <div className="flex flex-col">
                                <Label htmlFor="overrides" className="text-xs font-bold">Manual Overrides</Label>
                                <span className="text-[10px] text-muted-foreground">Edit specific values manually</span>
                            </div>
                            <Switch
                                id="overrides"
                                checked={overrides.enable}
                                onCheckedChange={(checked) => {
                                    setOverrides({ ...overrides, enable: checked });
                                    if (!checked) handleUpdate();
                                }}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {[
                                { id: 'epf', label: 'EPF', value: overrides.epf, computed: computedEPF, rate: `${deductions.epfRate}%` },
                                { id: 'socso', label: 'SOCSO', value: overrides.socso, computed: computedSOCSO },
                                { id: 'eis', label: 'EIS', value: overrides.eis, computed: computedEIS },
                                { id: 'pcb', label: 'PCB', value: overrides.pcb, computed: computedPCB_MTD },
                                { id: 'cp38', label: 'CP38', value: overrides.cp38, computed: computedCP38 },
                            ].map((item) => (
                                <div key={item.id} className="space-y-1.5">
                                    <div className="flex justify-between items-center px-0.5">
                                        <Label className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">{item.label}</Label>
                                        {!overrides.enable && item.rate && <span className="text-[9px] font-bold text-primary/70 bg-primary/5 px-1.5 rounded">{item.rate}</span>}
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">RM</span>
                                        <Input
                                            type="number"
                                            value={overrides.enable ? (item.value ?? item.computed).toString() : item.computed.toFixed(2)}
                                            disabled={!overrides.enable}
                                            onChange={(e) => {
                                                const val = parseFloat(e.target.value);
                                                setOverrides({ ...overrides, [(item.id)]: isNaN(val) ? null : val });
                                            }}
                                            onBlur={handleUpdate}
                                            className="h-8 pl-8 text-xs font-semibold focus-visible:ring-primary/20"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </CardContent>
        </Card>
    );
}
