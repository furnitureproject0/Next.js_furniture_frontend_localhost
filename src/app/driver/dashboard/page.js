"use client";

import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/selectors";
import DriverStatsCards from "@/components/driver/DriverStatsCards";
import AssignmentsList from "@/components/employee/AssignmentsList";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useTranslation } from "@/hooks/useTranslation";
import { useAssignments } from "@/hooks/useAssignments";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function DriverDashboard() {
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
					window.history.replaceState({}, '', '/driver/dashboard');
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
					<h1 className="text-2xl sm:text-3xl font-bold text-amber-900 mb-1 sm:mb-2">
						{t("dashboards.driver.title") || "Driver Dashboard"}
					</h1>
					<p className="text-sm sm:text-base text-amber-700/70">
						{t("dashboards.driver.subtitle") || "Manage your delivery assignments and tasks"}
					</p>
				</div>

				{/* Stats Cards */}
				<DriverStatsCards assignments={assignments} />

				{/* Assignments List */}
				<div>
					<h2 className="text-lg sm:text-xl font-semibold text-amber-900 mb-3 sm:mb-4">
						{t("employee.assignments.title") || "My Assignments"}
					</h2>
					<AssignmentsList
						assignments={assignments}
						onStatusChange={handleStatusChange}
						role="driver"
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

