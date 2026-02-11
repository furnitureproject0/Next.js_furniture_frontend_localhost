"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import CalendarDatePicker from "./CalendarDatePicker";
import { servicesApi } from "@/lib/api";



export default function SiteAdminOrdersFilter({ 
	onFilterChange,
	initialFilters = {} 
}) {
	const { t, currentLanguage } = useTranslation();
	const isRTL = currentLanguage === 'ar';
	
	const [filters, setFilters] = useState({
		status: initialFilters.status || "all", 
		search: initialFilters.search || "",
		selectedDate: initialFilters.selectedDate || null,
		service_id: initialFilters.service_id || "all",
	});

	const [services, setServices] = useState([]);
	const [isLoadingServices, setIsLoadingServices] = useState(false);

	useEffect(() => {
		const fetchServices = async () => {
			setIsLoadingServices(true);
			try {
				const response = await servicesApi.getServices();
				if (response?.success && Array.isArray(response.data?.services)) {
					setServices(response.data.services);
				}
			} catch (error) {
				console.error("Failed to load services:", error);
			} finally {
				setIsLoadingServices(false);
			}
		};

		fetchServices();
	}, []);

	const updateFilter = (key, value) => {
		const newFilters = { ...filters, [key]: value };
		setFilters(newFilters);
		onFilterChange(newFilters);
	};

	const handleDateSelect = (date) => {
		updateFilter("selectedDate", date);
	};

	// Define statuses with translation keys
	const orderStatuses = [
		{ value: "all", label: t("common.status.allActive") || "All Active" },
		{ value: "pending", label: t("common.status.pending") || "Pending" },
		{ value: "assigned", label: t("common.status.assigned") || "Assigned" },
		{ value: "in_progress", label: t("common.status.inProgress") || "In Progress" },
		{ value: "completed", label: t("common.status.completed") || "Completed" },
		{ value: "cancelled", label: t("common.status.cancelled") || "Cancelled" },
	];

	return (
		<div className="space-y-4">
			{/* Calendar Date Picker - Full Width */}
			<div className="w-full">
				<label className="text-xs font-medium text-amber-600/70 uppercase tracking-wide mb-1.5 block">
					{t("calendar.filterByDate") || "Filter by Date"}
				</label>
				<CalendarDatePicker
					selectedDate={filters.selectedDate}
					onDateSelect={handleDateSelect}
					className="w-full"
				/>
			</div>

			{/* Search Bar - Full Width */}
			<div className="relative w-full">
				<label className="text-xs font-medium text-amber-600/70 uppercase tracking-wide mb-1.5 block">
					{t("siteAdmin.filters.search") || "Search"}
				</label>
				<div className="relative">
					<svg
						className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400`}
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
					<input
						type="text"
						value={filters.search}
						onChange={(e) => updateFilter("search", e.target.value)}
						placeholder={t("siteAdmin.filters.searchPlaceholder") || "ID, Name, Address..."}
						className={`w-full ${isRTL ? 'pr-10 pl-10' : 'pl-10 pr-10'} py-2.5 text-sm border border-orange-200/60 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white/80`}
						dir={isRTL ? 'rtl' : 'ltr'}
					/>
					{filters.search && (
						<button
							onClick={() => updateFilter("search", "")}
							className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer`}
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					)}
				</div>
			</div>

			{/* Status and Service Filters - Side by Side */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				{/* Status Filter */}
				<div>
					<label className="text-xs font-medium text-amber-600/70 uppercase tracking-wide mb-1.5 block">
						{t("siteAdmin.filters.status") || "Status"}
					</label>
					<select
						value={filters.status}
						onChange={(e) => updateFilter("status", e.target.value)}
						className="w-full py-2.5 px-3 text-sm border border-orange-200/60 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white/80 text-amber-900 cursor-pointer"
					>
						{orderStatuses.map(status => (
							<option key={status.value} value={status.value}>
								{status.label}
							</option>
						))}
					</select>
				</div>

				{/* Service Filter */}
				<div>
					<label className="text-xs font-medium text-amber-600/70 uppercase tracking-wide mb-1.5 block">
						{t("siteAdmin.filters.service") || "Service"}
					</label>
					<select
						value={filters.service_id}
						onChange={(e) => updateFilter("service_id", e.target.value)}
						disabled={isLoadingServices}
						className="w-full py-2.5 px-3 text-sm border border-orange-200/60 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white/80 text-amber-900 disabled:opacity-50 cursor-pointer"
					>
						<option value="all">{t("common.allServices") || "All Services"}</option>
						{services.map(service => (
							<option key={service.id} value={service.id}>
								{service.name}
							</option>
						))}
					</select>
				</div>
			</div>
		</div>
	);
}
