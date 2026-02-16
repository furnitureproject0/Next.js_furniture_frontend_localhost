"use client";

import OrderServiceCompanyAssignmentModal from "@/components/modals/OrderServiceCompanyAssignmentModal";
import SiteAdminOrdersList from "@/components/site-admin/SiteAdminOrdersList";
import SiteAdminStatsCards from "@/components/site-admin/SiteAdminStatsCards";
import { useTranslation } from "@/hooks/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/selectors";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SiteAdminDashboard() {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const user = useAppSelector(selectUser);
	const router = useRouter();
	const [isAssignCompanyModalOpen, setIsAssignCompanyModalOpen] =
		useState(false);
	const [selectedOrderForAssignment, setSelectedOrderForAssignment] =
		useState(null);
	const [refreshTrigger, setRefreshTrigger] = useState(0);

	const handleAssignCompany = (order) => {
		setSelectedOrderForAssignment(order);
		setIsAssignCompanyModalOpen(true);
	};

	const handleCompanyAssignmentComplete = () => {
		// Refresh orders or close modal
		setIsAssignCompanyModalOpen(false);
		setSelectedOrderForAssignment(null);
	};

	return (
		<div className="min-h-screen" style={{ background: "#FFF8F3" }}>
			<div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8">
				{/* Page Header */}
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6 lg:mb-8">
					<div>
						<h1 className="text-2xl sm:text-3xl font-bold text-amber-900 mb-1 sm:mb-2">
							{t("siteAdmin.dashboard.title")}
						</h1>
						<p className="text-sm sm:text-base text-amber-700/70">
							{t("siteAdmin.dashboard.subtitle")}
						</p>
					</div>
					<button
						onClick={() => router.push("/site-admin/create-order")}
						className="w-full sm:w-auto btn-primary px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
					>
						<svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
						</svg>
						<span className="whitespace-nowrap">{t("siteAdmin.dashboard.createOrder") || "Create Order"}</span>
					</button>
				</div>

				{/* Stats Cards */}
				<SiteAdminStatsCards />

				{/* Orders List */}
				<SiteAdminOrdersList
					onAssignCompany={handleAssignCompany}
					refreshTrigger={refreshTrigger}
				/>
			</div>

			{/* Modals */}
			<OrderServiceCompanyAssignmentModal
				isOpen={isAssignCompanyModalOpen}
				onClose={() => {
					setIsAssignCompanyModalOpen(false);
					setSelectedOrderForAssignment(null);
				}}
				order={selectedOrderForAssignment}
				onAssignComplete={handleCompanyAssignmentComplete}
			/>
		</div>
	);
}
