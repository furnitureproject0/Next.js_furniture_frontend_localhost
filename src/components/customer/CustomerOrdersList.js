"use client";

import { useState, useMemo } from "react";
import { ORDER_STATUSES, UI_STATUSES, STATUS_LABELS } from "@/constants/orderConstants";
import CustomerOrderCard from "./CustomerOrderCard";
import { useTranslation } from "@/hooks/useTranslation";

export default function CustomerOrdersList({ orders = [], customerId, openOrderId = null, onOrderModalClose }) {
	const { t } = useTranslation();
	const [selectedStatus, setSelectedStatus] = useState("all");
	const [searchQuery, setSearchQuery] = useState("");

	// Filter orders to show only this customer's orders
	const customerOrders = useMemo(() => {
		if (!customerId) return orders;
		return orders.filter(order => order.customerId === customerId);
	}, [orders, customerId]);

	const statusFilters = [
		{ value: "all", label: t("orders.allOrders") },
		{ value: ORDER_STATUSES.PENDING, label: t(`orders.status.${ORDER_STATUSES.PENDING}`) },
		{ value: UI_STATUSES.OFFER_SENT, label: t(`orders.status.${UI_STATUSES.OFFER_SENT}`) },
		{ value: UI_STATUSES.OFFER_ACCEPTED, label: t(`orders.status.${UI_STATUSES.OFFER_ACCEPTED}`) },
		{ value: ORDER_STATUSES.IN_PROGRESS, label: t(`orders.status.${ORDER_STATUSES.IN_PROGRESS}`) },
		{ value: ORDER_STATUSES.COMPLETED, label: t(`orders.status.${ORDER_STATUSES.COMPLETED}`) },
		{ value: ORDER_STATUSES.CANCELLED, label: t(`orders.status.${ORDER_STATUSES.CANCELLED}`) },
	];

	const filteredOrders = useMemo(() => {
		return customerOrders.filter((order) => {
			const matchesStatus =
				selectedStatus === "all" || order.status === selectedStatus;
			const matchesSearch =
				order.id.toString().includes(searchQuery) ||
				(order.fromAddress || order.addresses?.from || "").toLowerCase().includes(searchQuery.toLowerCase());
			return matchesStatus && matchesSearch;
		});
	}, [customerOrders, selectedStatus, searchQuery]);

	return (
		<div className="space-y-4 sm:space-y-6">
			{/* Filters */}
			<div className="bg-white/60 backdrop-blur-sm border border-orange-200/60 rounded-xl p-4 sm:p-6">
				<div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
					{/* Search */}
					<div className="flex-1 min-w-0">
						<div className="relative">
							<svg
								className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-amber-600/60"
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
								placeholder={t("orders.searchByOrderId")}
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80"
							/>
						</div>
					</div>

					{/* Status Filter */}
					<div className="w-full sm:w-auto sm:min-w-[200px] lg:w-64">
						<select
							value={selectedStatus}
							onChange={(e) => setSelectedStatus(e.target.value)}
							className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 cursor-pointer"
						>
							{statusFilters.map((filter) => (
								<option key={filter.value} value={filter.value}>
									{filter.label}
								</option>
							))}
						</select>
					</div>
				</div>
			</div>

			{/* Orders List */}
			<div className="space-y-3 sm:space-y-4">
				{filteredOrders.length === 0 ? (
					<div className="bg-white/60 backdrop-blur-sm border border-orange-200/60 rounded-xl p-8 sm:p-12 text-center">
						<svg
							className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-amber-600/40"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
							/>
						</svg>
						<h3 className="text-base sm:text-lg font-semibold text-amber-900 mb-1 sm:mb-2">
							{t("orders.noOrdersFound")}
						</h3>
						<p className="text-sm sm:text-base text-amber-700/70">
							{searchQuery
								? t("orders.tryAdjustingSearch")
								: t("orders.createFirstOrder")}
						</p>
					</div>
				) : (
					filteredOrders.map((order) => (
						<CustomerOrderCard 
							key={order.id} 
							order={order} 
							openOrderId={openOrderId}
							onOrderModalClose={onOrderModalClose}
						/>
					))
				)}
			</div>
		</div>
	);
}

