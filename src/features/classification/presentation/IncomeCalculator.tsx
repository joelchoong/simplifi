import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import { Info, ChevronDown, ChevronUp, Calculator } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/shared/components/ui/popover";

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

        if (chargeableIncome <= 5000) return { monthly: 0, annual: 0 };

        let totalTax = 0;
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

        return {
            monthly: Math.max(0, totalTax / 12),
            annual: Math.max(0, totalTax)
        };
    };

    const taxResults = useMemo(() => {
        return calculatePCB(gross, computedEPF);
    }, [gross, computedEPF]);

    const computedPCB_MTD = useMemo(() => {
        return taxResults.monthly + deductions.pcbOnAR;
    }, [taxResults, deductions.pcbOnAR]);

    const computedAnnualTax = useMemo(() => {
        return taxResults.annual + (deductions.pcbOnAR * 12);
    }, [taxResults, deductions.pcbOnAR]);

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

    const formatRM = (val: number) => `RM ${Math.round(val).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

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
                                            value={overrides.enable ? (item.value ?? item.computed).toString() : Math.round(item.computed).toString()}
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

                        <div className="pt-2 border-t border-border/50">
                            <div className="flex justify-between items-center px-0.5">
                                <div className="flex items-center gap-1.5">
                                    <Label className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">Est. Annual Income Tax</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button className="text-muted-foreground/60 hover:text-primary transition-colors">
                                                <Info className="h-3 w-3" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80 p-0 overflow-hidden" side="right">
                                            <div className="bg-primary px-3 py-2">
                                                <span className="text-xs font-bold text-primary-foreground">Malaysia Tax Brackets (2024)</span>
                                            </div>
                                            <div className="p-2 bg-background">
                                                <table className="w-full text-[10px]">
                                                    <thead>
                                                        <tr className="border-b border-border">
                                                            <th className="text-left py-1 font-bold">Taxable Income (RM)</th>
                                                            <th className="text-right py-1 font-bold">Rate</th>
                                                            <th className="text-right py-1 font-bold">Tax (RM)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-border/50">
                                                        <tr><td className="py-1">0 - 5,000</td><td className="text-right">0%</td><td className="text-right">0</td></tr>
                                                        <tr><td className="py-1">5,001 - 20,000</td><td className="text-right">1%</td><td className="text-right">150</td></tr>
                                                        <tr><td className="py-1">20,001 - 35,000</td><td className="text-right">3%</td><td className="text-right">450</td></tr>
                                                        <tr><td className="py-1">35,001 - 50,000</td><td className="text-right">6%</td><td className="text-right">900</td></tr>
                                                        <tr><td className="py-1">50,001 - 70,000</td><td className="text-right">11%</td><td className="text-right">2,200</td></tr>
                                                        <tr><td className="py-1">70,001 - 100,000</td><td className="text-right">19%</td><td className="text-right">5,700</td></tr>
                                                        <tr><td className="py-1">100,001 - 400,000</td><td className="text-right">25%</td><td className="text-right">75,000</td></tr>
                                                        <tr><td className="py-1">400,001 - 600,000</td><td className="text-right">26%</td><td className="text-right">52,000</td></tr>
                                                        <tr><td className="py-1">600,001 - 2,000,000</td><td className="text-right">28%</td><td className="text-right">392,000</td></tr>
                                                        <tr><td className="py-1">&gt; 2,000,000</td><td className="text-right">30%</td><td className="text-right">-</td></tr>
                                                    </tbody>
                                                </table>
                                                <div className="mt-2 text-[9px] text-muted-foreground leading-relaxed">
                                                    * Calculations include Standard Relief (9,000) and EPF Relief (up to 4,000).
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <span className="text-xs font-bold text-foreground">{formatRM(computedAnnualTax)}</span>
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </CardContent>
        </Card>
    );
}
