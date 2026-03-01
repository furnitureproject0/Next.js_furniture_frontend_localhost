"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

export default function OrdersRedirectPage() {
    const router = useRouter();
    const user = useSelector((state) => state.auth.user);

    useEffect(() => {
        if (!user) {
            router.push("/login");
            return;
        }

        // Route based on user role
        const roleRoutes = {
            site_admin: "/site-admin/orders",
            company_admin: "/company-admin/orders",
            company_secretary: "/company-admin/orders",
            client: "/client/orders",
            worker: "/worker/orders",
            driver: "/driver/orders",
        };

        const targetPath = roleRoutes[user.role] || "/dashboard";
        router.push(targetPath);
    }, [user, router]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-16 w-16 sm:h-24 sm:w-24 lg:h-32 lg:w-32 border-b-2 border-primary-500"></div>
        </div>
    );
}
