"use client";

import { useState, useEffect } from "react";
import { AdminAuth } from "@/components/admin/AdminAuth";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default function CmdCenterPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const token = sessionStorage.getItem("admin_auth");
        if (token) {
            const elapsed = Date.now() - parseInt(token, 10);
            if (elapsed < 4 * 60 * 60 * 1000) {
                setIsAuthenticated(true);
            } else {
                sessionStorage.removeItem("admin_auth");
            }
        }
        setIsChecking(false);
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem("admin_auth");
        setIsAuthenticated(false);
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