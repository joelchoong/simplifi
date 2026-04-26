import React from 'react';
import { ShieldCheck, Globe, Landmark } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";

interface BaseCommitmentsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  countryA: any;
  countryB: any;
  baseBreakdown: {
    housing: number;
    food: number;
    transport: number;
    utilities: number;
  };
  setBaseBreakdown: React.Dispatch<React.SetStateAction<{
    housing: number;
    food: number;
    transport: number;
    utilities: number;
  }>>;
  homeCommitments: {
    housing: number;
    utilities: number;
  };
  setHomeCommitments: React.Dispatch<React.SetStateAction<{
    housing: number;
    utilities: number;
  }>>;
  targetSurvivalCost: number;
  commitmentCostB: number;
  customBaseLivingCost: number;
  housingCost: number;
  expenses: any;
  formatCurrency: (val: number, country: any) => string;
}

export const BaseCommitmentsModal: React.FC<BaseCommitmentsModalProps> = ({
  isOpen,
  onOpenChange,
  countryA,
  countryB,
  baseBreakdown,
  setBaseBreakdown,
  homeCommitments,
  setHomeCommitments,
  targetSurvivalCost,
  commitmentCostB,
  customBaseLivingCost,
  housingCost,
  expenses,
  formatCurrency,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-orange-600" />
            Survival Base & Commitments
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Globe className="w-3 h-3 text-muted-foreground" />
              <h4 className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">{countryB.name} Local Survival Costs</h4>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4 p-2.5 rounded-xl bg-secondary/10 border border-border/50 group hover:border-orange-500/30 transition-all">
                <div className="space-y-0.5">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Local Housing</Label>
                  <p className="text-[9px] text-muted-foreground/60 italic">Monthly rent in {countryB.name}</p>
                </div>
                <div className="relative w-28">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">{countryB.symbol}</span>
                  <Input 
                    type="number" 
                    value={baseBreakdown.housing}
                    onChange={(e) => setBaseBreakdown(prev => ({ ...prev, housing: parseInt(e.target.value) || 0 }))}
                    className="pl-7 text-xs font-bold h-8 text-right"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 p-2.5 rounded-xl bg-secondary/10 border border-border/50 group hover:border-orange-500/30 transition-all">
                <div className="space-y-0.5">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Food & Transp.</Label>
                  <p className="text-[9px] text-muted-foreground/60 italic">Groceries + Commute</p>
                </div>
                <div className="relative w-28">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">{countryB.symbol}</span>
                  <Input 
                    type="number"
                    value={baseBreakdown.food + baseBreakdown.transport}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setBaseBreakdown(prev => ({ ...prev, food: Math.round(val * 0.7), transport: Math.round(val * 0.3) }));
                    }}
                    className="pl-7 text-xs font-bold h-8 text-right"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 px-1">
              <Landmark className="w-3 h-3 text-orange-600" />
              <h4 className="text-[10px] font-black uppercase tracking-tighter text-orange-600">Home Commitments (Carried Over)</h4>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4 p-2.5 rounded-xl bg-orange-500/5 border border-orange-500/10 group hover:border-orange-500/30 transition-all">
                <div className="space-y-0.5">
                  <Label className="text-[10px] font-bold uppercase text-orange-700">Home Mortgage/Tax</Label>
                  <p className="text-[9px] text-orange-600/60 italic">Obligations in {countryA.name}</p>
                </div>
                <div className="relative w-28">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-orange-700/60">{countryA.symbol}</span>
                  <Input 
                    type="number" 
                    value={homeCommitments.housing}
                    onChange={(e) => setHomeCommitments(prev => ({ ...prev, housing: parseInt(e.target.value) || 0 }))}
                    className="pl-7 text-xs font-bold h-8 text-right border-orange-200"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 p-2.5 rounded-xl bg-orange-500/5 border border-orange-500/10 group hover:border-orange-500/30 transition-all">
                <div className="space-y-0.5">
                  <Label className="text-[10px] font-bold uppercase text-orange-700">Home Utilities/Others</Label>
                  <p className="text-[9px] text-orange-600/60 italic">Fixed subs or family cost</p>
                </div>
                <div className="relative w-28">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-orange-700/60">{countryA.symbol}</span>
                  <Input 
                    type="number"
                    value={homeCommitments.utilities}
                    onChange={(e) => setHomeCommitments(prev => ({ ...prev, utilities: parseInt(e.target.value) || 0 }))}
                    className="pl-7 text-xs font-bold h-8 text-right border-orange-200"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-secondary/20 p-4 rounded-xl space-y-3 border border-border mt-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <div className="text-[10px] font-bold text-muted-foreground uppercase">Local Survival ({countryB.currency}):</div>
              <div className="text-sm font-black text-foreground">
                {formatCurrency(targetSurvivalCost, countryB)}
              </div>
            </div>
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <div className="text-[10px] font-bold text-orange-600 uppercase">Commitments Converted:</div>
              <div className="text-sm font-black text-orange-600">
                {formatCurrency(commitmentCostB, countryB)}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-bold text-orange-600 uppercase">Total Floor ({countryB.currency}):</div>
              <div className="text-xl font-black text-orange-600">
                {formatCurrency(customBaseLivingCost, countryB)}
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              className="flex-1 text-xs h-10 font-bold"
              onClick={() => {
                const countryBase = countryB.baseLivingCost;
                setBaseBreakdown({
                  housing: Math.round(countryBase * 0.6),
                  food: Math.round(countryBase * 0.2),
                  transport: Math.round(countryBase * 0.1),
                  utilities: Math.round(countryBase * 0.1)
                });
                setHomeCommitments({
                  housing: housingCost,
                  utilities: expenses?.utilities || 0
                });
              }}
            >
              Reset Defaults
            </Button>
            <Button 
              className="flex-1 text-xs h-10 font-bold bg-orange-600 hover:bg-orange-700"
              onClick={() => onOpenChange(false)}
            >
              Apply Load
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
