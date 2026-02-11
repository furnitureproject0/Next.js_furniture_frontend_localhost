"use client";

import { useState, useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { getTranslatedStatusLabel, getTranslatedServiceTypes } from "@/utils/i18nUtils";

export default function CustomerOrdersFilter({ 
	orders = [], 
	onFilterChange,
	initialFilters = {} 
}) {
	const { t } = useTranslation();
	const [showAdvanced, setShowAdvanced] = useState(false);
	
	const [filters, setFilters] = useState({
		orderStatus: initialFilters.orderStatus || "all",
		offerStatus: initialFilters.offerStatus || "all",
		serviceType: initialFilters.serviceType || "all",
		search: initialFilters.search || "",
		dateFrom: initialFilters.dateFrom || "",
		dateTo: initialFilters.dateTo || "",
		preferredDateFrom: initialFilters.preferredDateFrom || "",
		preferredDateTo: initialFilters.preferredDateTo || "",
	});

	// Get all service types from orders
	const serviceTypes = useMemo(() => {
		const TRANSLATED_SERVICE_TYPES = getTranslatedServiceTypes(t);
		const serviceSet = new Set();
		orders.forEach(order => {
			if (order.servicesDetails && Array.isArray(order.servicesDetails)) {
				order.servicesDetails.forEach(service => {
					if (service.id) serviceSet.add(service.id);
				});
			} else if (Array.isArray(order.services)) {
				order.services.forEach(serviceId => {
					if (serviceId) serviceSet.add(serviceId);
				});
			}
		});
		return Array.from(serviceSet).map(id => {
			const service = TRANSLATED_SERVICE_TYPES.find(s => s.id === id);
			return {
				id,
				name: service?.name || `Service ${id}`
			};
		});
	}, [orders, t]);

	// Count orders by status
	const orderStatusCounts = useMemo(() => {
		const counts = {
			all: orders.length,
			pending: 0,
			assigned: 0,
			in_progress: 0,
			completed: 0,
			cancelled: 0,
		};
		orders.forEach(order => {
			if (counts[order.status] !== undefined) {
				counts[order.status]++;
			}
		});
		return counts;
	}, [orders]);

	const offerStatusCounts = useMemo(() => {
		const counts = {
			all: orders.length,
			offer_sent: 0,
			offer_accepted: 0,
			offer_rejected: 0,
		};
		orders.forEach(order => {
			if (counts[order.status] !== undefined) {
				counts[order.status]++;
			}
		});
		return counts;
	}, [orders]);

	const updateFilter = (key, value) => {
		const newFilters = { ...filters, [key]: value };
		setFilters(newFilters);
		onFilterChange(newFilters);
	};

	const handleClearFilters = () => {
		const defaultFilters = {
			orderStatus: "all",
			offerStatus: "all",
			serviceType: "all",
			search: "",
			dateFrom: "",
			dateTo: "",
			preferredDateFrom: "",
			preferredDateTo: "",
		};
		setFilters(defaultFilters);
		onFilterChange(defaultFilters);
	};

	const hasActiveFilters = 
		filters.orderStatus !== "all" || 
		filters.offerStatus !== "all" || 
		filters.serviceType !== "all" ||
		filters.search !== "" ||
		filters.dateFrom !== "" ||
		filters.dateTo !== "" ||
		filters.preferredDateFrom !== "" ||
		filters.preferredDateTo !== "";

	return (
		<div className="space-y-4">
			{/* Search Bar */}
			<div className="flex items-center gap-3">
				<div className="flex-1 relative">
					<svg
						className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
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
						placeholder={t("customer.filters.searchPlaceholder") || "Search by order ID or address..."}
						className="w-full pl-10 pr-4 py-2 text-sm border border-orange-200/60 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white/80"
					/>
					{filters.search && (
						<button
							onClick={() => updateFilter("search", "")}
							className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					)}
				</div>
				<button
					onClick={() => setShowAdvanced(!showAdvanced)}
					className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
						showAdvanced 
							? "bg-orange-500 text-white" 
							: "bg-white border border-orange-200 text-amber-700 hover:bg-orange-50"
					}`}
				>
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
					</svg>
					{t("customer.filters.filters") || "Filters"}
					{hasActiveFilters && (
						<span className="w-2 h-2 bg-white rounded-full"></span>
					)}
				</button>
				{hasActiveFilters && (
					<button
						onClick={handleClearFilters}
						className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
					>
						{t("customer.filters.clearAll") || "Clear All"}
					</button>
				)}
			</div>

			{/* Status Dropdowns (Always visible) */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<label className="text-xs font-medium text-amber-600/70 uppercase tracking-wide mb-2 block">
						{t("customer.filters.orderStatus") || "Order Status"}
					</label>
					<select
						value={filters.orderStatus}
						onChange={(e) => updateFilter("orderStatus", e.target.value)}
						className="w-full px-3 py-2 text-sm border border-orange-200/60 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
					>
						<option value="all">
							{t("customer.filters.allStatuses") || "All Statuses"} ({orderStatusCounts.all})
						</option>
						<option value="pending">
							{getTranslatedStatusLabel("pending", t)} ({orderStatusCounts.pending})
						</option>
						<option value="assigned">
							{getTranslatedStatusLabel("assigned", t)} ({orderStatusCounts.assigned})
						</option>
						<option value="in_progress">
							{getTranslatedStatusLabel("in_progress", t)} ({orderStatusCounts.in_progress})
						</option>
						<option value="completed">
							{getTranslatedStatusLabel("completed", t)} ({orderStatusCounts.completed})
						</option>
						<option value="cancelled">
							{getTranslatedStatusLabel("cancelled", t)} ({orderStatusCounts.cancelled})
						</option>
					</select>
				</div>

				<div>
					<label className="text-xs font-medium text-amber-600/70 uppercase tracking-wide mb-2 block">
						{t("customer.filters.offerStatus") || "Offer Status"}
					</label>
					<select
						value={filters.offerStatus}
						onChange={(e) => updateFilter("offerStatus", e.target.value)}
						className="w-full px-3 py-2 text-sm border border-orange-200/60 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
					>
						<option value="all">
							{t("customer.filters.allOfferStatuses") || "All Offer Statuses"} ({offerStatusCounts.all})
						</option>
						<option value="offer_sent">
							{getTranslatedStatusLabel("offer_sent", t)} ({offerStatusCounts.offer_sent})
						</option>
						<option value="offer_accepted">
							{getTranslatedStatusLabel("offer_accepted", t)} ({offerStatusCounts.offer_accepted})
						</option>
						<option value="offer_rejected">
							{getTranslatedStatusLabel("offer_rejected", t)} ({offerStatusCounts.offer_rejected})
						</option>
					</select>
				</div>
			</div>

			{/* Advanced Filters */}
			{showAdvanced && (
				<div className="p-4 bg-orange-50/50 rounded-lg border border-orange-200/50 space-y-4">
					{/* Service Type Filter */}
					{serviceTypes.length > 0 && (
						<div>
							<label className="text-xs font-medium text-amber-600/70 uppercase tracking-wide mb-2 block">
								{t("customer.filters.serviceType") || "Service Type"}
							</label>
							<select
								value={filters.serviceType}
								onChange={(e) => updateFilter("serviceType", e.target.value)}
								className="w-full px-3 py-2 text-sm border border-orange-200/60 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
							>
								<option value="all">
									{t("customer.filters.allServices") || "All Services"}
								</option>
								{serviceTypes.map(service => (
									<option key={service.id} value={service.id}>
										{service.name}
									</option>
								))}
							</select>
						</div>
					)}

					{/* Date Filters */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label className="text-xs font-medium text-amber-600/70 uppercase tracking-wide mb-2 block">
								{t("customer.filters.createdFrom") || "Created From"}
							</label>
							<input
								type="date"
								value={filters.dateFrom}
								onChange={(e) => updateFilter("dateFrom", e.target.value)}
								className="w-full px-3 py-2 text-sm border border-orange-200/60 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
							/>
						</div>
						<div>
							<label className="text-xs font-medium text-amber-600/70 uppercase tracking-wide mb-2 block">
								{t("customer.filters.createdTo") || "Created To"}
							</label>
							<input
								type="date"
								value={filters.dateTo}
								onChange={(e) => updateFilter("dateTo", e.target.value)}
								className="w-full px-3 py-2 text-sm border border-orange-200/60 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label className="text-xs font-medium text-amber-600/70 uppercase tracking-wide mb-2 block">
								{t("customer.filters.serviceFrom") || "Service Date From"}
							</label>
							<input
								type="date"
								value={filters.preferredDateFrom}
								onChange={(e) => updateFilter("preferredDateFrom", e.target.value)}
								className="w-full px-3 py-2 text-sm border border-orange-200/60 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
							/>
						</div>
						<div>
							<label className="text-xs font-medium text-amber-600/70 uppercase tracking-wide mb-2 block">
								{t("customer.filters.serviceTo") || "Service Date To"}
							</label>
							<input
								type="date"
								value={filters.preferredDateTo}
								onChange={(e) => updateFilter("preferredDateTo", e.target.value)}
								className="w-full px-3 py-2 text-sm border border-orange-200/60 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

