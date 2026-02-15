import React from "react";
import { Activity, TrendingUp } from "lucide-react";
import AvatarMenu from "./AvatarMenu";
import { useNavigate, Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";

export type View = "classification" | "retirement" | "income-reality" | "settings" | "billing";

interface HeaderBarProps {
  currentView: View;
  setCurrentView: (v: View) => void;
  avatarUrl: string | null;
  fullName: string | null;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ currentView, setCurrentView, avatarUrl, fullName }) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10 w-full bg-background border-b border-border/40">
      <div className="w-full px-6 h-16 flex items-center justify-between relative">
        {/* Far Left: Logo */}
        <Link to="/money-health" className="flex items-center group">
          <img
            src={logo}
            alt="SimpliFi Logo"
            className="w-16 h-16 object-contain transition-transform group-hover:scale-110"
          />
        </Link>

        {/* Center: Page Title (clickable) */}
        <Link to="/money-health" className="group absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary transition-transform duration-200 group-hover:scale-110" />
          <span className="relative text-lg font-bold tracking-tight text-foreground">
            Money Health
            <span className="absolute left-0 -bottom-0.5 h-0.5 w-full origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" />
          </span>
        </Link>

        {/* Far Right: CTA + Avatar Menu */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="font-medium rounded-full border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700">
            <TrendingUp className="h-4 w-4" />
            Improve my position
          </Button>
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
    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      active ? "bg-green-500 text-white shadow-sm" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
    }`}
    aria-current={active ? "page" : undefined}
  >
    {icon}
    {label}
  </button>
);

export default HeaderBar;
