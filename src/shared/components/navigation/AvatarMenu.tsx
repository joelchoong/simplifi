import React, { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { User, CreditCard, LogOut, MessageSquare } from "lucide-react";
import { useAuth } from "@/features/auth/data/useAuth";
import { FeedbackModal } from "@/shared/components/feedback/FeedbackModal";

interface AvatarMenuProps {
    src: string | null;
    name: string | null;
    isActive?: boolean;
    onSettings: () => void;
    onBilling: () => void;
}

const AvatarMenu: React.FC<AvatarMenuProps> = ({
    src,
    name,
    isActive,
    onSettings,
    onBilling,
}) => {
    const { signOut } = useAuth();
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

    const initials = name
        ? name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase()
        : "U";

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className={`relative h-10 w-10 rounded-full ${isActive ? "ring-2 ring-emerald-500 ring-offset-2" : ""
                            }`}
                    >
                        <Avatar className="h-10 w-10 border border-emerald-200">
                            <AvatarImage src={src || ""} alt={name || "User"} />
                            <AvatarFallback className="bg-emerald-500 text-white font-medium">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{name || "User"}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                                Manage your account
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onSettings}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onBilling}>
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Billing</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsFeedbackOpen(true)}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        <span>Feedback</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <FeedbackModal
                open={isFeedbackOpen}
                onOpenChange={setIsFeedbackOpen}
            />
        </>
    );
};

export default AvatarMenu;
