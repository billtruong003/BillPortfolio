"use client";

import { useState, useEffect } from "react";
import { AdminAuth } from "@/components/admin/AdminAuth";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { checkAuthStatus, logoutAdmin } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

export default function CmdCenterPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const verifySession = async () => {
            const status = await checkAuthStatus();
            setIsAuthenticated(status);
            setIsChecking(false);
        };
        verifySession();
    }, []);

    const handleLogout = async () => {
        await logoutAdmin();
        setIsAuthenticated(false);
        router.push("/");
    };

    if (isChecking) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <AdminAuth onAuthenticated={() => setIsAuthenticated(true)} />;
    }

    return <AdminDashboard onLogout={handleLogout} />;
}