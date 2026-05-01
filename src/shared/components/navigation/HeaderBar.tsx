import React from "react";
import { Activity, TrendingUp, WalletCards } from "lucide-react";
import AvatarMenu from "./AvatarMenu";
import { useNavigate, Link, useLocation } from "react-router-dom";
import logo from "@/assets/logo.png";
import { Button } from "@/shared/components/ui/button";

export type View = "classification" | "retirement" | "income-reality" | "settings" | "billing" | "benchmark" | "global-comparison";

interface HeaderBarProps {
  currentView: View;
  setCurrentView: (v: View) => void;
  avatarUrl: string | null;
  fullName: string | null;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ currentView, setCurrentView, avatarUrl, fullName }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMoneyHealthActive = ["/money-health", "/improve"].includes(location.pathname);
  const isFinancialRecordsActive = location.pathname === "/financial-records";

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border/40">
      <div className="w-full px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between relative">
        {/* Far Left: Logo */}
        <Link to="/money-health" className="flex items-center group">
          <img
            src={logo}
            alt="SimpliFi Logo"
            className="hidden sm:block w-16 h-16 object-contain transition-transform group-hover:scale-110"
          />
          <img
            src="/favicon.png"
            alt="SimpliFi Logo"
            className="block sm:hidden w-9 h-9 object-contain transition-transform group-hover:scale-110 mix-blend-multiply"
          />
        </Link>

        {/* Center: Primary Navigation */}
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-5">
          <Link
            to="/money-health"
            className={`group flex items-center gap-2 ${isMoneyHealthActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            aria-current={isMoneyHealthActive ? "page" : undefined}
          >
            <Activity className="h-5 w-5 text-primary transition-transform duration-200 group-hover:scale-110" />
            <span className="relative hidden text-m font-bold tracking-tight sm:inline">
              Money Health
              <span
                className={`absolute left-0 -bottom-0.5 h-0.5 w-full origin-left bg-primary transition-transform duration-300 ${
                  isMoneyHealthActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </span>
          </Link>
          <Link
            to="/financial-records"
            className={`group flex items-center gap-2 ${isFinancialRecordsActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            aria-current={isFinancialRecordsActive ? "page" : undefined}
          >
            <WalletCards className="h-5 w-5 text-primary transition-transform duration-200 group-hover:scale-110" />
            <span className="relative hidden text-m font-bold tracking-tight sm:inline">
              Financial Records
              <span
                className={`absolute left-0 -bottom-0.5 h-0.5 w-full origin-left bg-primary transition-transform duration-300 ${
                  isFinancialRecordsActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </span>
          </Link>
        </div>

        {/* Far Right: CTA + Avatar Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          <AvatarMenu
            src={avatarUrl}
            name={fullName}
            isActive={["settings", "billing"].includes(currentView)}
            onSettings={() => {
              navigate("/profile");
            }}
            onBilling={() => {
              navigate("/billing");
            }}
          />
        </div>
      </div>
      {/* Row 2: AI Chatbar (Hidden for now) */}
      {/* <div className="flex justify-center">
                    <div className="relative w-full max-w-2xl">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Sparkles className="h-4 w-4 text-muted-foreground/50" />
                        </div>
                        <Input 
                            disabled
                            placeholder="Ask SimpliFi AI (Coming Soon)"
                            className="pl-10 h-10 bg-secondary/10 border-border/60 text-center placeholder:text-muted-foreground/50 disabled:cursor-not-allowed disabled:opacity-70 rounded-full"
                        />
                    </div>
                </div> */}

      {/* Row 3: Navigation Tabs - Moved to DashboardLayout */}
    </header>
  );
};

const HeaderTab: React.FC<{
  label: React.ReactNode;
  icon: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}> = ({ label, icon, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active ? "bg-green-500 text-white shadow-sm" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      }`}
    aria-current={active ? "page" : undefined}
  >
    {icon}
    {label}
  </button>
);

export default HeaderBar;
