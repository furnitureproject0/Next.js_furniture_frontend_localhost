"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import EmploymentCard from "./EmploymentCard";
import EmploymentDetailModal from "./EmploymentDetailModal";

export default function EmploymentsList({ employments, onStatusChange, role = "worker" }) {
	const { t } = useTranslation();
	const [selectedEmployment, setSelectedEmployment] = useState(null);

	// Use cream/orange theme to match project theme
	const themeColors = {
		primaryBorder: "border-orange-200/40",
		primaryText: "text-amber-900",
		secondaryText: "text-amber-700/70",
	};

	if (!employments || employments.length === 0) {
		return (
			<div className={`bg-white border ${themeColors.primaryBorder} rounded-xl p-8 sm:p-12 text-center`}>
				<div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
					<svg
						className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
						/>
					</svg>
				</div>
				<h3 className={`text-lg sm:text-xl font-semibold ${themeColors.primaryText} mb-1 sm:mb-2`}>
					{t("employee.employments.noEmployments") || "No employments yet"}
				</h3>
				<p className={`text-sm sm:text-base ${themeColors.secondaryText}`}>
					{t("employee.employments.noEmploymentsDescription") || "You haven't received any employment offers yet. New employment offers will appear here."}
				</p>
			</div>
		);
	}

	return (
		<>
			<div className="grid grid-cols-1 gap-4 sm:gap-5 lg:gap-6">
				{employments.map((employment) => (
					<EmploymentCard
						key={employment.id}
						employment={employment}
						onStatusChange={onStatusChange}
						onViewDetails={setSelectedEmployment}
						role={role}
					/>
				))}
			</div>

			{/* Employment Detail Modal */}
			{selectedEmployment && (
				<EmploymentDetailModal
					isOpen={!!selectedEmployment}
					onClose={() => setSelectedEmployment(null)}
					employment={selectedEmployment}
					role={role}
					onStatusChange={onStatusChange}
				/>
			)}
		</>
	);
}

