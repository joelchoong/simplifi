import { ReactNode, useEffect, useState, cloneElement, isValidElement } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/data/useAuth";
import { HeaderBar, View } from "@/shared/components/navigation/HeaderBar";
import { Activity, LayoutGrid, Palmtree, Scale } from "lucide-react";
import RetirementView from "@/features/retirement/presentation/RetirementView";
import IncomeRealityView from "@/features/income-reality/presentation/IncomeRealityView";
import { supabase } from "@/shared/integrations/supabase/client";
import { calculateSustainableWithdrawal } from "@/features/retirement/domain/epfCalculations";
import { useToast } from "@/shared/hooks/use-toast";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<View>('classification');
  const [profileData, setProfileData] = useState({
    monthlyIncome: 0,
    currentEPF: 0,
    age: 25,
    housingCost: 0,
    householdType: 'alone' as string,
    dependants: 1,
    location: 'kl' as string,
    expenseFood: 1500,
    expenseTransport: 600,
    expenseUtilities: 300,
    expenseOthers: 100,
    expenseEntertainment: 500,
  });
  const [dataLoading, setDataLoading] = useState(true);

  const isDashboard = location.pathname === "/money-health";

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
    if (user && !dataLoading && isDashboard) {
      fetchProfileData();
    }
  }, [currentView, isDashboard]);

  const fetchProfileData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('monthly_income, current_epf_amount, age, housing_cost, household_type, dependants, location, expense_food, expense_transport, expense_utilities, expense_others, expense_entertainment')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data && data.length > 0) {
        const d = data[0];
        setProfileData({
          monthlyIncome: d.monthly_income || 0,
          currentEPF: d.current_epf_amount || 0,
          age: d.age || 25,
          housingCost: d.housing_cost || 0,
          householdType: d.household_type || 'alone',
          dependants: d.dependants || 1,
          location: d.location || 'kl',
          expenseFood: d.expense_food ?? 1500,
          expenseTransport: d.expense_transport ?? 600,
          expenseUtilities: d.expense_utilities ?? 300,
          expenseOthers: d.expense_others ?? 100,
          expenseEntertainment: d.expense_entertainment ?? 500,
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

      setProfileData(prev => ({ ...prev, ...data }));

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

  const handleIncomeRealitySave = async (data: {
    monthlyIncome: number;
    housingCost: number;
    householdType: string;
    dependants: number;
    location: string;
    expenseFood: number;
    expenseTransport: number;
    expenseUtilities: number;
    expenseOthers: number;
    expenseEntertainment: number;
  }) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          monthly_income: data.monthlyIncome,
          housing_cost: data.housingCost,
          household_type: data.householdType,
          dependants: data.dependants,
          location: data.location,
          expense_food: data.expenseFood,
          expense_transport: data.expenseTransport,
          expense_utilities: data.expenseUtilities,
          expense_others: data.expenseOthers,
          expense_entertainment: data.expenseEntertainment,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setProfileData(prev => ({ ...prev, ...data }));
    } catch (error) {
      console.error('Error saving income reality data:', error);
      toast({
        title: "Error",
        description: "Failed to save data. Please try again.",
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
          {isDashboard && (
            <div className="mx-auto max-w-6xl mb-4">
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
                  <button
                    onClick={() => setCurrentView('income-reality')}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${currentView === 'income-reality'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                      }`}
                  >
                    <Scale className="w-4 h-4" />
                    Income Reality
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="mx-auto max-w-6xl">
            {isDashboard ? (
              <>
                {currentView === 'classification' && enhancedChildren}
                {currentView === 'retirement' && (
                  <RetirementView
                    initialMonthlyIncome={profileData.monthlyIncome}
                    initialCurrentEPF={profileData.currentEPF}
                    initialAge={profileData.age}
                    maxSpendAmount={(() => {
                      if (!profileData.age || profileData.age < 18 || profileData.age > 60 || !profileData.monthlyIncome) return 0;
                      return calculateSustainableWithdrawal({
                        currentAge: profileData.age,
                        retirementAge: 60,
                        targetAge: 90,
                        monthlyIncome: profileData.monthlyIncome,
                        currentEPFAmount: profileData.currentEPF,
                      });
                    })()}
                    onSave={handleRetirementSave}
                  />
                )}
                {currentView === 'income-reality' && (
                  <IncomeRealityView
                    initialMonthlyIncome={profileData.monthlyIncome}
                    initialHousingCost={profileData.housingCost}
                    initialCurrentEPF={profileData.currentEPF}
                    initialAge={profileData.age}
                    initialHouseholdType={profileData.householdType}
                    initialDependants={profileData.dependants}
                    initialLocation={profileData.location}
                    initialExpenses={{
                      food: profileData.expenseFood,
                      transport: profileData.expenseTransport,
                      utilities: profileData.expenseUtilities,
                      others: profileData.expenseOthers,
                      entertainment: profileData.expenseEntertainment,
                    }}
                    onSave={handleIncomeRealitySave}
                  />
                )}
              </>
            ) : (
              enhancedChildren
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
