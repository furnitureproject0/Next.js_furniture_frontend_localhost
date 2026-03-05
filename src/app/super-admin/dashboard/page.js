"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import CompanyManagement from "@/components/super-admin/CompanyManagement";
import UserManagement from "@/components/super-admin/UserManagement";
import OrderManagement from "@/components/super-admin/OrderManagement";
import { useTranslation } from "@/hooks/useTranslation";
import { fetchAllUsers } from "@/store/slices/usersSlice";
import { fetchAllCompanies } from "@/store/slices/companiesSlice";
import { fetchSiteAdminOrders } from "@/store/slices/ordersSlice";

const TabButton = ({ active, onClick, icon, children, id }) => (
    <button
        id={`tab-${id}`}
        onClick={onClick}
        className={`relative flex items-center gap-2.5 px-6 py-4 text-sm font-bold transition-all duration-500 z-10 ${
            active
                ? "text-primary-600 scale-105"
                : "text-slate-500 hover:text-slate-800 hover:bg-primary-50/20"
        }`}
    >
        <span className={`transition-transform duration-500 ${active ? 'scale-110 rotate-3' : ''}`}>
            {icon}
        </span>
        <span className="whitespace-nowrap uppercase tracking-wider text-[11px]">{children}</span>
        {active && (
            <div className="absolute inset-0 bg-primary-50/40 rounded-t-xl -z-10 animate-fade-in"></div>
        )}
    </button>
);

export default function SuperAdminDashboard() {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const searchParams = useSearchParams();
    const tabParam = searchParams.get("tab");
    
    const [activeTab, setActiveTab] = useState(tabParam || "users");
    const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0 });

    // Handle tab slider animation
    useEffect(() => {
        const activeBtn = document.getElementById(`tab-${activeTab}`);
        if (activeBtn) {
            setSliderStyle({
                left: activeBtn.offsetLeft,
                width: activeBtn.offsetWidth
            });
        }
    }, [activeTab]);

    // Update active tab when URL param changes
    useEffect(() => {
        if (tabParam && ["users", "orders", "companies"].includes(tabParam)) {
            setActiveTab(tabParam);
        } else if (!tabParam) {
            setActiveTab("users");
        }
    }, [tabParam]);

    // Fetch all data from the backend on mount so data persists across refreshes
    useEffect(() => {
        dispatch(fetchAllUsers());
        dispatch(fetchAllCompanies());
        dispatch(fetchSiteAdminOrders());
    }, [dispatch]);

    return (
        // تم إزالة overflow-hidden من الحاوية الرئيسية لمنع قطع المودال
        <div className="min-h-screen relative" style={{ background: "#F8FAFC" }}>
            {/* Dynamic Animated Background Mesh */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-400/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
                <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-blue-400/5 rounded-full blur-[80px] animate-bounce-subtle"></div>
            </div>

            <div className="relative p-4 sm:p-6 lg:p-8 z-10">
                {/* Page Header */}
                <div className="mb-4 sm:mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1 sm:mb-2">
                        {t("dashboards.superAdmin.title")}
                    </h1>
                    <p className="text-sm sm:text-base text-slate-600/70">
                        {t("dashboards.superAdmin.subtitle")}
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white/90 backdrop-blur-md rounded-t-2xl border border-primary-200/50 shadow-xl overflow-x-auto sm:overflow-visible">
                    <div className="relative flex border-b border-primary-100 min-w-max sm:min-w-0">
                        {/* Sliding Underline */}
                        <div 
                            className="absolute bottom-0 h-1 bg-gradient-to-r from-primary-500 to-indigo-600 transition-all duration-500 ease-out z-20 rounded-full"
                            style={{ left: sliderStyle.left, width: sliderStyle.width }}
                        ></div>

                        <TabButton
                            id="users"
                            active={activeTab === "users"}
                            onClick={() => setActiveTab("users")}
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            }
                        >
                            {t("dashboards.superAdmin.users")}
                        </TabButton>
                        <TabButton
                            id="orders"
                            active={activeTab === "orders"}
                            onClick={() => setActiveTab("orders")}
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            }
                        >
                            {t("dashboards.superAdmin.orders")}
                        </TabButton>
                        <TabButton
                            id="companies"
                            active={activeTab === "companies"}
                            onClick={() => setActiveTab("companies")}
                            icon={
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                    <path d="M12 11h.01" />
                                    <path d="M12 16h.01" />
                                    <path d="M8 11h.01" />
                                    <path d="M8 16h.01" />
                                    <path d="M16 11h.01" />
                                    <path d="M16 16h.01" />
                                </svg>
                            }
                        >
                            {t("dashboards.superAdmin.companies")}
                        </TabButton>
                    </div>
                </div>

                {/* Tab Content - تم إزالة الأنيميشن والـ overflow-hidden من هنا لتجنب حبس المودال */}
                <div className="bg-white/95 backdrop-blur-md rounded-b-2xl border border-t-0 border-primary-200/50 shadow-2xl min-h-[400px]">
                    <div key={activeTab}>
                        {activeTab === "users" && <UserManagement />}
                        {activeTab === "orders" && <OrderManagement />}
                        {activeTab === "companies" && <CompanyManagement />}
                    </div>
                </div>
            </div>
        </div>
    );
}