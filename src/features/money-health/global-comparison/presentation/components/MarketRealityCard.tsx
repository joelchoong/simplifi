import React from 'react';
import { Briefcase, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";

interface MarketRealityCardProps {
  countryB: any;
  marketData: any;
  result: any;
  formatCurrency: (val: number, country: any) => string;
}

export const MarketRealityCard: React.FC<MarketRealityCardProps> = ({
  countryB,
  marketData,
  result,
  formatCurrency,
}) => {
  if (!marketData) return null;

  const minB = (marketData.minAnnual / 12) * countryB.exchangeRate * result.costIndex;
  const maxB = (marketData.maxAnnual / 12) * countryB.exchangeRate * result.costIndex;
  const range = maxB - minB;
  const position = ((result.equivalentSalary - minB) / range) * 100;
  const clampedPosition = Math.min(Math.max(position, 0), 100);

  return (
    <div className="relative lg:absolute lg:bottom-6 lg:right-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3 lg:p-4 shadow-2xl w-full max-w-[280px] lg:min-w-[280px] mt-4 lg:mt-0 animate-in slide-in-from-bottom-4 lg:slide-in-from-right-8 duration-1000">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/20 rounded-lg">
            <Briefcase className="w-3 h-3 text-emerald-100" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-50">{countryB.name} Market Check</span>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-white/40 hover:text-white transition-colors">
                <HelpCircle className="w-3 h-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-[10px] max-w-[200px]">
              Estimated {countryB.name} range for {marketData.role}, scaled from Michael Page benchmarks.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="space-y-3">
        <div className="relative h-1 w-full bg-white/10 rounded-full overflow-hidden">
          <div className="absolute inset-y-0 bg-emerald-400/30" style={{ left: '0%', width: '100%' }} />
          <div className="absolute top-0 bottom-0 w-1 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] transition-all duration-1000" style={{ left: `${clampedPosition}%` }} />
        </div>
        
        <div className="flex justify-between items-end">
          <div className="space-y-0.5">
            <p className="text-[7px] font-black uppercase tracking-wider text-emerald-200/50">Local Entry</p>
            <p className="text-[10px] font-bold text-white">{formatCurrency(minB, countryB)}</p>
          </div>
          <div className="text-center">
            <p className="text-[7px] font-black uppercase tracking-wider text-emerald-200/50">Market Top</p>
            <p className="text-[10px] font-bold text-white">{formatCurrency(maxB, countryB)}</p>
          </div>
        </div>

        <div className="pt-2 border-t border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-emerald-100/60 font-medium">Positioning:</span>
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
              clampedPosition < 30 ? 'bg-orange-500/20 text-orange-200' :
              clampedPosition < 70 ? 'bg-emerald-500/20 text-emerald-200' :
              'bg-purple-500/20 text-purple-200'
            }`}>
              {clampedPosition < 30 ? 'Competitive Entry' :
               clampedPosition < 70 ? 'Market Standard' :
               'Top Tier Target'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
