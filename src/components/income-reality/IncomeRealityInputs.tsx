import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Scale, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HouseholdType, Location } from "@/lib/incomeRealityCalculations";

interface IncomeRealityInputsProps {
  initialMonthlyIncome?: number;
  onChanged: (data: {
    monthlyIncome: number;
    housingCost: number;
    householdType: HouseholdType;
    dependants: number;
    location: Location;
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

  // Sync income from props
  useEffect(() => {
    setMonthlyIncome(initialMonthlyIncome);
    setInputIncome(initialMonthlyIncome > 0 ? initialMonthlyIncome.toString() : "");
  }, [initialMonthlyIncome]);

  // Notify parent on any change
  useEffect(() => {
    onChanged({ monthlyIncome, housingCost, householdType, dependants, location });
  }, [monthlyIncome, housingCost, householdType, dependants, location]);

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
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm group-focus-within:text-primary transition-colors">
              RM
            </span>
            <Input
              id="realityIncome"
              type="number"
              value={inputIncome}
              onChange={(e) => {
                setInputIncome(e.target.value);
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) setMonthlyIncome(val);
              }}
              onBlur={() => {}}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
              }}
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
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm group-focus-within:text-primary transition-colors">
              RM
            </span>
            <Input
              id="housingCost"
              type="number"
              placeholder="Enter your monthly rent or mortgage"
              value={inputHousing}
              onChange={(e) => {
                setInputHousing(e.target.value);
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) setHousingCost(val);
                else if (e.target.value === "") setHousingCost(0);
              }}
              onBlur={() => {}}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
              }}
              className="pl-10 text-lg font-bold h-12 border-2 focus-visible:ring-primary/20"
            />
          </div>
        </div>

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

          {/* Dependants counter */}
          {householdType === "family" && (
            <div className="flex items-center justify-between bg-secondary/20 border border-border/50 rounded-xl px-4 py-3 mt-1">
              <span className="text-sm font-medium text-foreground">Number of dependants</span>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => setDependants(Math.max(1, dependants - 1))}
                  disabled={dependants <= 1}
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <span className="text-lg font-bold tabular-nums w-6 text-center">{dependants}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => setDependants(Math.min(10, dependants + 1))}
                  disabled={dependants >= 10}
                >
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
