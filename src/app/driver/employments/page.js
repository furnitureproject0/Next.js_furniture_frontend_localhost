"use client";

import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/selectors";
import EmploymentsList from "@/components/employee/EmploymentsList";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useTranslation } from "@/hooks/useTranslation";
import { useEmployments } from "@/hooks/useEmployments";

export default function DriverEmploymentsPage() {
	const { t } = useTranslation();
	const user = useAppSelector(selectUser);
	const { employments, isLoading, refetch } = useEmployments();

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
						{t("employee.employments.title") || "My Employments"}
					</h1>
					<p className="text-sm sm:text-base text-amber-700/70">
						{t("employee.employments.subtitle") || "View and manage your employment offers"}
					</p>
				</div>

				{/* Employments List */}
				<div>
					<EmploymentsList
						employments={employments}
						onStatusChange={handleStatusChange}
						role="driver"
					/>
				</div>
			</div>
		</div>
	);
}

