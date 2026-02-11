"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { getTranslatedStatusLabel } from "@/utils/i18nUtils";
import { getTranslatedServiceTypes } from "@/utils/i18nUtils";

export default function OrderFilters({
	statusFilter,
	setStatusFilter,
	serviceFilter,
	setServiceFilter,
}) {
	const { t } = useTranslation();
	const statuses = [
		{ value: "all", label: t("superAdmin.filters.allStatuses") },
		{ value: "pending", label: getTranslatedStatusLabel("pending", t) },
		{ value: "assigned", label: getTranslatedStatusLabel("assigned", t) },
		{ value: "scheduled", label: getTranslatedStatusLabel("scheduled", t) },
		{ value: "in-progress", label: getTranslatedStatusLabel("in_progress", t) },
		{ value: "completed", label: getTranslatedStatusLabel("completed", t) },
		{ value: "cancelled", label: getTranslatedStatusLabel("cancelled", t) },
	];

	const translatedServices = getTranslatedServiceTypes(t);
	const services = [
		{ value: "all", label: t("superAdmin.filters.allServices") },
		{ value: "furniture_moving", label: translatedServices.find(s => s.id === "furniture_moving")?.name || "Moving" },
		{ value: "cleaning_service", label: translatedServices.find(s => s.id === "cleaning_service")?.name || "Cleaning" },
		{ value: "painting", label: translatedServices.find(s => s.id === "painting")?.name || "Painting" },
		{ value: "packing", label: translatedServices.find(s => s.id === "packing")?.name || "Assembly" },
	];

	return (
		<div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
			<div className="relative">
				<select
					value={statusFilter}
					onChange={(e) => setStatusFilter(e.target.value)}
					className="appearance-none px-3 py-2 sm:px-4 sm:py-3 pr-8 sm:pr-10 bg-white border border-orange-200/60 rounded-lg sm:rounded-xl text-sm sm:text-base text-amber-900 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-300 cursor-pointer w-full sm:w-auto min-w-[120px] sm:min-w-[150px]"
				>
					{statuses.map((status) => (
						<option key={status.value} value={status.value}>
							{status.label}
						</option>
					))}
				</select>
				<svg
					className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-amber-600/50 pointer-events-none"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</div>

			<div className="relative">
				<select
					value={serviceFilter}
					onChange={(e) => setServiceFilter(e.target.value)}
					className="appearance-none px-3 py-2 sm:px-4 sm:py-3 pr-8 sm:pr-10 bg-white border border-orange-200/60 rounded-lg sm:rounded-xl text-sm sm:text-base text-amber-900 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-300 cursor-pointer w-full sm:w-auto min-w-[120px] sm:min-w-[150px]"
				>
					{services.map((service) => (
						<option key={service.value} value={service.value}>
							{service.label}
						</option>
					))}
				</select>
				<svg
					className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-amber-600/50 pointer-events-none"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</div>
		</div>
	);
}

