"use client";

import { useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectAllOrders } from "@/store/selectors";
import { useTranslation } from "@/hooks/useTranslation";
import OrdersList from "./OrdersList";
import OrderFilters from "./OrderFilters";

export default function OrderManagement() {
	const { t } = useTranslation();
	const allOrders = useAppSelector(selectAllOrders);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [serviceFilter, setServiceFilter] = useState("all");

	// Filter orders based on search and filters
	const filteredOrders = allOrders.filter((order) => {
		const searchLower = searchQuery.toLowerCase();
		
		const matchesSearch =
			!searchQuery ||
			(order.id && order.id.toString().toLowerCase().includes(searchLower)) ||
			(order.customerName && order.customerName.toLowerCase().includes(searchLower)) ||
			(order.customer && order.customer.toLowerCase().includes(searchLower)) ||
			(order.fromAddress && order.fromAddress.toLowerCase().includes(searchLower)) ||
			(order.toAddress && order.toAddress.toLowerCase().includes(searchLower)) ||
			(order.addresses?.from && order.addresses.from.toLowerCase().includes(searchLower)) ||
			(order.address && order.address.toLowerCase().includes(searchLower)) ||
			(order.description && order.description.toLowerCase().includes(searchLower)) ||
			(order.roomDetails && order.roomDetails.toLowerCase().includes(searchLower));

		const matchesStatus =
			statusFilter === "all" || order.status === statusFilter;

		const matchesService =
			serviceFilter === "all" || 
			order.service === serviceFilter ||
			(order.services && order.services.includes(serviceFilter));

		return matchesSearch && matchesStatus && matchesService;
	});

	return (
		<div className="p-4 sm:p-6 lg:p-8">
			{/* Header Section */}
			<div className="mb-4 sm:mb-6">
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-3 sm:gap-0">
					<div>
						<h2 className="text-xl sm:text-2xl font-bold text-amber-900 mb-1">
							{t("superAdmin.orderManagement.title")}
						</h2>
						<p className="text-amber-700/70 text-xs sm:text-sm">
							{t("superAdmin.orderManagement.subtitle")}
						</p>
					</div>
				</div>

				{/* Search and Filters */}
				<div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
					<div className="flex-1 relative">
						<svg
							className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-amber-600/50"
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
							className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white border border-orange-200/60 rounded-lg sm:rounded-xl text-sm sm:text-base text-amber-900 placeholder-amber-600/40 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-300"
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

			{/* Orders Count */}
			<div className="mb-3 sm:mb-4">
				<h3 className="text-base sm:text-lg font-semibold text-amber-900">
					{t("superAdmin.orderManagement.ordersCount", { filtered: filteredOrders.length, total: allOrders.length })}
				</h3>
			</div>

			{/* Orders List */}
			<OrdersList orders={filteredOrders} />
		</div>
	);
}

