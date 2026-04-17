import React from "react";
import { Wallet, Building, Activity } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { NetWorthRecord } from "@/features/financial-records/domain/netWorth";

// ――― WATER TANK VISUALIZATION  ―――
const WaterTankVisualization = ({ assets, income, expenses, netWorth, runwayMonths }: { assets: number, income: number, expenses: number, netWorth: number, runwayMonths: number }) => {
  const [level, setLevel] = React.useState(0);

  React.useEffect(() => {
    // Determine visual fill level (e.g. net worth relative to assets) just for water physics
    const percentage = assets > 0 ? Math.max(0, Math.min(100, (netWorth / assets) * 100)) : 0;
    setTimeout(() => setLevel(percentage), 100);
  }, [assets, netWorth]);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 text-center">
         <h3 className="text-sm font-bold tracking-widest uppercase text-slate-400 mb-1">Financial Buffer</h3>
         <p className="text-xs text-slate-500 font-medium">Your assets vs monthly burn</p>
      </div>

      <div className="relative w-full max-w-[220px] h-[320px] bg-slate-50 rounded-b-[40px] rounded-t-lg border-[6px] border-slate-100 overflow-hidden shadow-inner isolate">
        {/* Water level background */}
        <div 
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-blue-400 to-indigo-500 transition-all duration-1000 ease-in-out opacity-90"
          style={{ height: `${level}%` }}
        >
          {/* Water Surface effect */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-blue-300 opacity-60 blur-[2px] -mt-2 animate-pulse-subtle"></div>
          
          {/* Soft bubbles */}
          <div className="absolute bottom-4 left-4 w-8 h-8 rounded-full bg-white opacity-20 blur-md animate-float"></div>
          <div className="absolute top-8 right-6 w-12 h-12 rounded-full bg-white opacity-10 blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Income entering (Top) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col justify-start items-center">
           <div className="w-1.5 h-12 bg-gradient-to-b from-emerald-400 to-transparent opacity-60 animate-pulse rounded-full mt-1"></div>
        </div>

        {/* Expenses leaving (Bottom) */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex flex-col justify-end items-center">
           <div className="w-1.5 h-12 bg-gradient-to-t from-rose-400 to-transparent opacity-60 animate-pulse rounded-full mb-0 translate-y-6"></div>
        </div>
        
        {/* Values overlay */}
        <div className="absolute inset-0 flex flex-col justify-center items-center z-10 text-white drop-shadow-md">
           <div className="text-4xl font-black tracking-tighter">
             {runwayMonths > 99 ? '99+' : runwayMonths.toFixed(1)} <span className="text-lg font-bold tracking-tight">mo</span>
           </div>
           <span className="text-[10px] uppercase font-bold text-slate-100/90 tracking-widest mt-1">Runway</span>
        </div>
      </div>
    </div>
  );
};
// ――――――――――――――――――――――――――――――――――――――――――――――――――――

interface NetWorthSummaryProps {
  latestRecord: NetWorthRecord | null;
  previousRecord: NetWorthRecord | null;
  monthlyChange: {
    absolute: number | null;
    percentage: number | null;
  };
  income: number;
  expenses: number;
}

const formatCurrency = (value: number) => {
  return `RM ${Math.abs(Math.round(value)).toLocaleString()}`;
};

export function NetWorthSummary({ latestRecord, previousRecord, monthlyChange, income, expenses }: NetWorthSummaryProps) {
  if (!latestRecord) {
    return (
      <section className="rounded-[10px] border border-dashed border-border/60 bg-card p-3 text-center text-sm text-muted-foreground shadow-sm">
        Add this month’s numbers to see your net worth, monthly change, and breakdown.
      </section>
    );
  }

  // --- DATA MAPPING ---
  const netWorth = latestRecord.netWorth;
  const changeValue = monthlyChange.absolute ?? 0;
  const isPositive = changeValue >= 0;

  const cash = latestRecord.totalCash;
  const investments = latestRecord.totalInvestments + (latestRecord.epfAmount || 0) + latestRecord.totalProperty;
  const debt = latestRecord.totalLiabilities;
  const totalAssets = cash + investments;

  const prevAssets = previousRecord ? (previousRecord.totalCash + previousRecord.totalInvestments + (previousRecord.epfAmount || 0) + previousRecord.totalProperty) : totalAssets;
  const prevDebt = previousRecord ? previousRecord.totalLiabilities : debt;

  const assetChange = totalAssets - prevAssets;
  const liabilityChange = prevDebt - debt; // If debt decreased, it's a positive change to net worth

  const movements = [
    { id: 'inc', label: 'Est. Income', amount: income },
    { id: 'exp', label: 'Est. Expenses', amount: -expenses },
    { id: 'ast', label: 'Asset Value Growth', amount: assetChange },
    { id: 'lia', label: 'Debt Repayment / Adj.', amount: liabilityChange },
  ].filter(m => m.amount !== 0 || m.id === 'inc' || m.id === 'exp');

  const runwayMonths = expenses > 0 ? (totalAssets / expenses) : 0;

  return (
    <div className="animate-in fade-in duration-500 font-sans pb-4">
      
      {/* 1. STATE SECTION (Primary Focus) */}
      <div className="flex flex-col items-center justify-center text-center space-y-1 pb-16 pt-6">
        <div className="text-5xl lg:text-[72px] font-black tracking-tighter text-slate-900 leading-none">
          {netWorth < 0 ? '-' : ''}{formatCurrency(netWorth)}
        </div>
        {monthlyChange.absolute !== null && (
           <div className={`text-lg font-bold tracking-tight ${isPositive ? 'text-emerald-500' : 'text-rose-500'} pt-2`}>
              {isPositive ? '+' : '-'}{formatCurrency(changeValue)} this month
           </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-4 items-start">
        {/* LEFT COLUMN: Composition Categories (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-12">
           
           <div className="space-y-4">
             <h2 className="text-sm font-bold tracking-widest uppercase text-slate-400 mb-2">Composition</h2>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               <div className="flex flex-col p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-2 text-slate-500 mb-3">
                    <Wallet className="w-5 h-5 text-emerald-500" />
                    <span className="font-bold tracking-tight text-sm text-slate-800">Liquid</span>
                  </div>
                  <div className="text-2xl font-black tracking-tighter text-slate-900">
                    {formatCurrency(cash)}
                  </div>
               </div>

               <div className="flex flex-col p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-2 text-slate-500 mb-3">
                    <Building className="w-5 h-5 text-blue-500" />
                    <span className="font-bold tracking-tight text-sm text-slate-800">Investment</span>
                  </div>
                  <div className="text-2xl font-black tracking-tighter text-slate-900">
                    {formatCurrency(investments)}
                  </div>
               </div>

               <div className="flex flex-col p-5 bg-slate-50/80 border border-slate-100 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-2 text-slate-500 mb-3">
                    <Activity className="w-5 h-5 text-rose-500" />
                    <span className="font-bold tracking-tight text-sm text-slate-800">Debt</span>
                  </div>
                  <div className="text-2xl font-black tracking-tighter text-rose-600">
                    ({formatCurrency(debt)})
                  </div>
               </div>
             </div>
           </div>

           {/* 2. MONTHLY FLOW SECTION */}
           {monthlyChange.absolute !== null && (
             <div className="space-y-4">
               <h2 className="text-sm font-bold tracking-widest uppercase text-slate-400 mb-2">Monthly Flow</h2>
               <div className="bg-slate-50/60 border border-slate-100 rounded-3xl p-6 sm:p-8">
                  <div className="mb-6">
                    <p className="text-slate-500 text-sm font-medium">Driven by:</p>
                  </div>
                  
                  <div className="space-y-4">
                    {movements.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-[15px]">
                        <span className="text-slate-600 font-medium">{item.label}</span>
                        <span className={`font-black tracking-tight ${item.amount >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {item.amount >= 0 ? '+' : '-'}{formatCurrency(item.amount)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-200 flex justify-between items-center text-lg">
                    <span className="font-bold text-slate-800">Total Change</span>
                    <span className={`font-black tracking-tighter ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isPositive ? '+' : '-'}{formatCurrency(changeValue)}
                    </span>
                  </div>
               </div>
             </div>
           )}
        </div>

        {/* RIGHT COLUMN: Water Tank (4 cols) */}
        <div className="lg:col-span-4 lg:pl-6 border-l-none lg:border-l border-slate-100 flex justify-center py-4">
           <WaterTankVisualization 
              assets={totalAssets}
              income={income}
              expenses={expenses}
              netWorth={netWorth}
              runwayMonths={runwayMonths}
           />
        </div>
      </div>
    </div>
  );
}

export default NetWorthSummary;
