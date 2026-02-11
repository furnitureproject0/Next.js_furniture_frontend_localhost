"use client";

import { useState, useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/selectors";
import { selectCompanyOrders } from "@/store/selectors";
import CompanyOrderCard from "./CompanyOrderCard";
import CompanyAdminOrdersFilter from "./CompanyAdminOrdersFilter";
import { useTranslation } from "@/hooks/useTranslation";

const EmptyState = ({ companyOrders, t }) => (
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
			{companyOrders.length === 0
				? t("orders.noOrdersFound")
				: t("companyAdmin.filters.noMatchingOrders") || "No orders match your filters"}
		</h3>
		<p className="text-sm sm:text-base text-amber-700/70 mb-4 sm:mb-6 max-w-md mx-auto">
			{companyOrders.length === 0
				? t("orders.whenAssignedOrders")
				: t("companyAdmin.filters.tryAdjustingFilters") || "Try adjusting your filters"}
		</p>
	</div>
);

export default function OrdersList({ onSetPrice, onAssignTeam, openOrderId = null, onOrderModalClose }) {
	const { t } = useTranslation();
	const user = useAppSelector(selectUser);
	
	// Get orders for this company
	const companyOrders = useAppSelector((state) =>
		user?.company_id ? selectCompanyOrders(user.company_id)(state) : [],
	);

	const [filters, setFilters] = useState({
		orderStatus: "all",
		offerStatus: "all",
		serviceType: "all",
		teamAssigned: "all",
		search: "",
		dateFrom: "",
		dateTo: "",
		preferredDateFrom: "",
		preferredDateTo: "",
	});

	// Apply all filters
	const filteredOrders = useMemo(() => {
		let result = [...companyOrders];

		// Order Status filter
		if (filters.orderStatus !== "all") {
			result = result.filter(order => order.status === filters.orderStatus);
		}

		// Offer Status filter
		if (filters.offerStatus !== "all") {
			result = result.filter(order => order.status === filters.offerStatus);
		}

		// Service Type filter
		if (filters.serviceType !== "all") {
			result = result.filter(order => {
				const serviceIds = order.servicesDetails?.map(s => s.id) || order.services || [];
				return serviceIds.includes(parseInt(filters.serviceType));
			});
		}

		// Team Assignment filter
		if (filters.teamAssigned === "assigned") {
			result = result.filter(order => 
				order.offer?.assignments && order.offer?.assignments.length > 0
			);
		} else if (filters.teamAssigned === "unassigned") {
			result = result.filter(order => 
				!order.offer?.assignments || order.offer?.assignments.length === 0
			);
		}

		// Search filter
		if (filters.search) {
			const searchLower = filters.search.toLowerCase();
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

		// Created date range filter
		if (filters.dateFrom || filters.dateTo) {
			result = result.filter(order => {
				const createdDate = new Date(order.createdAt);
				const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
				const toDate = filters.dateTo ? new Date(filters.dateTo + "T23:59:59") : null;
				
				if (fromDate && createdDate < fromDate) return false;
				if (toDate && createdDate > toDate) return false;
				return true;
			});
		}

		// Preferred service date range filter
		if (filters.preferredDateFrom || filters.preferredDateTo) {
			result = result.filter(order => {
				if (!order.preferred_date) return false;
				
				const preferredDate = new Date(order.preferred_date);
				const fromDate = filters.preferredDateFrom ? new Date(filters.preferredDateFrom) : null;
				const toDate = filters.preferredDateTo ? new Date(filters.preferredDateTo + "T23:59:59") : null;
				
				if (fromDate && preferredDate < fromDate) return false;
				if (toDate && preferredDate > toDate) return false;
				return true;
			});
		}

		return result;
	}, [companyOrders, filters]);

	const handleFilterChange = (newFilters) => {
		setFilters(newFilters);
	};

	return (
		<div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-orange-200/60 shadow-lg">
			{/* Header */}
			<div className="p-4 sm:p-6 border-b border-orange-100/50">
				<div className="mb-4">
					<h2 className="text-lg sm:text-xl font-bold text-amber-900">
						{t("orders.assignedOrders")}
					</h2>
					<p className="text-xs sm:text-sm text-amber-700/70 mt-1">
						{t("orders.managePricing")}
					</p>
				</div>
				
				{/* Filters */}
				<CompanyAdminOrdersFilter 
					orders={companyOrders}
					onFilterChange={handleFilterChange}
					initialFilters={filters}
				/>
			</div>

			{/* Orders List */}
			<div className="p-4 sm:p-6">
				{filteredOrders.length === 0 ? (
					<EmptyState
						companyOrders={companyOrders}
						t={t}
					/>
				) : (
					<div className="space-y-3 sm:space-y-4">
						{filteredOrders.map((order) => (
							<CompanyOrderCard
								key={order.id}
								order={order}
								onSetPrice={onSetPrice}
								onAssignTeam={onAssignTeam}
								openOrderId={openOrderId}
								onOrderModalClose={onOrderModalClose}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
