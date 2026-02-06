import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { IncomeTierChart } from "@/components/tier/IncomeTierChart";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

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

  const handleSaveIncome = async () => {
    if (!user) return;
    
    const income = parseFloat(inputIncome);
    if (isNaN(income) || income < 0) {
      toast({
        title: "Invalid income",
        description: "Please enter a valid income amount",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ monthly_income: income })
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Error saving income",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setMonthlyIncome(income);
      toast({
        title: "Income updated",
        description: "Your monthly income has been saved",
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
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Financial Overview</h2>
          <p className="text-muted-foreground">
            Understand where you stand in Malaysia's income distribution
          </p>
        </div>

        {monthlyIncome === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Set Your Monthly Income</CardTitle>
              <CardDescription>
                Enter your monthly household income to see your financial standing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 max-w-md">
                <div className="flex-1">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      RM
                    </span>
                    <Input
                      type="number"
                      placeholder="0"
                      value={inputIncome}
                      onChange={(e) => setInputIncome(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button onClick={handleSaveIncome} disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="mb-4">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-muted-foreground">Update your income:</span>
                  <div className="flex gap-2">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        RM
                      </span>
                      <Input
                        type="number"
                        value={inputIncome}
                        onChange={(e) => setInputIncome(e.target.value)}
                        className="pl-10 w-40"
                      />
                    </div>
                    <Button onClick={handleSaveIncome} disabled={saving} size="sm">
                      {saving ? "Saving..." : "Update"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <IncomeTierChart monthlyIncome={monthlyIncome} />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
