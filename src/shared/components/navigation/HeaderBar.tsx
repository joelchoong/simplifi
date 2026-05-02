import React from "react";
import { Activity, TrendingUp, WalletCards, ReceiptText, UserCircle, Edit3, Upload } from "lucide-react";
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

import { cn } from "@/shared/lib/utils";

export const HeaderBar: React.FC<HeaderBarProps> = ({ currentView, setCurrentView, avatarUrl, fullName }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMoneyHealthActive = ["/money-health", "/improve"].includes(location.pathname);
  const isFinancialRecordsActive = location.pathname === "/financial-records";
  const getPageTitle = () => {
    if (location.pathname === "/profile") return "Profile";
    if (location.pathname === "/financial-records") {
      const searchParams = new URLSearchParams(location.search);
      return searchParams.get("tab") === "my-tax" ? "MyTax" : "Net Worth";
    }
    if (location.pathname === "/billing") return "Billing";
    return "";
  };

  const pageTitle = getPageTitle();

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border/40">
      <div className="w-full px-4 sm:px-6 py-2 sm:py-0 min-h-[56px] sm:h-16 flex flex-col sm:flex-row items-start sm:items-center justify-between relative">
        {/* Far Left: Logo & Mobile Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-3 w-full sm:w-auto">
          <Link to="/money-health" className="flex items-center group">
            <img
              src={logo}
              alt="SimpliFi Logo"
              className="w-auto h-12 sm:h-16 object-contain transition-transform group-hover:scale-105"
            />
          </Link>
          {/* Mobile Page Title or Greeting */}
          <div className="flex items-center justify-between w-full sm:w-auto mt-1 mb-1">
            <h1 className="text-2xl font-black text-foreground sm:hidden tracking-tight flex items-center gap-2">
              {isMoneyHealthActive ? (
                `Hi, ${fullName?.split(' ')[0] || 'there'} 👋`
              ) : (
                <>
                  {pageTitle === "Net Worth" && <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600"><WalletCards className="w-4 h-4" /></div>}
                  {pageTitle === "MyTax" && <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600"><ReceiptText className="w-4 h-4" /></div>}
                  {pageTitle === "Profile" && <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600"><UserCircle className="w-4 h-4" /></div>}
                  {pageTitle}
                </>
              )}
            </h1>

            {/* Mobile-only page actions (aligned to title) */}
            {!isMoneyHealthActive && (
              <div className="sm:hidden flex items-center gap-2">
                {pageTitle === "Net Worth" && (
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('simplifi-open-update-records'))}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-sm transition-transform active:scale-95"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                )}
                {pageTitle === "MyTax" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.dispatchEvent(new CustomEvent('simplifi-open-tax-receipts-list'))}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600 border border-emerald-500/30 shadow-sm transition-transform active:scale-95"
                    >
                      <ReceiptText className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => window.dispatchEvent(new CustomEvent('simplifi-open-upload-receipts'))}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-sm transition-transform active:scale-95"
                    >
                      <Upload className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Center: Primary Navigation */}
        <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-5">
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

        {/* Far Right: Avatar Menu (Desktop Only) */}
        <div className="hidden sm:flex items-center gap-3">
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
