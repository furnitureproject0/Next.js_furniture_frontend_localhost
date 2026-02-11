"use client";

import { useState, useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/selectors";
import WorkerStatsCards from "@/components/worker/WorkerStatsCards";
import AssignmentsList from "@/components/employee/AssignmentsList";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useTranslation } from "@/hooks/useTranslation";
import { useAssignments } from "@/hooks/useAssignments";
import { useSearchParams } from "next/navigation";

export default function WorkerDashboard() {
	const { t } = useTranslation();
	const user = useAppSelector(selectUser);
	const searchParams = useSearchParams();
	const { assignments, isLoading, refetch } = useAssignments();
	const [openOrderId, setOpenOrderId] = useState(null);

	// Check for openOrder query parameter
	useEffect(() => {
		const orderIdParam = searchParams.get('openOrder');
		if (orderIdParam) {
			const orderId = parseInt(orderIdParam, 10);
			if (orderId && assignments.length > 0) {
				// Find assignment with matching order_id
				const assignment = assignments.find(a => {
					const order = a.offer?.orderService?.order;
					return order && order.id === orderId;
				});
				if (assignment && openOrderId !== orderId) {
					setOpenOrderId(orderId);
					// Remove query parameter from URL without reload
					window.history.replaceState({}, '', '/worker/dashboard');
				}
			}
		} else if (openOrderId !== null) {
			// Clear openOrderId if query parameter is removed
			setOpenOrderId(null);
		}
	}, [searchParams]);

	const handleStatusChange = () => {
		refetch();
	};

	if (isLoading) {
		return <LoadingSpinner />;
	}

	return (
		<div className="min-h-screen" style={{ background: "#FFF8F3" }}>
			<div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8">
				{/* Page Header */}
				<div className="mb-4 sm:mb-6 lg:mb-8">
					<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
						<div className="flex-1 min-w-0">
							<h1 className="text-2xl sm:text-3xl font-bold text-amber-900 mb-1 sm:mb-2">
								{t("dashboards.worker.title") || "Worker Dashboard"}
							</h1>
							<p className="text-sm sm:text-base text-amber-700/70">
								{t("dashboards.worker.subtitle") || "Manage your job assignments and tasks"}
							</p>
						</div>
						{/* User Info */}
						<div className="flex sm:flex-col sm:text-right gap-4 sm:gap-0">
							<div className="flex items-center gap-2 sm:gap-3 sm:mb-2">
								<svg
									className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 flex-shrink-0"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
									/>
								</svg>
								<div>
									<p className="text-xs sm:text-sm text-orange-600/60">
										{t("dashboards.worker.rating") || "Rating"}
									</p>
									<p className="text-xl sm:text-2xl font-bold text-amber-900">
										4.8
									</p>
								</div>
							</div>
							<div className="flex flex-wrap gap-1.5 sm:gap-2">
								<span className="px-2 sm:px-3 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full border border-orange-200 whitespace-nowrap">
									{t("dashboards.worker.furnitureAssembly") || "Furniture Assembly"}
								</span>
								<span className="px-2 sm:px-3 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full border border-orange-200 whitespace-nowrap">
									{t("dashboards.worker.packing") || "Packing"}
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Stats Cards */}
				<WorkerStatsCards assignments={assignments} />

				{/* Assignments List */}
				<div>
					<h2 className="text-lg sm:text-xl font-semibold text-amber-900 mb-3 sm:mb-4">
						{t("employee.assignments.title") || "My Assignments"}
					</h2>
					<AssignmentsList
						assignments={assignments}
						onStatusChange={handleStatusChange}
						role="worker"
						openOrderId={openOrderId}
						onOrderModalClose={() => {
							setOpenOrderId(null);
						}}
					/>
				</div>
			</div>
		</div>
	);
}

