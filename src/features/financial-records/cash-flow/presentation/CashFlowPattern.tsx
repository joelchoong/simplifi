import React from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";
import { Info, ArrowRight, ArrowDown, Activity } from "lucide-react";

interface CashFlowPatternProps {
  income: number;
  expenses: number;
  assets: number;
  liabilities: number;
  className?: string;
}

export const CashFlowPattern: React.FC<CashFlowPatternProps> = ({
  income,
  expenses,
  assets,
  liabilities,
  className,
}) => {
  const passiveIncomePotential = assets * 0.05 / 12; // 5% yearly yield
  const surplus = income - expenses;
  
  // Calculate relative magnitudes for arrows (capped for visual sanity)
  const expenseRatio = Math.min(Math.max((expenses / (income || 1)), 0.1), 1);
  const surplusRatio = Math.min(Math.max((surplus / (income || 1)), 0), 1);
  const isSurplus = surplus > 0;
  
  // Diagnostics
  const passiveRatio = Math.min(Math.round((passiveIncomePotential / (expenses || 1)) * 100), 100);
  const retentionRate = Math.max(Math.round((surplus / (income || 1)) * 100), 0);
  const debtBurden = Math.round((liabilities / (assets || 1)) * 100);

  const formatCurrency = (val: number) => `RM ${Math.round(val).toLocaleString()}`;
  const strokeThickness = (ratio: number) => Math.max(2, ratio * 8);

  return (
    <Card className={cn("p-6 bg-card border-border relative overflow-hidden", className)}>
      <div className="flex flex-col gap-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-black italic text-foreground tracking-tight">Macro Cash Flow Mapping</h3>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Directional flow and wealth accumulation</p>
        </div>

        {/* System Nodes and Directed Flow */}
        <div className="relative py-4 w-full flex flex-col items-center md:items-stretch">
          
          {/* Top Row: Income to Expenses */}
          <div className="flex flex-col md:flex-row items-center w-full justify-between gap-4 relative">
            
            {/* Income Node */}
            <div className="w-full md:w-56 bg-secondary/10 border border-border p-4 rounded-xl relative z-10 shadow-sm flex flex-col items-center md:items-start text-center md:text-left">
              <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-1">Monthly Inflow</p>
              <h4 className="text-2xl font-black text-foreground">{formatCurrency(income)}</h4>
              <div className="flex items-center gap-2 mt-2 bg-background px-2 py-1 rounded-md border border-border/50">
                 <Activity className="w-3 h-3 text-sky-500" />
                 <p className="text-[10px] font-bold text-foreground uppercase">Income</p>
              </div>
            </div>

            {/* Path: Income -> Expenses */}
            <div className="hidden md:flex flex-1 relative items-center justify-center px-4">
               <div className="w-full flex items-center relative">
                  <div className="w-full h-[1px] bg-border/50 absolute" />
                  <motion.div 
                     className="h-1 bg-rose-500 rounded-full"
                     style={{ width: '100%', height: `${strokeThickness(expenseRatio)}px` }}
                     initial={{ scaleX: 0, opacity: 0 }}
                     animate={{ scaleX: 1, opacity: 1 }}
                     transition={{ duration: 1.5, ease: "easeOut" }}
                     style={{ transformOrigin: "left" }}
                  />
                  <ArrowRight className="w-4 h-4 text-rose-500 absolute -right-2 bg-background" />
               </div>
               <div className="absolute -top-5 text-[10px] font-bold text-rose-500 bg-background px-2 border border-rose-500/20 rounded-full">
                 {formatCurrency(expenses)} exacted
               </div>
            </div>

            {/* Mobile Path: Income down to Expenses */}
            <div className="md:hidden flex h-6 w-full justify-center -my-2 relative z-0">
               <ArrowDown className="w-5 h-5 text-rose-500" />
            </div>

            {/* Expenses Node */}
            <div className="w-full md:w-56 bg-rose-500/5 border border-rose-500/20 p-4 rounded-xl relative z-10 shadow-sm flex flex-col items-center md:items-start text-center md:text-left">
              <p className="text-[10px] uppercase font-black text-rose-500/80 tracking-widest mb-1">Monthly Burn</p>
              <h4 className="text-2xl font-black text-rose-600">{formatCurrency(expenses)}</h4>
              <div className="flex items-center gap-2 mt-2 bg-rose-50 px-2 py-1 rounded-md border border-rose-100 dark:bg-rose-950/30 dark:border-rose-900/50">
                 <p className="text-[10px] font-bold text-rose-600 uppercase">Expenses &amp; Consumption</p>
              </div>
            </div>
            
          </div>

          {/* Middle Connection: Income down to Assets */}
          <div className="hidden md:flex relative h-16 w-56 justify-center">
             <div className="h-full flex flex-col items-center relative">
                <div className="h-full w-[1px] bg-border/50 absolute" />
                <motion.div 
                   className="w-1 bg-emerald-500 rounded-full"
                   style={{ height: '100%', width: `${strokeThickness(surplusRatio)}px` }}
                   initial={{ scaleY: 0, opacity: 0 }}
                   animate={{ scaleY: 1, opacity: 1 }}
                   transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                   style={{ transformOrigin: "top" }}
                />
                <ArrowDown className="w-4 h-4 text-emerald-500 absolute -bottom-2 bg-background" />
             </div>
             <div className="absolute top-1/2 -translate-y-1/2 -right-2 translate-x-full text-[10px] font-bold text-emerald-600 bg-background px-2 border border-emerald-500/20 rounded-full whitespace-nowrap">
               {formatCurrency(surplus > 0 ? surplus : 0)} retained
             </div>
          </div>

          {/* Mobile Middle Connection */}
          <div className="md:hidden flex h-6 w-full justify-center my-2 relative z-0">
             <ArrowDown className="w-5 h-5 text-emerald-500" />
          </div>

          {/* Bottom Row: Assets and Liabilities */}
          <div className="flex flex-col md:flex-row items-center w-full justify-between gap-4 relative">
             
            {/* Assets Node */}
            <div className="w-full md:w-56 bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl relative z-10 shadow-sm flex flex-col items-center md:items-start text-center md:text-left">
              <p className="text-[10px] uppercase font-black text-emerald-600 tracking-widest mb-1">Stored Value</p>
              <h4 className="text-2xl font-black text-emerald-600">{formatCurrency(assets)}</h4>
              <div className="flex items-center gap-2 mt-2 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/50">
                 <p className="text-[10px] font-bold text-emerald-600 uppercase">Assets</p>
              </div>
            </div>

            {/* Path: Liabilities -> Assets (Drag) */}
            <div className="hidden md:flex flex-1 relative items-center justify-center px-4">
               <div className="w-full flex items-center relative">
                  <div className="w-full h-[1px] bg-border/50 absolute" />
                  <motion.div 
                     className="h-[2px] bg-rose-500/30 rounded-full w-full"
                     initial={{ scaleX: 0 }}
                     animate={{ scaleX: 1 }}
                     transition={{ duration: 1 }}
                     style={{ transformOrigin: "right" }}
                  />
                  <ArrowRight className="w-4 h-4 text-rose-500/50 absolute -left-2 bg-background rotate-180" />
               </div>
               <div className="absolute -top-5 text-[10px] font-bold text-muted-foreground bg-background px-2 border border-border/50 rounded-full whitespace-nowrap">
                 Draws ~{formatCurrency(liabilities * 0.05 / 12)} /mo
               </div>
            </div>

            {/* Mobile Liabilities Flow */}
            <div className="md:hidden flex h-6 w-full justify-center -my-2 relative z-0">
               <ArrowDown className="w-5 h-5 text-rose-500/50 rotate-180" />
            </div>

            {/* Liabilities Node */}
            <div className="w-full md:w-56 bg-secondary/10 border border-border p-4 rounded-xl relative z-10 shadow-sm flex flex-col items-center md:items-start text-center md:text-left">
              <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-1">Drag on System</p>
              <h4 className="text-2xl font-black text-foreground">{formatCurrency(liabilities)}</h4>
              <div className="flex items-center gap-2 mt-2 bg-background px-2 py-1 rounded-md border border-border/50">
                 <p className="text-[10px] font-bold text-muted-foreground uppercase">Liabilities & Debt</p>
              </div>
            </div>

          </div>

          {/* Wealth Loop Pattern (Assets back to income) */}
          {passiveIncomePotential > 0 && (
            <div className="hidden md:block absolute left-8 top-12 bottom-12 w-12 border-l-2 border-b-2 border-t-2 border-emerald-500/30 rounded-l-3xl z-0 border-dashed" />
          )}

        </div>

        {/* Diagnostics Engine */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-border pt-6 bg-secondary/5 -mx-6 -mb-6 px-6 pb-6">
          <div className="space-y-1.5 p-3 bg-background rounded-lg border border-border/50 shadow-sm">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500" />
               <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Passive Flow</span>
            </div>
            <p className="text-sm font-semibold text-foreground">
               <span className="text-emerald-600 font-black">{passiveRatio}%</span> of expenses are generated by assets
            </p>
          </div>
          <div className="space-y-1.5 p-3 bg-background rounded-lg border border-border/50 shadow-sm">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-sky-500" />
               <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">System Efficiency</span>
            </div>
            <p className="text-sm font-semibold text-foreground">
               You retain <span className="text-sky-600 font-black">{retentionRate}%</span> of your income
            </p>
          </div>
          <div className="space-y-1.5 p-3 bg-background rounded-lg border border-border/50 shadow-sm">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-rose-500" />
               <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Debt Drag</span>
            </div>
            <p className="text-sm font-semibold text-foreground">
              {debtBurden === 0 ? "No cash flow is lost to debt" : <>Liabilities equal <span className="text-rose-600 font-black">{debtBurden}%</span> of your assets</>}
            </p>
          </div>
        </div>

      </div>
    </Card>
  );
};
