import { DashboardLayout } from "@/features/dashboard/presentation/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Check, Rocket, Sparkles, Zap } from "lucide-react";

export default function Billing() {
  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
        <header className="flex flex-col gap-2 text-center sm:text-left">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Billing & Subscription</h1>
          <p className="text-muted-foreground">SimpliFi is currently in free beta. No payment is required.</p>
        </header>

        <div className="flex justify-center">
          {/* Current Plan */}
          <Card className="relative overflow-hidden border-2 border-emerald-500/20 shadow-xl shadow-emerald-900/5 w-full max-w-lg">
            <div className="absolute top-0 right-0 p-4">
              <Badge
                variant="secondary"
                className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-3 py-1"
              >
                Active
              </Badge>
            </div>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                <CardTitle className="text-2xl">Beta Access</CardTitle>
              </div>
              <CardDescription className="text-emerald-700/60 font-medium">
                Enjoy full access to all features during our beta phase.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-foreground">Free</span>
                <span className="text-muted-foreground font-medium">/ beta</span>
              </div>

              <div className="space-y-3 py-4 border-t border-emerald-50">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span className="font-medium">Unlimited Financial Scenarios</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span className="font-medium">Detailed EPF Projections</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span className="font-medium">Income Tier Analysis</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span className="font-medium">All Dashboard Features</span>
                </div>
              </div>

              <Button
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200"
                disabled
              >
                Current Phase
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-emerald-50 border-emerald-100 border-none shadow-sm">
          <CardContent className="pt-6">
            <p className="text-sm text-emerald-800 text-center font-medium leading-relaxed">
              <Sparkles className="w-4 h-4 inline-block mr-2 text-emerald-600" />
              Note: Pricing and plans are subject to change as we evolve during the beta phase. We'll notify all users
              well in advance of any billing implementation.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
