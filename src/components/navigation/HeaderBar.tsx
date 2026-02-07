import React from 'react';
import { Sparkles } from 'lucide-react';
import AvatarMenu from './AvatarMenu';
import { useNavigate, Link } from 'react-router-dom';
import logo from '@/assets/logo.png';
import { Input } from '@/components/ui/input';

export type View = 'classification' | 'retirement' | 'settings' | 'billing';

interface HeaderBarProps {
    currentView: View;
    setCurrentView: (v: View) => void;
    avatarUrl: string | null;
    fullName: string | null;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
    currentView,
    setCurrentView,
    avatarUrl,
    fullName,
}) => {
    const navigate = useNavigate();

    return (
        <header className="sticky top-0 z-10 w-full bg-background">
            <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
                {/* Row 1: Header (Logo & Avatar) */}
                <Link to="/dashboard" className="flex items-center">
                    <img
                        src={logo}
                        alt="SimpliFi Logo"
                        className="w-12 h-12 object-contain"
                    />
                </Link>

                <AvatarMenu
                    src={avatarUrl}
                    name={fullName}
                    isActive={['settings', 'billing'].includes(currentView)}
                    onSettings={() => {
                        setCurrentView('settings');
                        navigate('/financial-journey?tab=settings');
                    }}
                    onBilling={() => {
                        setCurrentView('billing');
                        navigate('/financial-journey?tab=billing');
                    }}
                />
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
        </header >
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
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active
            ? 'bg-green-500 text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
        aria-current={active ? 'page' : undefined}
    >
        {icon}
        {label}
    </button>
);

export default HeaderBar;
