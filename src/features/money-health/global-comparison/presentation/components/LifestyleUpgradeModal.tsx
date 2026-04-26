import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { LifestyleLevel } from "../../domain/globalComparisonLogic";

interface LifestyleUpgradeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  countryA: any;
  countryB: any;
  lifestyle: LifestyleLevel;
  setLifestyle: (l: LifestyleLevel) => void;
  customMultiplier: number;
  setCustomMultiplier: (m: number) => void;
  customDisposableIncomeA: number | null;
  setCustomDisposableIncomeA: (v: number | null) => void;
  derivedDisposableA: number;
  expenses: any;
  result: any;
  formatCurrency: (val: number, country: any) => string;
}

export const LifestyleUpgradeModal: React.FC<LifestyleUpgradeModalProps> = ({
  isOpen,
  onOpenChange,
  countryA,
  countryB,
  lifestyle,
  setLifestyle,
  customMultiplier,
  setCustomMultiplier,
  customDisposableIncomeA,
  setCustomDisposableIncomeA,
  derivedDisposableA,
  expenses,
  result,
  formatCurrency,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Adjust Lifestyle Upgrade
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4 max-h-[80vh] overflow-y-auto pr-1">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 group hover:border-orange-500/30 transition-all">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Label className="text-[10px] font-bold uppercase text-orange-700">Origin Disposable</Label>
                  {customDisposableIncomeA !== null && (
                    <button 
                      onClick={() => setCustomDisposableIncomeA(null)}
                      className="text-[8px] bg-orange-100 text-orange-600 px-1 rounded uppercase font-black hover:bg-orange-200"
                    >
                      Reset to Auto
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground leading-tight max-w-[220px]">
                  Your "fun money" in {countryA.name} based on your {expenses ? 'Income Reality' : 'baseline'} profile.
                </p>
              </div>
              <div className="relative w-32">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">{countryA.symbol}</span>
                <Input 
                  type="number" 
                  value={customDisposableIncomeA !== null ? customDisposableIncomeA : Math.round(derivedDisposableA)}
                  onChange={(e) => setCustomDisposableIncomeA(parseInt(e.target.value) || 0)}
                  className="text-sm font-bold h-10 text-right pr-4 pl-8 border-orange-200 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 group hover:border-emerald-500/30 transition-all">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase text-emerald-700">Lifestyle Multiplier</Label>
                <p className="text-[10px] text-muted-foreground leading-tight max-w-[200px]">
                  How much of an "upgrade" you want for this surplus money in {countryB.name}.
                </p>
              </div>
              <div className="relative w-32">
                <Input 
                  type="number" 
                  step="0.05"
                  value={customMultiplier}
                  onChange={(e) => setCustomMultiplier(parseFloat(e.target.value) || 0)}
                  className="text-sm font-bold h-10 text-right pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground italic">x</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground pl-1">Lifestyle Level Presets</Label>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => { setLifestyle('frugal'); setCustomMultiplier(0.8); }}
                  className={`p-2 rounded-lg border text-[10px] font-bold transition-all ${lifestyle === 'frugal' ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-border/50 hover:bg-secondary'}`}
                >
                  Frugal (0.8x)
                </button>
                <button 
                  onClick={() => { setLifestyle('balanced'); setCustomMultiplier(1.0); }}
                  className={`p-2 rounded-lg border text-[10px] font-bold transition-all ${lifestyle === 'balanced' ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-border/50 hover:bg-secondary'}`}
                >
                  Balanced (1.0x)
                </button>
                <button 
                  onClick={() => { setLifestyle('comfortable'); setCustomMultiplier(1.3); }}
                  className={`p-2 rounded-lg border text-[10px] font-bold transition-all ${lifestyle === 'comfortable' ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-border/50 hover:bg-secondary'}`}
                >
                  Comfortable (1.3x)
                </button>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between items-center text-emerald-800">
                <span className="text-[10px] font-bold uppercase">Lifestyle Surplus:</span>
                <span className="text-sm font-bold">{formatCurrency(result.disposableRequirementB, countryB)}</span>
              </div>
              <div className="flex justify-between items-center text-emerald-800">
                <span className="text-[10px] font-bold uppercase">Retirement Gap (EPF):</span>
                <span className="text-sm font-bold">{formatCurrency(result.lostEPFRequirementB, countryB)}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-emerald-200">
              <div className="flex justify-between items-center">
                <div className="text-[10px] font-bold text-emerald-900 uppercase">Total Target Upgrade:</div>
                <div className="text-xl font-black text-emerald-600">
                  {formatCurrency(result.disposableRequirementB + result.lostEPFRequirementB || 0, countryB)}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1 text-xs h-10 font-bold"
              onClick={() => { setLifestyle('balanced'); setCustomMultiplier(1.0); setCustomDisposableIncomeA(null); }}
            >
              Reset to Balanced
            </Button>
            <Button 
              className="flex-1 text-xs h-10 font-bold bg-emerald-600 hover:bg-emerald-700"
              onClick={() => onOpenChange(false)}
            >
              Apply Adjustments
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
