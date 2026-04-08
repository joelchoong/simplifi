import { ReactNode, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/data/useAuth";
import { HeaderBar, View } from "@/shared/components/navigation/HeaderBar";
import { Activity, BarChart3, LayoutGrid, Palmtree, Scale } from "lucide-react";
import { DashboardContent } from "@/features/classification/presentation/Dashboard";
import RetirementView from "@/features/retirement/presentation/RetirementView";
import IncomeRealityView from "@/features/income-reality/presentation/IncomeRealityView";
import ImprovePositionView from "@/features/improve/presentation/ImprovePositionView";
import BenchmarkView from "@/features/benchmark/presentation/BenchmarkView";
import { supabase } from "@/shared/integrations/supabase/client";
import { calculateSustainableWithdrawal } from "@/features/retirement/domain/epfCalculations";
import { DEFAULT_EXPENSES } from "@/features/income-reality/domain/incomeRealityCalculations";
import { useToast } from "@/shared/hooks/use-toast";
import { Tour, TourStep } from "@/shared/components/ui/tour";

const TOUR_STEPS: TourStep[] = [
  {
    target: "#tour-navigation-tabs",
    title: "Welcome to SimpliFi!",
    content: "Use these tabs to switch between different areas of your financial health: Classification, Retirement planning, and your Income Reality.",
    placement: "bottom"
  },
  {
    target: "#tour-income-input",
    title: "Start Your Journey",
    content: "Enter your Gross Monthly Income here and press Enter. You'll instantly see your charts update with your financial snapshot.",
    placement: "left"
  }
];

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
    expenseFood: DEFAULT_EXPENSES.food,
    expenseTransport: DEFAULT_EXPENSES.transport,
    expenseUtilities: DEFAULT_EXPENSES.utilities,
    expenseOthers: DEFAULT_EXPENSES.others,
    expenseEntertainment: DEFAULT_EXPENSES.entertainment,
    benchmarkSector: '' as string,
    benchmarkSpecialisation: '' as string,
    benchmarkRole: '' as string,
  });
  const [dataLoading, setDataLoading] = useState(true);
  const [showTour, setShowTour] = useState(false);

  const isDashboard = location.pathname === "/money-health";
  const isImprove = location.pathname === "/improve";

  useEffect(() => {
    // Check if user has completed the tour
    if (isDashboard && !localStorage.getItem("simplifi_tour_completed")) {
      // Small delay to let the UI settle
      const timer = setTimeout(() => setShowTour(true), 500);
      return () => clearTimeout(timer);
    }
  }, [isDashboard]);

  const handleTourComplete = () => {
    localStorage.setItem("simplifi_tour_completed", "true");
    setShowTour(false);
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Refetch data when switching views to ensure sync
  useEffect(() => {
    if (user && !dataLoading && isDashboard) {
      fetchProfileData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView, isDashboard]);

  const fetchProfileData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('monthly_income, current_epf_amount, age, housing_cost, household_type, dependants, location, expense_food, expense_transport, expense_utilities, expense_others, expense_entertainment, benchmark_sector, benchmark_specialisation, benchmark_role')
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
          expenseFood: d.expense_food ?? DEFAULT_EXPENSES.food,
          expenseTransport: d.expense_transport ?? DEFAULT_EXPENSES.transport,
          expenseUtilities: d.expense_utilities ?? DEFAULT_EXPENSES.utilities,
          expenseOthers: d.expense_others ?? DEFAULT_EXPENSES.others,
          expenseEntertainment: d.expense_entertainment ?? DEFAULT_EXPENSES.entertainment,
          benchmarkSector: d.benchmark_sector || '',
          benchmarkSpecialisation: d.benchmark_specialisation || '',
          benchmarkRole: d.benchmark_role || '',
        });
      }
    } catch (error) {
      // Error fetching profile data - silent fail
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
      toast({
        title: "Error",
        description: "Failed to save data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBenchmarkSave = async (sector: string, specialisation: string, role: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          benchmark_sector: sector,
          benchmark_specialisation: specialisation,
          benchmark_role: role,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setProfileData(prev => ({ 
        ...prev, 
        benchmarkSector: sector,
        benchmarkSpecialisation: specialisation,
        benchmarkRole: role 
      }));

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save job role. Please try again.",
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
                <div id="tour-navigation-tabs" className="flex items-center gap-2 p-1 bg-secondary/20 rounded-full">
                  <button
                    onClick={() => setCurrentView('classification')}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${currentView === 'classification'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                      }`}
                  >
                    <LayoutGrid className="w-4 h-4 shrink-0" />
                    <span className={currentView === 'classification' ? 'inline whitespace-nowrap' : 'hidden sm:inline whitespace-nowrap'}>Classification</span>
                  </button>
                  <button
                    onClick={() => setCurrentView('retirement')}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${currentView === 'retirement'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                      }`}
                  >
                    <Palmtree className="w-4 h-4 shrink-0" />
                    <span className={currentView === 'retirement' ? 'inline whitespace-nowrap' : 'hidden sm:inline whitespace-nowrap'}>Retirement</span>
                  </button>
                  <button
                    onClick={() => setCurrentView('income-reality')}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${currentView === 'income-reality'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                      }`}
                  >
                    <Scale className="w-4 h-4 shrink-0" />
                    <span className={currentView === 'income-reality' ? 'inline whitespace-nowrap' : 'hidden sm:inline whitespace-nowrap'}>Income Reality</span>
                  </button>
                  <button
                    onClick={() => setCurrentView('benchmark')}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${currentView === 'benchmark'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                      }`}
                  >
                    <BarChart3 className="w-4 h-4 shrink-0" />
                    <span className={currentView === 'benchmark' ? 'inline whitespace-nowrap' : 'hidden sm:inline whitespace-nowrap'}>Benchmark</span>
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="mx-auto max-w-6xl">
            {isImprove ? (
              <ImprovePositionView
                monthlyIncome={profileData.monthlyIncome}
                housingCost={profileData.housingCost}
                currentEPF={profileData.currentEPF}
                age={profileData.age}
                householdType={profileData.householdType}
                dependants={profileData.dependants}
                location={profileData.location}
                expenses={{
                  food: profileData.expenseFood,
                  transport: profileData.expenseTransport,
                  utilities: profileData.expenseUtilities,
                  others: profileData.expenseOthers,
                  entertainment: profileData.expenseEntertainment,
                }}
              />
            ) : isDashboard ? (
              <>
                {currentView === 'classification' && (
                  <DashboardContent
                    monthlyIncome={profileData.monthlyIncome}
                    onSaveIncome={handleIncomeUpdate}
                  />
                )}
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
                {currentView === 'benchmark' && (
                  <BenchmarkView 
                    monthlyIncome={profileData.monthlyIncome}
                    initialSector={profileData.benchmarkSector}
                    initialSpecialisation={profileData.benchmarkSpecialisation}
                    initialRole={profileData.benchmarkRole}
                    onSaveRole={handleBenchmarkSave}
                  />
                )}
              </>
            ) : (
              children
            )}
          </div>
        </div>
      </main>

      <Tour
        isOpen={showTour}
        steps={TOUR_STEPS}
        onComplete={handleTourComplete}
        onSkip={handleTourComplete}
      />
    </div>
  );
}
