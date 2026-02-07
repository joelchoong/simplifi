import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { IncomeTierChart } from "@/components/tier/IncomeTierChart";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { IncomeCalculator } from "@/components/dashboard/IncomeCalculator";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [inputIncome, setInputIncome] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("monthly_income")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
      } else if (data?.monthly_income) {
        setMonthlyIncome(Number(data.monthly_income));
        setInputIncome(String(data.monthly_income));
      }
      setLoading(false);
    }

    fetchProfile();
  }, [user]);

  const handleSaveIncome = async (newGrossIncome: number) => {
    if (!user) return;

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ monthly_income: newGrossIncome })
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Error saving income",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setMonthlyIncome(newGrossIncome);
      toast({
        title: "Income updated",
        description: "Your financial profile has been updated successfully",
      });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div className="lg:col-span-7 xl:col-span-8">
            {monthlyIncome > 0 ? (
              <IncomeTierChart monthlyIncome={monthlyIncome} />
            ) : (
              <div className="h-[436px] bg-secondary/10 border border-dashed border-border rounded-2xl flex items-center justify-center">
                <p className="text-muted-foreground">Setup your income to see the chart</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 xl:col-span-4">
            <IncomeCalculator
              initialGross={monthlyIncome}
              onSave={handleSaveIncome}
              saving={saving}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
