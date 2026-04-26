import React from 'react';
import { Landmark } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";

interface TaxRateModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  countryB: any;
  customTaxRate: number | null;
  setCustomTaxRate: (v: number | null) => void;
  result: any;
  formatCurrency: (val: number, country: any) => string;
}

export const TaxRateModal: React.FC<TaxRateModalProps> = ({
  isOpen,
  onOpenChange,
  countryB,
  customTaxRate,
  setCustomTaxRate,
  result,
  formatCurrency,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-purple-600" />
            Adjust Target Effective Tax
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 group hover:border-purple-500/30 transition-all">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Label className="text-[10px] font-bold uppercase text-purple-700">Effective Tax Rate</Label>
                  {customTaxRate !== null && (
                    <button 
                      onClick={() => setCustomTaxRate(null)}
                      className="text-[8px] bg-purple-100 text-purple-600 px-1 rounded uppercase font-black hover:bg-purple-200"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground leading-snug max-w-[200px]">
                  Average total tax burden for {countryB.name} at this income level.
                </p>
              </div>
              <div className="relative w-32">
                <Input 
                  type="number" 
                  value={customTaxRate !== null ? customTaxRate : Math.round(countryB.taxRate * 100)}
                  onChange={(e) => setCustomTaxRate(parseInt(e.target.value) || 0)}
                  className="text-lg font-bold h-10 text-right pr-8 border-purple-200 focus:ring-purple-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">%</span>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl space-y-3">
            <div className="flex justify-between items-center text-purple-900">
              <span className="text-[10px] font-bold uppercase">Estimated Tax Cost:</span>
              <span className="text-sm font-bold">{formatCurrency(result.equivalentSalary * (customTaxRate !== null ? customTaxRate/100 : countryB.taxRate), countryB)}</span>
            </div>
            <p className="text-[9px] text-purple-700/60 italic leading-snug">
              Increasing your tax rate will increase the required gross salary needed to maintain your net-neutral lifestyle.
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1 text-xs h-10 font-bold"
              onClick={() => setCustomTaxRate(null)}
            >
              Reset Default
            </Button>
            <Button 
              className="flex-1 text-xs h-10 font-bold bg-purple-600 hover:bg-purple-700"
              onClick={() => onOpenChange(false)}
            >
              Apply Tax Rate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
