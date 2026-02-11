"use client";

import { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { updateOrder } from "@/store/slices/ordersSlice";
import { useTranslation } from "@/hooks/useTranslation";
import { getTranslatedStatusLabel } from "@/utils/i18nUtils";

const getStatusColor = (status) => {
	switch (status) {
		case "pending":
			return "bg-yellow-100 text-yellow-800 border-yellow-200";
		case "assigned":
			return "bg-blue-100 text-blue-800 border-blue-200";
		case "scheduled":
			return "bg-purple-100 text-purple-800 border-purple-200";
		case "in-progress":
			return "bg-orange-100 text-orange-800 border-orange-200";
		case "completed":
			return "bg-green-100 text-green-800 border-green-200";
		case "cancelled":
			return "bg-red-100 text-red-800 border-red-200";
		default:
			return "bg-gray-100 text-gray-800 border-gray-200";
	}
};

const OrderCard = ({ order, t }) => {
	return (
		<div className="bg-white border border-orange-200/40 rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 hover:shadow-md transition-shadow">
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-3 sm:gap-0">
				{/* Order Header */}
				<div className="flex items-start gap-3 sm:gap-4 flex-1 w-full sm:w-auto">
					<div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
						<svg
							className="w-5 h-5 sm:w-6 sm:h-6 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							/>
						</svg>
					</div>
					<div className="flex-1 min-w-0">
						<div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
							<h3 className="text-sm sm:text-base font-semibold text-amber-900">
								Order #{order.id}
							</h3>
							<span
								className={`px-2 sm:px-2.5 py-0.5 sm:py-1 text-xs font-medium rounded-full border ${getStatusColor(
									order.status,
								)}`}
							>
								{order.status.toUpperCase()}
							</span>
						</div>
						<div className="space-y-0.5 sm:space-y-1">
							<p className="text-xs sm:text-sm text-amber-700/90">
								<span className="font-medium">{t("superAdmin.orderDetails.customer")}:</span>{" "}
								{order.customer || t("common.nA")}
							</p>
							<p className="text-xs sm:text-sm text-amber-700/70">
								<span className="font-medium">{t("superAdmin.orderDetails.service")}:</span>{" "}
								{order.service || t("common.nA")}
							</p>
						</div>
					</div>
				</div>

				{/* Right Side - Status Badge Larger */}
				<div className="text-left sm:text-right w-full sm:w-auto">
					<p className="text-xs text-amber-600/60 mb-1">{t("superAdmin.orderDetails.status")}</p>
					<p
						className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold rounded-lg inline-block ${getStatusColor(
							order.status,
						)}`}
					>
						{getTranslatedStatusLabel(order.status, t)}
					</p>
				</div>
			</div>

			{/* Order Details Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 pt-3 sm:pt-4 border-t border-orange-100">
				<div>
					<p className="text-xs text-amber-600/60 mb-1">{t("superAdmin.orderDetails.customer")}</p>
					<p className="text-sm font-medium text-amber-900">
						{order.customer || t("common.nA")}
					</p>
				</div>
				<div>
					<p className="text-xs text-amber-600/60 mb-1">{t("superAdmin.orderDetails.service")}</p>
					<p className="text-sm font-medium text-amber-900">
						{order.service || t("common.nA")}
					</p>
				</div>
				<div>
					<p className="text-xs text-amber-600/60 mb-1">{t("superAdmin.orderDetails.schedule")}</p>
					<p className="text-sm font-medium text-amber-900">
						{order.date || t("superAdmin.orderDetails.notScheduled")}
					</p>
				</div>
				<div>
					<p className="text-xs text-amber-600/60 mb-1">{t("superAdmin.orderDetails.price")}</p>
					<p className="text-sm font-medium text-amber-900">
						{order.price
							? `CHF ${order.price.toLocaleString()}`
							: t("superAdmin.orderDetails.pending")}
					</p>
				</div>
			</div>

			{/* Additional Details */}
			{(order.address || order.description) && (
				<div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-orange-100 space-y-2">
					{order.address && (
						<div className="flex items-start gap-2 text-xs sm:text-sm">
							<svg
								className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600/60 mt-0.5 flex-shrink-0"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
								/>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
								/>
							</svg>
							<span className="text-amber-700/70">
								{order.address}
							</span>
						</div>
					)}
					{order.description && (
						<div className="flex items-start gap-2 text-xs sm:text-sm">
							<svg
								className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600/60 mt-0.5 flex-shrink-0"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 6h16M4 12h16M4 18h7"
								/>
							</svg>
							<span className="text-amber-700/70">
								{order.description}
							</span>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default function OrdersList({ orders }) {
	const { t } = useTranslation();
	if (orders.length === 0) {
		return (
			<div className="bg-white border border-orange-200/40 rounded-lg sm:rounded-xl p-8 sm:p-10 lg:p-12 text-center">
				<svg
					className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-amber-600/30 mx-auto mb-3 sm:mb-4"
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
				<p className="text-amber-700/70 text-base sm:text-lg">
					{t("superAdmin.orderManagement.noOrdersFound")}
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-3 sm:space-y-4">
			{orders.map((order) => (
				<OrderCard key={order.id} order={order} t={t} />
			))}
		</div>
	);
}

