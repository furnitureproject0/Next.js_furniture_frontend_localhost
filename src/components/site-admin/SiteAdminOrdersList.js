"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	selectAllOrders,
	selectOrders,
} from "@/store/selectors";
import { fetchSiteAdminOrders } from "@/store/slices/ordersSlice";
import SiteAdminOrderCard from "./SiteAdminOrderCard";
import SiteAdminOrdersFilter from "./SiteAdminOrdersFilter";
import { useTranslation } from "@/hooks/useTranslation";

export default function SiteAdminOrdersList({
	onAssignCompany,
	refreshTrigger = 0,
}) {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const orders = useAppSelector(selectAllOrders);
	const { isLoading } = useAppSelector(selectOrders);
	
	const [filters, setFilters] = useState({
		status: "", 
		search: "",
		selectedDate: null,
		service_id: "",
	});

	// Debounce search to prevent excessive API calls
	const [debouncedSearch, setDebouncedSearch] = useState(filters.search);
	const [localRefresh, setLocalRefresh] = useState(0);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedSearch(filters.search);
		}, 500);
		return () => clearTimeout(handler);
	}, [filters.search]);

	// Fetch orders when filters change
	useEffect(() => {
		// Format filters for API
		const apiFilters = {};
		
		if (filters.status && filters.status !== 'all') apiFilters.status = filters.status;
		if (debouncedSearch) apiFilters.search = debouncedSearch;
		if (filters.service_id && filters.service_id !== 'all') apiFilters.service_id = filters.service_id;
		
		if (filters.selectedDate) {
			const date = new Date(filters.selectedDate);
			// Format as YYYY-MM-DD
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, '0');
			const day = String(date.getDate()).padStart(2, '0');
			apiFilters.date = `${year}-${month}-${day}`;
		}

		dispatch(fetchSiteAdminOrders(apiFilters));
	}, [dispatch, debouncedSearch, filters.status, filters.selectedDate, filters.service_id, refreshTrigger, localRefresh]);

	const handleFilterChange = (newFilters) => {
		setFilters(prev => ({ ...prev, ...newFilters }));
	};

	const handleAssignCompany = (order) => {
		onAssignCompany(order);
	};

	return (
		<div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-orange-200/60 shadow-lg">
			{/* Header */}
			<div className="p-4 sm:p-6 border-b border-orange-100/50">
				<div className="mb-4 flex justify-between items-start">
					<div>
						<h2 className="text-lg sm:text-xl font-bold text-amber-900">
							{t("orders.allOrders")}
						</h2>
						<p className="text-xs sm:text-sm text-amber-700/70 mt-1">
							{t("orders.manageAndAssign")}
						</p>
					</div>
					<button
						onClick={() => setLocalRefresh(prev => prev + 1)}
						className="group p-2 sm:px-4 sm:py-2 bg-white border border-orange-200 text-orange-600 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-all duration-200 shadow-sm flex items-center gap-2 cursor-pointer"
						title={t("common.refresh") || "Refresh"}
					>
						<svg 
							className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:rotate-180 duration-500" 
							fill="none" 
							stroke="currentColor" 
							viewBox="0 0 24 24"
						>
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
						</svg>
						<span className="text-sm font-medium hidden sm:inline">{t("common.refresh") || "Refresh"}</span>
					</button>
				</div>
				
				{/* Filters */}
				<SiteAdminOrdersFilter 
					onFilterChange={handleFilterChange}
					initialFilters={filters}
				/>
			</div>

			{/* Orders List */}
			<div className="p-4 sm:p-6">
				{isLoading ? (
					<div className="py-12 flex justify-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
					</div>
				) : orders.length === 0 ? (
					<div className="text-center py-8 sm:py-12 px-4">
						<div className="w-16 h-16 sm:w-24 sm:h-24 bg-orange-100/60 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
							<svg
								className="w-8 h-8 sm:w-12 sm:h-12 text-orange-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1.5}
									d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/>
							</svg>
						</div>
						<h3 className="text-lg sm:text-xl font-semibold text-amber-900 mb-1 sm:mb-2">
							{t("orders.noOrdersYet") || "No orders found"}
						</h3>
						<p className="text-sm sm:text-base text-amber-700/70 mb-4 sm:mb-6 max-w-md mx-auto">
							{t("siteAdmin.filters.tryAdjustingFilters") || "Try adjusting your filters or search criteria"}
						</p>
					</div>
				) : (
					<div className="space-y-3 sm:space-y-4">
						{orders.map((order) => (
							<SiteAdminOrderCard
								key={order.id}
								order={order}
								onAssignCompany={() => handleAssignCompany(order)}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
