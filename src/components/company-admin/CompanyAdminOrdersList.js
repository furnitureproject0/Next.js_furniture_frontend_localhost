"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	selectUser,
	selectCompanyOrders,
	selectOrders,
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
		if (!user?.company_id) return;
		
		dispatch(fetchCompanyAdminOrders({ company_id: user.company_id }));
	}, [dispatch, user?.company_id, refreshTrigger, localRefresh]);

	// Filter orders client-side (matching SiteAdminOrdersList pattern)
	const filteredOrders = (() => {
		let result = [...companyOrders];
		
		// Type filter (Orders, Offers, Appointments)
		if (type) {
			result = result.filter(order => {
				const status = (order.status || "").toLowerCase();
				const orderType = (order.orderType || order.order_type || order.type || "").toLowerCase();
				
				// Same logic as StatsCards
				const hasPricing = order.orderServices && order.orderServices.some(os => 
					(os.pricing_type && os.pricing_type !== 'custom') || 
					(os.offer && os.offer.id) ||
					(parseFloat(order.fixed_price) > 0) ||
					(parseFloat(order.min_total_price) > 0)
				);

				if (type === 'appointment') {
					return orderType === "appointment" || ["scheduled", "in_progress", "completed", "accepted_by_company", "offer_accepted"].includes(status);
				} else if (type === 'offer') {
					return orderType === "offer" || hasPricing || ["offer_sent", "offer_rejected", "assigned"].includes(status);
				} else if (type === 'order') {
					// Only show real pending orders that are NOT appointments or offers
					const isAppt = orderType === "appointment" || ["scheduled", "in_progress", "completed", "accepted_by_company", "offer_accepted"].includes(status);
					const isOffer = orderType === "offer" || hasPricing || ["offer_sent", "offer_rejected", "assigned"].includes(status);
					return !isAppt && !isOffer;
				}
				return true;
			});
		}

		// Status filter
		if (filters.status && filters.status !== 'all') {
			result = result.filter(order => order.status === filters.status);
		}

		// Search filter
		if (debouncedSearch) {
			const searchLower = debouncedSearch.toLowerCase();
			result = result.filter(order => {
				const orderId = order.id?.toString() || "";
				const customerName = (order.customerName || "").toLowerCase();
				const fromAddress = (order.fromAddress || order.addresses?.from || "").toLowerCase();
				const toAddress = (order.toAddress || order.addresses?.to || "").toLowerCase();
				
				return orderId.includes(searchLower) ||
					customerName.includes(searchLower) ||
					fromAddress.includes(searchLower) ||
					toAddress.includes(searchLower);
			});
		}

		// Service filter
		if (filters.service_id && filters.service_id !== 'all') {
			result = result.filter(order => {
				const serviceIds = order.servicesDetails?.map(s => s.id) || order.services || [];
				return serviceIds.includes(parseInt(filters.service_id));
			});
		}

		// Date filter
		if (filters.selectedDate) {
			const date = new Date(filters.selectedDate);
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, '0');
			const day = String(date.getDate()).padStart(2, '0');
			const dateStr = `${year}-${month}-${day}`;
			
			result = result.filter(order => {
				if (!order.preferred_date) return false;
				const orderDate = new Date(order.preferred_date);
				const orderYear = orderDate.getFullYear();
				const orderMonth = String(orderDate.getMonth() + 1).padStart(2, '0');
				const orderDay = String(orderDate.getDate()).padStart(2, '0');
				return `${orderYear}-${orderMonth}-${orderDay}` === dateStr;
			});
		}

		return result;
	})();

	return (
		<div className={`bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${
			type === 'order' ? 'border-emerald-200' : 
			type === 'offer' ? 'border-orange-200' : 
			type === 'appointment' ? 'border-blue-200' : 
			'border-primary-200/60'
		}`}>
				{/* Header */}
				<div className={`p-4 sm:p-5 border-b flex justify-between items-center ${
					type === 'order' ? 'bg-emerald-50/50 border-emerald-100' : 
					type === 'offer' ? 'bg-orange-50/50 border-orange-100' : 
					type === 'appointment' ? 'bg-blue-50/50 border-blue-100' : 
					'bg-primary-50/50 border-primary-100/50'
				}`}>
					<div>
						<h2 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
							{type === 'order' && (
								<>
									<div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
									{t("orders.allOrders") || "Orders"}
								</>
							)}
							{type === 'offer' && (
								<>
									<div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
									{t("orders.offers") || "Offers"}
								</>
							)}
							{type === 'appointment' && (
								<>
									<div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
									{t("orders.appointments") || "Appointments"}
								</>
							)}
							{!type && (t("orders.allOrders") || "Orders")}
						</h2>
						<p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 font-medium">
							<span className="bg-primary-50 px-1.5 py-0.5 rounded text-primary-700">
								{filteredOrders.length} {type === 'order' ? 'orders' : type === 'offer' ? 'offers' : type === 'appointment' ? 'appts' : 'orders'}
							</span>
							{filters.selectedDate && (
								<>
									<span className="text-slate-300">•</span>
									<span>{new Date(filters.selectedDate).toLocaleDateString(currentLanguage === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
								</>
							)}
						</p>
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

				{/* Orders List */}
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
						</div>
					)}
				</div>
		</div>
	);
}
