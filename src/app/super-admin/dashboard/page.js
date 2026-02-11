"use client";

import { useState } from "react";
import CompanyManagement from "@/components/super-admin/CompanyManagement";
import UserManagement from "@/components/super-admin/UserManagement";
import OrderManagement from "@/components/super-admin/OrderManagement";
import { useTranslation } from "@/hooks/useTranslation";

const TabButton = ({ active, onClick, icon, children }) => (
	<button
		onClick={onClick}
		className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 text-xs sm:text-sm font-medium transition-all duration-200 border-b-2 ${
			active
				? "border-orange-500 text-orange-600 bg-orange-50/50"
				: "border-transparent text-amber-700 hover:text-amber-900 hover:bg-orange-50/30"
		}`}
	>
		{icon}
		{children}
	</button>
);

export default function SuperAdminDashboard() {
	const { t } = useTranslation();
	const [activeTab, setActiveTab] = useState("users");

	return (
		<div className="min-h-screen" style={{ background: "#FFF8F3" }}>
			<div className="p-4 sm:p-6 lg:p-8">
				{/* Page Header */}
				<div className="mb-4 sm:mb-6">
					<h1 className="text-2xl sm:text-3xl font-bold text-amber-900 mb-1 sm:mb-2">
						{t("dashboards.superAdmin.title")}
					</h1>
					<p className="text-sm sm:text-base text-amber-700/70">
						{t("dashboards.superAdmin.subtitle")}
					</p>
				</div>

				{/* Tab Navigation */}
				<div className="bg-white/80 backdrop-blur-sm rounded-t-xl border border-orange-200/60 shadow-sm overflow-x-auto">
					<div className="flex border-b border-orange-200/40 min-w-max sm:min-w-0">
						<TabButton
							active={activeTab === "users"}
							onClick={() => setActiveTab("users")}
							icon={
								<svg
									className="w-4 h-4 sm:w-5 sm:h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
									/>
								</svg>
							}
						>
							<span className="whitespace-nowrap">{t("dashboards.superAdmin.users")}</span>
						</TabButton>
						<TabButton
							active={activeTab === "orders"}
							onClick={() => setActiveTab("orders")}
							icon={
								<svg
									className="w-4 h-4 sm:w-5 sm:h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
									/>
								</svg>
							}
						>
							<span className="whitespace-nowrap">{t("dashboards.superAdmin.orders")}</span>
						</TabButton>
						<TabButton
							active={activeTab === "companies"}
							onClick={() => setActiveTab("companies")}
							icon={
								<svg
									className="w-4 h-4 sm:w-5 sm:h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
									/>
								</svg>
							}
						>
							<span className="whitespace-nowrap">{t("dashboards.superAdmin.companies")}</span>
						</TabButton>
						<TabButton
							active={activeTab === "settings"}
							onClick={() => setActiveTab("settings")}
							icon={
								<svg
									className="w-4 h-4 sm:w-5 sm:h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
									/>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
									/>
								</svg>
							}
						>
							<span className="whitespace-nowrap">{t("dashboards.superAdmin.settings")}</span>
						</TabButton>
					</div>
				</div>

				{/* Tab Content */}
				<div className="bg-white/80 backdrop-blur-sm rounded-b-xl border border-t-0 border-orange-200/60 shadow-sm">
					{activeTab === "users" && <UserManagement />}
					{activeTab === "orders" && <OrderManagement />}
					{activeTab === "companies" && <CompanyManagement />}
					{activeTab === "settings" && (
						<div className="p-4 sm:p-6 lg:p-8">
							<p className="text-sm sm:text-base text-amber-700/70">
								{t("dashboards.superAdmin.settingsComingSoon")}
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

