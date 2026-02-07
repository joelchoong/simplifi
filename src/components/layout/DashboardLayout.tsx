import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { HeaderBar, View } from "@/components/navigation/HeaderBar";
import { LayoutGrid, Palmtree } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<View>('classification');

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
        <div className="flex-1 p-6 bg-secondary/30">
          <div className="mx-auto max-w-6xl mb-6">
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
          {currentView === 'classification' && children}
          {currentView === 'retirement' && (
            <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
              <span className="text-4xl mb-4">🏝️</span>
              <h3 className="text-xl font-bold">Retirement Planning</h3>
              <p>Coming soon...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
