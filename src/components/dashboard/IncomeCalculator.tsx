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
    onSave: (nettPay: number) => void;
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

    const computedPCB_MTD = useMemo(() => deductions.pcbAuto + deductions.pcbOnAR, [deductions.pcbAuto, deductions.pcbOnAR]);
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
        onSave(nettPay);
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
