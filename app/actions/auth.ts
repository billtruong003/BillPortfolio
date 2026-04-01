"use server";

import { cookies } from "next/headers";
import crypto from "crypto";

export async function authenticateAdmin(password: string) {
    const expectedHash = process.env.ADMIN_HASH;

    if (!expectedHash) {
        return { success: false, error: "SYSTEM_ERROR // Admin hash not configured in ENV" };
    }

    const inputHash = crypto.createHash("sha256").update(password).digest("hex");

    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

    if (inputHash === expectedHash.toLowerCase()) {
        cookies().set("admin_session", "authenticated", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 4
        });
        return { success: true };
    }

    return { success: false, error: "AUTH_FAILED // Invalid credentials" };
}

export async function logoutAdmin() {
    cookies().delete("admin_session");
}

export async function checkAuthStatus() {
    const session = cookies().get("admin_session");
    return session?.value === "authenticated";
}