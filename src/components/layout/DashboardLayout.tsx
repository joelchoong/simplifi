import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { HeaderBar, View } from "@/components/navigation/HeaderBar";
import { LayoutGrid, Palmtree } from "lucide-react";
import RetirementView from "@/components/retirement/RetirementView";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<View>('classification');
  const [retirementData, setRetirementData] = useState({
    monthlyIncome: 0,
    currentEPF: 0,
    age: 25,
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Fetch retirement data when switching to retirement view
  useEffect(() => {
    if (currentView === 'retirement' && user) {
      fetchRetirementData();
    }
  }, [currentView, user]);

  const fetchRetirementData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('monthly_income, current_epf_amount, age')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setRetirementData({
          monthlyIncome: data.monthly_income || 0,
          currentEPF: data.current_epf_amount || 0,
          age: data.age || 25,
        });
      }
    } catch (error) {
      console.error('Error fetching retirement data:', error);
    }
  };

  const handleRetirementSave = async (data: { monthlyIncome: number; currentEPF: number; age: number }) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          monthly_income: data.monthlyIncome,
          current_epf_amount: data.currentEPF,
          age: data.age,
        })
        .eq('id', user.id);

      if (error) throw error;

      setRetirementData(data);

      toast({
        title: "Saved",
        description: "Your retirement data has been updated.",
      });
    } catch (error) {
      console.error('Error saving retirement data:', error);
      toast({
        title: "Error",
        description: "Failed to save retirement data. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <HeaderBar
        currentView={currentView}
        setCurrentView={setCurrentView}
        avatarUrl={user.user_metadata?.avatar_url}
        fullName={user.user_metadata?.full_name || user.email}
      />
      <main className="flex-1 flex flex-col">
        <div className="flex-1 p-4 bg-secondary/30">
          <div className="mx-auto max-w-7xl mb-4">
            <div className="flex justify-start">
              <div className="flex items-center gap-2 p-1 bg-secondary/20 rounded-full">
                <button
                  onClick={() => setCurrentView('classification')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${currentView === 'classification'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  Classification
                </button>
                <button
                  onClick={() => setCurrentView('retirement')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${currentView === 'retirement'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }`}
                >
                  <Palmtree className="w-4 h-4" />
                  Retirement
                </button>
              </div>
            </div>
          </div>
          <div className="mx-auto max-w-7xl">
            {currentView === 'classification' && children}
            {currentView === 'retirement' && (
              <RetirementView
                initialMonthlyIncome={retirementData.monthlyIncome}
                initialCurrentEPF={retirementData.currentEPF}
                initialAge={retirementData.age}
                onSave={handleRetirementSave}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
