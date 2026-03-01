"use client";
import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectAllOrders } from "@/store/selectors";
import { fetchSiteAdminOrders } from "@/store/slices/ordersSlice";
import { useTranslation } from "@/hooks/useTranslation";
import OrdersList from "./OrdersList";
import OrderFilters from "./OrderFilters";
import SiteAdminStatsCards from "@/components/site-admin/SiteAdminStatsCards";

export default function OrderManagement() {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const allOrders = useAppSelector(selectAllOrders);
	const isLoading = useAppSelector((state) => state.orders.isLoading);
	const error = useAppSelector((state) => state.orders.error);
	
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [serviceFilter, setServiceFilter] = useState("all");
	const [selectedDate, setSelectedDate] = useState(null);

	useEffect(() => {
		const delayDebounceFn = setTimeout(() => {
			// Send minimal parameters to backend to avoid schema errors
			// Frontend handles: service filtering, pagination, date filtering, sorting
			// Backend handles: status filtering and search only
			const backendFilters = {};
			
			// Status filter: pass to backend
			if (statusFilter && statusFilter !== "all") {
				backendFilters.status = statusFilter;
			}
			
			// Search: pass to backend
			if (searchQuery && searchQuery.trim()) {
				backendFilters.search = searchQuery.trim();
			}
			
			// Service, date, pagination filters are handled on frontend
			// This reduces backend queries and avoids column errors
			dispatch(fetchSiteAdminOrders(backendFilters));
		}, 500);

		return () => clearTimeout(delayDebounceFn);
	}, [dispatch, statusFilter, searchQuery]);

	// Filter orders based on search and filters (frontend fallback/additional filtering)
	const filteredOrders = allOrders.filter((order) => {
		const searchLower = searchQuery.toLowerCase();
		
		const matchesSearch =
			!searchQuery ||
			(order.id && order.id.toString().toLowerCase().includes(searchLower)) ||
			(order.customerName && order.customerName.toLowerCase().includes(searchLower)) ||
			(order.fromAddress && order.fromAddress.toLowerCase().includes(searchLower)) ||
			(order.toAddress && order.toAddress.toLowerCase().includes(searchLower));

		const matchesStatus =
			statusFilter === "all" || order.status === statusFilter;

		const matchesService =
			serviceFilter === "all" || 
			order.service === serviceFilter ||
			(order.services && order.services.includes(serviceFilter));

		return matchesSearch && matchesStatus && matchesService;
	});

	return (
		<div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
			{/* Header Section */}
			<div>
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
					<div>
						<h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1">
							{t("superAdmin.orderManagement.title")}
						</h2>
						<p className="text-slate-600/70 text-xs sm:text-sm">
							{t("superAdmin.orderManagement.subtitle")}
						</p>
					</div>
				</div>

				{/* Search and Filters */}
				<div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center bg-white/50 backdrop-blur-sm p-3 rounded-xl border border-primary-100/50 mb-6">
					<div className="flex-1 relative">
						<svg
							className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-primary-600/50"
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
							placeholder={t("superAdmin.orderManagement.searchPlaceholder")}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base border border-primary-200/60 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/40 outline-none"
						/>
					</div>
					<OrderFilters
						statusFilter={statusFilter}
						setStatusFilter={setStatusFilter}
						serviceFilter={serviceFilter}
						setServiceFilter={setServiceFilter}
					/>
				</div>
			</div>

			{/* Column Layout (Today/Selected Date Stats) */}
			<div className="space-y-4">
				<h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
					<svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
					</svg>
					{t("siteAdmin.dashboard.overview") || "Daily Overview"}
				</h3>
				<SiteAdminStatsCards selectedDate={selectedDate} />
			</div>

			{/* Loading/Error State */}
			{(isLoading && allOrders.length === 0) ? (
				<div className="flex items-center justify-center py-20">
					<div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
				</div>
			) : error ? (
				<div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-center">
					{error}
				</div>
			) : (
				/* Orders Count and List */
				<div className="space-y-4 pt-6 border-t border-primary-100">
					<div className="flex items-center justify-between">
						<h3 className="text-base sm:text-lg font-semibold text-slate-800">
							{t("superAdmin.orderManagement.allOrders") || "All Orders List"}
						</h3>
						<span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-bold">
							{filteredOrders.length} {t("common.items")}
						</span>
					</div>
					<OrdersList orders={filteredOrders} />
				</div>
			)}
		</div>
	);
}

