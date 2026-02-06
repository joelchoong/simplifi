import { ReactNode, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UserAvatar } from "./UserAvatar";
import logo from "@/assets/logo.png";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

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
      <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-background sticky top-0 z-50">
        <Link to="/dashboard" className="flex items-center gap-2">
          <img src={logo} alt="SimpliFi" className="h-10 w-auto object-contain" />
        </Link>
        <UserAvatar />
      </header>
      <main className="flex-1 flex flex-col">
        <div className="flex-1 p-6 bg-secondary/30">
          {children}
        </div>
      </main>
    </div>
  );
}
