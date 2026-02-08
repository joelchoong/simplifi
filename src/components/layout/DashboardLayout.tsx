import { ReactNode, useEffect, useState, cloneElement, isValidElement } from "react";
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
  const [profileData, setProfileData] = useState({
    monthlyIncome: 0,
    currentEPF: 0,
    age: 25,
  });
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Fetch profile data once on mount
  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  // Refetch data when switching views to ensure sync
  useEffect(() => {
    if (user && !dataLoading) {
      fetchProfileData();
    }
  }, [currentView]);

  const fetchProfileData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('monthly_income, current_epf_amount, age')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data && data.length > 0) {
        setProfileData({
          monthlyIncome: data[0].monthly_income || 0,
          currentEPF: data[0].current_epf_amount || 0,
          age: data[0].age || 25,
        });
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleIncomeUpdate = async (newIncome: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ monthly_income: newIncome })
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state immediately
      setProfileData(prev => ({ ...prev, monthlyIncome: newIncome }));

      toast({
        title: "Income updated",
        description: "Your financial profile has been updated successfully",
      });
    } catch (error) {
      console.error('Error saving income:', error);
      toast({
        title: "Error",
        description: "Failed to save income. Please try again.",
        variant: "destructive",
      });
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
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state immediately
      setProfileData(data);

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

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Clone children and inject the shared income state
  const enhancedChildren = isValidElement(children)
    ? cloneElement(children as React.ReactElement<any>, {
        monthlyIncome: profileData.monthlyIncome,
        onSaveIncome: handleIncomeUpdate,
      })
    : children;

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
            {currentView === 'classification' && enhancedChildren}
            {currentView === 'retirement' && (
              <RetirementView
                initialMonthlyIncome={profileData.monthlyIncome}
                initialCurrentEPF={profileData.currentEPF}
                initialAge={profileData.age}
                onSave={handleRetirementSave}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
