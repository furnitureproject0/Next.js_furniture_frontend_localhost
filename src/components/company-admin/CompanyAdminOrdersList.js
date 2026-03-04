"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	selectUser,
	selectCompanyOrders,
	selectOrders,
	selectPagination,
} from "@/store/selectors";
import { fetchCompanyAdminOrders } from "@/store/slices/ordersSlice";
import CompanyAdminOrderCard from "./CompanyAdminOrderCard";
import { useTranslation } from "@/hooks/useTranslation";

export default function CompanyAdminOrdersList({
	refreshTrigger = 0,
	filters,
	onFilterChange,
	type, // 'order', 'offer', or 'appointment'
}) {
	const { t, currentLanguage } = useTranslation();
	const dispatch = useAppDispatch();
	const user = useAppSelector(selectUser);
	const memoizedSelectCompanyOrders = useMemo(() => {
		return user?.company_id ? selectCompanyOrders(user.company_id) : () => [];
	}, [user?.company_id]);

	const companyOrders = useAppSelector(memoizedSelectCompanyOrders);
	const { isLoading } = useAppSelector(selectOrders);

	const [currentPage, setCurrentPage] = useState(1);
	const pagination = useAppSelector(selectPagination);

	// Debounce search to prevent excessive API calls
	const [debouncedSearch, setDebouncedSearch] = useState(filters.search);
	const [localRefresh, setLocalRefresh] = useState(0);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedSearch(filters.search);
			setCurrentPage(1); // Reset to first page on new search
		}, 500);
		return () => clearTimeout(handler);
	}, [filters.search]);

	// Fetch orders when filters change
	useEffect(() => {
		if (!user?.company_id) return;
		
		const apiFilters = {
			company_id: user.company_id,
			page: currentPage,
			limit: 10,
		};
		
		if (filters.status && filters.status !== 'all') apiFilters.status = filters.status;
		if (debouncedSearch) apiFilters.search = debouncedSearch;
		if (filters.service_id && filters.service_id !== 'all') apiFilters.service_id = filters.service_id;
		if (type) apiFilters.type = type;
		
		if (filters.selectedDate) {
			const date = new Date(filters.selectedDate);
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, '0');
			const day = String(date.getDate()).padStart(2, '0');
			apiFilters.execution_date = `${year}-${month}-${day}`;
		}

		dispatch(fetchCompanyAdminOrders(apiFilters));
	}, [dispatch, user?.company_id, debouncedSearch, filters.status, filters.selectedDate, filters.service_id, type, refreshTrigger, localRefresh, currentPage]);

	useEffect(() => {
		// Reset to page 1 when other filters change
		setCurrentPage(1);
	}, [filters.status, filters.selectedDate, filters.service_id, type]);

	// Use orders from state (they are already filtered by the API)
	const filteredOrders = companyOrders;

	const handlePageChange = (newPage) => {
		setCurrentPage(newPage);
		// Scroll to top of list container
		const container = document.getElementById('company-orders-list-container');
		if (container) {
			container.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	};

	return (
		<div id="company-orders-list-container" className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-primary-200/60 shadow-lg overflow-hidden">
			{/* Header */}
			<div className="p-4 sm:p-6 border-b border-primary-100/50 flex justify-between items-center bg-white/50">
				<div>
					<h2 className="text-lg sm:text-xl font-bold text-slate-800 capitalize">
						{type === 'order' && (t("orders.newOrders") || "New Orders")}
						{type === 'offer' && (t("orders.offers") || "Offers")}
						{type === 'appointment' && (t("orders.appointments") || "Appointments")}
						{!type && (t("orders.allOrders") || "All Orders")}
					</h2>
				</div>
				<button
					onClick={() => setLocalRefresh(prev => prev + 1)}
					className="group p-2 sm:px-4 sm:py-2 bg-white border border-primary-200 text-primary-600 rounded-lg hover:bg-primary-50 hover:border-primary-300 transition-all duration-200 shadow-sm flex items-center gap-2 cursor-pointer"
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

			<div className="p-4 sm:p-6">
				{isLoading ? (
					<div className="py-12 flex justify-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
					</div>
				) : filteredOrders.length === 0 ? (
					<div className="text-center py-8 sm:py-12 px-4">
						<div className="w-16 h-16 sm:w-24 sm:h-24 bg-primary-100/60 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
							<svg
								className="w-8 h-8 sm:w-12 sm:h-12 text-primary-400"
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
						<h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-1 sm:mb-2 text-pretty">
							{type === 'order' && (filters.selectedDate ? "No orders today" : "No orders found")}
							{type === 'offer' && (filters.selectedDate ? "No offers today" : "No offers found")}
							{type === 'appointment' && (filters.selectedDate ? "No appointments today" : "No appointments found")}
							{!type && (t("orders.noOrdersYet") || "No orders found")}
						</h3>
						<p className="text-sm sm:text-base text-slate-600/70 mb-4 sm:mb-6 max-w-md mx-auto">
							{t("siteAdmin.filters.tryAdjustingFilters") || "Try adjusting your filters or search criteria"}
						</p>
					</div>
				) : (
					<div className="space-y-3 sm:space-y-4">
						{filteredOrders.map((order) => (
							<CompanyAdminOrderCard
								key={order.id}
								order={order}
							/>
						))}

						{/* Pagination UI */}
						{pagination && pagination.totalPages > 1 && (
							<div className="flex items-center justify-between mt-8 pt-6 border-t border-primary-100/50">
								<p className="text-sm text-slate-500">
									{t("common.pagination.showingPage") || "Page"} <span className="font-semibold text-slate-800">{pagination.page}</span> {t("common.pagination.of") || "of"} <span className="font-semibold text-slate-800">{pagination.totalPages}</span>
								</p>
								<div className="flex items-center gap-2">
									<button
										disabled={pagination.page <= 1}
										onClick={() => handlePageChange(pagination.page - 1)}
										className="px-4 py-2 border border-primary-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-primary-50 hover:border-primary-300 disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-primary-200 transition-all cursor-pointer"
									>
										{t("common.buttons.previous") || "Previous"}
									</button>
									<button
										disabled={pagination.page >= pagination.totalPages}
										onClick={() => handlePageChange(pagination.page + 1)}
										className="px-4 py-2 border border-primary-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-primary-50 hover:border-primary-300 disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-primary-200 transition-all cursor-pointer"
									>
										{t("common.buttons.next") || "Next"}
									</button>
								</div>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
