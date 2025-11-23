import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings, LogOut, User } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";

export default function PageHeader({
    showBackButton = true,
    backTo = "Home",
    title,
    actions
}) {
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleLogout = async () => {
        await base44.auth.logout();
    };

    const getUserInitials = () => {
        if (!user?.displayName) return "U";
        const names = user.displayName.split(" ");
        if (names.length >= 2) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return user.displayName[0].toUpperCase();
    };

    return (
        <div className="flex-none p-4 md:p-8 pb-4 border-b border-border bg-background/95 backdrop-blur z-50">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                    {showBackButton && (
                        <Button
                            variant="ghost"
                            onClick={() => navigate(createPageUrl(backTo))}
                            className="text-gray-400 hover:text-foreground"
                        >
                            <ArrowLeft className="w-3 h-3 mr-2" />
                            Voltar
                        </Button>
                    )}

                    {!showBackButton && (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                                <span className="text-white font-bold text-sm">CC</span>
                            </div>
                            <span className="font-headline text-lg font-bold text-foreground">
                                Crônicas Carmesim
                            </span>
                        </div>
                    )}

                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="flex items-center gap-2 hover:bg-secondary"
                            >
                                <Avatar className="w-8 h-8">
                                    <AvatarImage src={user?.photoURL} alt={user?.displayName} />
                                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                        {getUserInitials()}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="hidden md:inline text-sm text-foreground">
                                    {user?.displayName || user?.email}
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-card border-border">
                            <div className="px-2 py-1.5">
                                <p className="text-sm font-medium text-foreground">{user?.displayName}</p>
                                <p className="text-xs text-gray-400">{user?.email}</p>
                            </div>
                            <DropdownMenuSeparator className="bg-border" />
                            <DropdownMenuItem
                                onClick={() => navigate(createPageUrl("Settings"))}
                                className="cursor-pointer text-foreground hover:bg-secondary"
                            >
                                <Settings className="w-4 h-4 mr-2" />
                                Configurações
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border" />
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="cursor-pointer text-red-400 hover:bg-red-950/30 hover:text-red-300"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Sair
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Optional Title and Actions */}
                {(title || actions) && (
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        {title && (
                            <h1 className="font-headline text-3xl md:text-4xl font-bold text-foreground">
                                {title}
                            </h1>
                        )}
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
}
