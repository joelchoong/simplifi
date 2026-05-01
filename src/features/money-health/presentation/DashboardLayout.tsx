import { ReactNode, useEffect, useState } from "react";
import { useNavigate, useLocation, Outlet, Link } from "react-router-dom";
import { HeaderBar, View } from "@/shared/components/navigation/HeaderBar";
import { BarChart3, LayoutGrid, Palmtree, Scale, Globe, Home, WalletCards, ReceiptText, UserCircle } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { DashboardContent } from "@/features/money-health/classification/presentation/Dashboard";
import RetirementView from "@/features/money-health/retirement/presentation/RetirementView";
import IncomeRealityView from "@/features/money-health/income-reality/presentation/IncomeRealityView";
import ImprovePositionView from "@/features/improve/presentation/ImprovePositionView";
import BenchmarkView from "@/features/money-health/benchmark/presentation/BenchmarkView";
import GlobalComparisonView from "@/features/money-health/global-comparison/presentation/GlobalComparisonView";
import { calculateSustainableWithdrawal } from "@/features/money-health/retirement/domain/epfCalculations";
import { Tour, TourStep } from "@/shared/components/ui/tour";
import { useProfileData } from "@/features/profile/hooks/useProfileData";

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

function BottomNav() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tab = searchParams.get("tab");

  const isHome = location.pathname === "/money-health" || location.pathname === "/";
  const isNetWorth = location.pathname === "/financial-records" && tab !== "my-tax";
  const isMyTax = location.pathname === "/financial-records" && tab === "my-tax";
  const isProfile = location.pathname === "/profile";

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border/40 pb-safe">
      <div className="flex justify-around items-center h-16 px-2">
        <Link to="/money-health" className={cn("flex flex-col items-center justify-center w-full h-full gap-1 transition-colors", isHome ? "text-emerald-600" : "text-muted-foreground hover:text-foreground")}>
          <Home className="w-[22px] h-[22px]" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link to="/financial-records?tab=net-worth" className={cn("flex flex-col items-center justify-center w-full h-full gap-1 transition-colors", isNetWorth ? "text-emerald-600" : "text-muted-foreground hover:text-foreground")}>
          <WalletCards className="w-[22px] h-[22px]" />
          <span className="text-[10px] font-medium">Net Worth</span>
        </Link>
        <Link to="/financial-records?tab=my-tax" className={cn("flex flex-col items-center justify-center w-full h-full gap-1 transition-colors", isMyTax ? "text-emerald-600" : "text-muted-foreground hover:text-foreground")}>
          <ReceiptText className="w-[22px] h-[22px]" />
          <span className="text-[10px] font-medium">MyTax</span>
        </Link>
        <Link to="/profile" className={cn("flex flex-col items-center justify-center w-full h-full gap-1 transition-colors", isProfile ? "text-emerald-600" : "text-muted-foreground hover:text-foreground")}>
          <UserCircle className="w-[22px] h-[22px]" />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </div>
    </nav>
  );
}

interface DashboardLayoutProps {
  children?: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { profileData, loading, user, updateIncome, updateProfile, updateBenchmark } = useProfileData();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentView, setCurrentView] = useState<View>('classification');
  const [showTour, setShowTour] = useState(false);

  const isDashboard = location.pathname === "/money-health";
  const isImprove = location.pathname === "/improve";

  useEffect(() => {
    if (isDashboard && !localStorage.getItem("simplifi_tour_completed")) {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <HeaderBar
        currentView={currentView}
        setCurrentView={setCurrentView}
        avatarUrl={user.user_metadata?.avatar_url}
        fullName={user.user_metadata?.full_name || user.email}
      />
      <main className="flex-1 flex flex-col pb-20 sm:pb-0">
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
                  <button
                    onClick={() => setCurrentView('global-comparison')}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${currentView === 'global-comparison'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                      }`}
                  >
                    <Globe className="w-4 h-4 shrink-0" />
                    <span className={currentView === 'global-comparison' ? 'inline whitespace-nowrap' : 'hidden sm:inline whitespace-nowrap'}>Global Comparison</span>
                  </button>
                </div>
              </div>
            </div>
          )}
          <div 
            key={`${currentView}-${location.pathname}`}
            className="mx-auto max-w-6xl"
          >
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
                    onSaveIncome={updateIncome}
                  />
                )}
                {currentView === 'retirement' && (
                  <RetirementView 
                    initialMonthlyIncome={profileData.monthlyIncome} 
                    initialCurrentEPF={profileData.currentEPF}
                    initialAge={profileData.age}
                    initialMonthlyVoluntaryContribution={profileData.monthlyVoluntaryContribution}
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
                    onSave={updateProfile}
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
                    onSave={updateProfile}
                  />
                )}
                {currentView === 'benchmark' && (
                  <BenchmarkView 
                    monthlyIncome={profileData.monthlyIncome}
                    initialSector={profileData.benchmarkSector}
                    initialSpecialisation={profileData.benchmarkSpecialisation}
                    initialRole={profileData.benchmarkRole}
                    onSaveRole={updateBenchmark}
                    onOpenGlobal={() => setCurrentView('global-comparison')}
                  />
                )}
                {currentView === 'global-comparison' && (
                  <GlobalComparisonView 
                    monthlyIncome={profileData.monthlyIncome}
                    age={profileData.age}
                    housingCost={profileData.housingCost}
                    expenses={{
                      food: profileData.expenseFood,
                      transport: profileData.expenseTransport,
                      utilities: profileData.expenseUtilities,
                      others: profileData.expenseOthers,
                      entertainment: profileData.expenseEntertainment,
                    }}
                    monthlyVoluntaryContribution={profileData.monthlyVoluntaryContribution}
                    benchmarkRole={profileData.benchmarkRole}
                  />
                )}
                {children || <Outlet />}
              </>
            ) : (
              children || <Outlet />
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
      
      <BottomNav />
    </div>
  );
}
