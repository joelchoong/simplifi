import { ReceiptText } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export function MyTaxView() {
  return (
    <div className="w-full">
      <section className="bg-card rounded-2xl border border-border/60 p-8 text-center space-y-4 shadow-sm">
        <div className="bg-emerald-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
          <ReceiptText className="w-8 h-8 text-emerald-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold tracking-tight">MyTax Insights</h3>
          <p className="text-muted-foreground max-w-sm mx-auto text-sm">
            Understand your tax obligations and optimize your savings. Tax planning features are coming soon.
          </p>
        </div>
        <div className="pt-4">
          <Button disabled variant="outline" className="rounded-full border-dashed border-border/60">
            Coming Soon
          </Button>
        </div>
      </section>
    </div>
  );
}

export default MyTaxView;
